package auth_test

import (
	"context"
	"errors"
	"testing"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

type mockStore struct {
	obtenerUsuarioPorEmailFn func(ctx context.Context, email string) (*auth.UsuarioAuth, error)
	obtenerUsuarioPorIDFn    func(ctx context.Context, id string) (*auth.UsuarioAuth, error)
	guardarTokenFn           func(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error)
	obtenerTokenFn           func(ctx context.Context, token string) (*auth.MagicToken, error)
	marcarTokenUsadoFn       func(ctx context.Context, tokenID string) error
}

func (m *mockStore) ObtenerUsuarioPorEmail(ctx context.Context, email string) (*auth.UsuarioAuth, error) {
	return m.obtenerUsuarioPorEmailFn(ctx, email)
}
func (m *mockStore) ObtenerUsuarioPorID(ctx context.Context, id string) (*auth.UsuarioAuth, error) {
	return m.obtenerUsuarioPorIDFn(ctx, id)
}
func (m *mockStore) GuardarToken(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error) {
	return m.guardarTokenFn(ctx, usuarioID, token, expiresAt)
}
func (m *mockStore) ObtenerToken(ctx context.Context, token string) (*auth.MagicToken, error) {
	return m.obtenerTokenFn(ctx, token)
}
func (m *mockStore) MarcarTokenUsado(ctx context.Context, tokenID string) error {
	return m.marcarTokenUsadoFn(ctx, tokenID)
}

type mockEmailSender struct {
	enviarMagicLinkFn func(ctx context.Context, email, link string) error
}

func (m *mockEmailSender) EnviarMagicLink(ctx context.Context, email, link string) error {
	return m.enviarMagicLinkFn(ctx, email, link)
}

func TestGenerarYValidarJWT(t *testing.T) {
	secreto := "secreto-de-prueba"
	claims := &auth.Claims{
		UsuarioID: "user-123",
		TenantID:  "tenant-456",
		Rol:       "admin",
	}

	token, err := auth.GenerarJWT(claims, secreto)
	if err != nil {
		t.Fatalf("GenerarJWT error: %v", err)
	}
	if token == "" {
		t.Fatal("token vacío")
	}

	recuperadas, err := auth.ValidarJWT(token, secreto)
	if err != nil {
		t.Fatalf("ValidarJWT error: %v", err)
	}
	if recuperadas.UsuarioID != claims.UsuarioID {
		t.Errorf("UsuarioID: got %q, want %q", recuperadas.UsuarioID, claims.UsuarioID)
	}
	if recuperadas.TenantID != claims.TenantID {
		t.Errorf("TenantID: got %q, want %q", recuperadas.TenantID, claims.TenantID)
	}
	if recuperadas.Rol != claims.Rol {
		t.Errorf("Rol: got %q, want %q", recuperadas.Rol, claims.Rol)
	}
}

func TestValidarJWT_TokenInvalido(t *testing.T) {
	_, err := auth.ValidarJWT("token.invalido.firma", "secreto")
	if err == nil {
		t.Fatal("esperaba error con token inválido")
	}
}

func TestValidarJWT_ClaimsIncompletos(t *testing.T) {
	secreto := "test-secreto"
	tok, _ := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, jwtlib.MapClaims{
		"exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secreto))
	_, err := auth.ValidarJWT(tok, secreto)
	if err == nil {
		t.Fatal("esperaba error por claims incompletos")
	}
}

func TestSolicitarLink_Exitoso(t *testing.T) {
	var emailEnviado string
	var linkEnviado string

	store := &mockStore{
		obtenerUsuarioPorEmailFn: func(ctx context.Context, email string) (*auth.UsuarioAuth, error) {
			return &auth.UsuarioAuth{ID: "usr-1", TenantID: "ten-1", Email: email, Rol: "admin"}, nil
		},
		guardarTokenFn: func(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error) {
			return "tok-id-1", nil
		},
	}
	emailMock := &mockEmailSender{
		enviarMagicLinkFn: func(ctx context.Context, email, link string) error {
			emailEnviado = email
			linkEnviado = link
			return nil
		},
	}

	svc := auth.NuevoService(store, emailMock)
	link, err := svc.SolicitarLink(context.Background(), "admin@mibar.com")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if link == "" {
		t.Error("se esperaba que SolicitarLink devolviera el link generado")
	}

	if emailEnviado != "admin@mibar.com" {
		t.Errorf("email enviado incorrecto: %q", emailEnviado)
	}
	if linkEnviado == "" {
		t.Error("se esperaba un link de acceso generado")
	}
}

func TestSolicitarLink_UsuarioNoEncontrado_Silencioso(t *testing.T) {
	store := &mockStore{
		obtenerUsuarioPorEmailFn: func(ctx context.Context, email string) (*auth.UsuarioAuth, error) {
			return nil, errors.New("no encontrado")
		},
	}
	emailMock := &mockEmailSender{}

	svc := auth.NuevoService(store, emailMock)
	// Para seguridad y evitar enumerar correos, SolicitarLink retorna nil (exitoso) aunque no exista el usuario.
	link, err := svc.SolicitarLink(context.Background(), "no-existe@mibar.com")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if link != "" {
		t.Errorf("no se debe generar link para un email inexistente, obtenido: %q", link)
	}
}

func TestSolicitarLink_NormalizaEmail(t *testing.T) {
	var emailConsultado string

	store := &mockStore{
		obtenerUsuarioPorEmailFn: func(ctx context.Context, email string) (*auth.UsuarioAuth, error) {
			emailConsultado = email
			return &auth.UsuarioAuth{ID: "usr-1", TenantID: "ten-1", Email: email, Rol: "admin"}, nil
		},
		guardarTokenFn: func(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error) {
			return "tok-id-1", nil
		},
	}
	emailMock := &mockEmailSender{
		enviarMagicLinkFn: func(ctx context.Context, email, link string) error { return nil },
	}

	svc := auth.NuevoService(store, emailMock)
	if _, err := svc.SolicitarLink(context.Background(), "  Admin@MiBar.COM "); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}

	if emailConsultado != "admin@mibar.com" {
		t.Errorf("email no normalizado: got %q, want %q", emailConsultado, "admin@mibar.com")
	}
}

func TestVerificarToken_Exitoso(t *testing.T) {
	store := &mockStore{
		obtenerTokenFn: func(ctx context.Context, token string) (*auth.MagicToken, error) {
			return &auth.MagicToken{
				ID:        "tok-1",
				UsuarioID: "usr-1",
				Token:     token,
				ExpiresAt: time.Now().Add(10 * time.Minute),
				UsedAt:    nil,
			}, nil
		},
		marcarTokenUsadoFn: func(ctx context.Context, tokenID string) error {
			return nil
		},
		obtenerUsuarioPorIDFn: func(ctx context.Context, id string) (*auth.UsuarioAuth, error) {
			return &auth.UsuarioAuth{ID: id, TenantID: "ten-1", Email: "admin@mibar.com", Rol: "admin"}, nil
		},
	}

	svc := auth.NuevoService(store, &mockEmailSender{})
	usr, err := svc.VerificarToken(context.Background(), "algun-token")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}

	if usr.ID != "usr-1" {
		t.Errorf("usuario retornado incorrecto: got %q, want %q", usr.ID, "usr-1")
	}
}

func TestVerificarToken_Errores(t *testing.T) {
	// 1. Token inexistente
	store1 := &mockStore{
		obtenerTokenFn: func(ctx context.Context, token string) (*auth.MagicToken, error) {
			return nil, errors.New("no encontrado")
		},
	}
	svc1 := auth.NuevoService(store1, &mockEmailSender{})
	_, err := svc1.VerificarToken(context.Background(), "invalido")
	if err == nil || err.Error() != "token inválido" {
		t.Errorf("se esperaba error de token inválido, obtenido: %v", err)
	}

	// 2. Token ya usado
	ahora := time.Now()
	store2 := &mockStore{
		obtenerTokenFn: func(ctx context.Context, token string) (*auth.MagicToken, error) {
			return &auth.MagicToken{
				ID:        "tok-1",
				UsuarioID: "usr-1",
				Token:     token,
				ExpiresAt: time.Now().Add(10 * time.Minute),
				UsedAt:    &ahora,
			}, nil
		},
	}
	svc2 := auth.NuevoService(store2, &mockEmailSender{})
	_, err = svc2.VerificarToken(context.Background(), "ya-usado")
	if err == nil || err.Error() != "token ya usado" {
		t.Errorf("se esperaba error de token ya usado, obtenido: %v", err)
	}

	// 3. Token expirado
	store3 := &mockStore{
		obtenerTokenFn: func(ctx context.Context, token string) (*auth.MagicToken, error) {
			return &auth.MagicToken{
				ID:        "tok-1",
				UsuarioID: "usr-1",
				Token:     token,
				ExpiresAt: time.Now().Add(-5 * time.Minute), // Expiró hace 5 minutos
				UsedAt:    nil,
			}, nil
		},
	}
	svc3 := auth.NuevoService(store3, &mockEmailSender{})
	_, err = svc3.VerificarToken(context.Background(), "expirado")
	if err == nil || err.Error() != "token expirado" {
		t.Errorf("se esperaba error de token expirado, obtenido: %v", err)
	}
}
