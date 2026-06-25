package usuario_test

import (
	"context"
	"errors"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/usuario"
)

type mockStore struct {
	crearFn           func(ctx context.Context, tenantID string, input usuario.UsuarioInput) (*usuario.Usuario, error)
	listarFn          func(ctx context.Context, tenantID string) ([]usuario.Usuario, error)
	eliminarFn        func(ctx context.Context, id string, tenantID string) error
	crearMagicTokenFn func(ctx context.Context, usuarioID string) (string, error)
}

func (m *mockStore) Crear(ctx context.Context, tenantID string, input usuario.UsuarioInput) (*usuario.Usuario, error) {
	return m.crearFn(ctx, tenantID, input)
}
func (m *mockStore) Listar(ctx context.Context, tenantID string) ([]usuario.Usuario, error) {
	return m.listarFn(ctx, tenantID)
}
func (m *mockStore) Eliminar(ctx context.Context, id string, tenantID string) error {
	return m.eliminarFn(ctx, id, tenantID)
}
func (m *mockStore) CrearMagicToken(ctx context.Context, usuarioID string) (string, error) {
	return m.crearMagicTokenFn(ctx, usuarioID)
}

func TestInvitarUsuario_Exitoso(t *testing.T) {
	store := &mockStore{
		crearFn: func(ctx context.Context, tenantID string, input usuario.UsuarioInput) (*usuario.Usuario, error) {
			return &usuario.Usuario{ID: "u-1", TenantID: tenantID, Email: input.Email, Nombre: input.Nombre, Rol: input.Rol}, nil
		},
		crearMagicTokenFn: func(ctx context.Context, usuarioID string) (string, error) {
			return "tok-12345", nil
		},
	}
	svc := usuario.NuevoService(store)
	result, err := svc.Invitar(context.Background(), "t-1", usuario.UsuarioInput{
		Nombre: "Juan Perez",
		Email:  "juan@mibar.com",
		Rol:    "mozo",
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if result.Usuario.Nombre != "Juan Perez" {
		t.Errorf("got %q, want %q", result.Usuario.Nombre, "Juan Perez")
	}
	if result.MagicLink == "" {
		t.Error("se esperaba link de invitacion generado")
	}
}

func TestInvitarUsuario_ValidationErrors(t *testing.T) {
	svc := usuario.NuevoService(&mockStore{})

	// 1. Nombre vacío
	_, err := svc.Invitar(context.Background(), "t-1", usuario.UsuarioInput{
		Email: "juan@mibar.com",
		Rol:    "mozo",
	})
	if err == nil || !errors.Is(err, usuario.ErrValidation) {
		t.Errorf("se esperaba error de validacion por nombre vacio, obtenido: %v", err)
	}

	// 2. Email vacío
	_, err = svc.Invitar(context.Background(), "t-1", usuario.UsuarioInput{
		Nombre: "Juan Perez",
		Rol:    "mozo",
	})
	if err == nil || !errors.Is(err, usuario.ErrValidation) {
		t.Errorf("se esperaba error de validacion por email vacio, obtenido: %v", err)
	}

	// 3. Rol inválido
	_, err = svc.Invitar(context.Background(), "t-1", usuario.UsuarioInput{
		Nombre: "Juan Perez",
		Email:  "juan@mibar.com",
		Rol:    "gerente",
	})
	if err == nil || !errors.Is(err, usuario.ErrValidation) {
		t.Errorf("se esperaba error de validacion por rol invalido, obtenido: %v", err)
	}
}
