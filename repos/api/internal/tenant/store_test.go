package tenant

import (
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestIsUniqueConstraint_DetectaConstraintEsperada(t *testing.T) {
	err := &pgconn.PgError{
		Code:           "23505",
		ConstraintName: "usuarios_email_key",
	}

	if !isUniqueConstraint(err, "usuarios_email_key") {
		t.Fatal("se esperaba detectar la constraint de email duplicado")
	}
}

func TestIsUniqueConstraint_NoConfundeOtraConstraint(t *testing.T) {
	err := &pgconn.PgError{
		Code:           "23505",
		ConstraintName: "tenants_slug_key",
	}

	if isUniqueConstraint(err, "usuarios_email_key") {
		t.Fatal("no debería detectar una constraint distinta")
	}
}

func TestIsUniqueConstraint_ErrorGenerico(t *testing.T) {
	if isUniqueConstraint(errors.New("fallo genérico"), "usuarios_email_key") {
		t.Fatal("no debería detectar errores genéricos como unique violation")
	}
}
