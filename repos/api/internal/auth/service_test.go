package auth_test

import (
	"testing"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

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
		// sin usuario_id, tenant_id, rol
	}).SignedString([]byte(secreto))
	_, err := auth.ValidarJWT(tok, secreto)
	if err == nil {
		t.Fatal("esperaba error por claims incompletos")
	}
}
