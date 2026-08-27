package mesa

import (
	"errors"
	"testing"

	"github.com/jackc/pgx/v5/pgconn"
)

func TestIsConstraintViolation(t *testing.T) {
	err := &pgconn.PgError{
		Code:           "23505",
		ConstraintName: "mesas_sucursal_id_numero_key",
	}

	if !isConstraintViolation(err, "mesas_sucursal_id_numero_key") {
		t.Fatal("se esperaba detectar la constraint de mesa duplicada")
	}
}

func TestIsConstraintViolation_OtraConstraint(t *testing.T) {
	err := &pgconn.PgError{
		Code:           "23505",
		ConstraintName: "mesas_qr_token_key",
	}

	if isConstraintViolation(err, "mesas_sucursal_id_numero_key") {
		t.Fatal("no debería detectar otra constraint como mesa duplicada")
	}
}

func TestIsConstraintViolation_ErrorGenerico(t *testing.T) {
	if isConstraintViolation(errors.New("falló la base"), "mesas_sucursal_id_numero_key") {
		t.Fatal("no debería detectar errores genéricos como constraint de Postgres")
	}
}
