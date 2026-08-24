package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	store Store
	email EmailSender
}

func NuevoService(s Store, e EmailSender) *Service { return &Service{store: s, email: e} }

// SolicitarLink genera el magic link y lo envía por email.
// Devuelve el link generado para que el handler pueda exponerlo en entornos de
// desarrollo sin proveedor de email. Si el email no está registrado devuelve
// ("", nil): no revelamos si la cuenta existe.
func (svc *Service) SolicitarLink(ctx context.Context, email string) (string, error) {
	email = NormalizarEmail(email)

	usuario, err := svc.store.ObtenerUsuarioPorEmail(ctx, email)
	if err != nil {
		// No revelamos si el email existe o no — siempre respondemos OK
		slog.Warn("magic link solicitado para email no registrado", "email", email)
		return "", nil
	}

	token, err := generarTokenAleatorio()
	if err != nil {
		return "", fmt.Errorf("error generando token: %w", err)
	}

	expiresAt := time.Now().Add(15 * time.Minute)
	if _, err := svc.store.GuardarToken(ctx, usuario.ID, token, expiresAt); err != nil {
		return "", err
	}

	link := ConstruirLinkVerificacion(token)

	if err := svc.email.EnviarMagicLink(ctx, email, link); err != nil {
		slog.ErrorContext(ctx, "error enviando magic link", "email", email, "err", err)
		return "", fmt.Errorf("error enviando email: %w", err)
	}

	return link, nil
}

// NormalizarEmail deja los emails en una forma canónica (minúsculas, sin espacios)
// para que "Admin@Bar.com" y "admin@bar.com " sean la misma cuenta.
func NormalizarEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func ConstruirLinkVerificacion(token string) string {
	appURL := os.Getenv("APP_URL")
	if appURL == "" {
		appURL = "http://localhost:3000"
	}
	return fmt.Sprintf("%s/auth/verify?token=%s", strings.TrimRight(appURL, "/"), token)
}

func (svc *Service) VerificarToken(ctx context.Context, token string) (*UsuarioAuth, error) {
	mt, err := svc.store.ObtenerToken(ctx, token)
	if err != nil {
		return nil, errors.New("token inválido")
	}
	if mt.UsedAt != nil {
		return nil, errors.New("token ya usado")
	}
	if time.Now().After(mt.ExpiresAt) {
		return nil, errors.New("token expirado")
	}
	if err := svc.store.MarcarTokenUsado(ctx, mt.ID); err != nil {
		return nil, err
	}
	return svc.store.ObtenerUsuarioPorID(ctx, mt.UsuarioID)
}

func GenerarJWT(claims *Claims, secreto string) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"usuario_id": claims.UsuarioID,
		"tenant_id":  claims.TenantID,
		"rol":        claims.Rol,
		"exp":        time.Now().Add(24 * time.Hour * 30).Unix(),
	})
	return t.SignedString([]byte(secreto))
}

func ValidarJWT(tokenStr, secreto string) (*Claims, error) {
	t, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", t.Header["alg"])
		}
		return []byte(secreto), nil
	})
	if err != nil || !t.Valid {
		return nil, errors.New("token inválido")
	}
	mc, ok := t.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("claims inválidos")
	}
	usuarioID, ok1 := mc["usuario_id"].(string)
	tenantID, ok2 := mc["tenant_id"].(string)
	rol, ok3 := mc["rol"].(string)
	if !ok1 || !ok2 || !ok3 {
		return nil, errors.New("claims inválidos o incompletos")
	}
	return &Claims{
		UsuarioID: usuarioID,
		TenantID:  tenantID,
		Rol:       rol,
	}, nil
}

func generarTokenAleatorio() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
