package usuario

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5/pgconn"
)

type Store interface {
	Crear(ctx context.Context, tenantID string, input UsuarioInput) (*Usuario, error)
	Listar(ctx context.Context, tenantID string) ([]Usuario, error)
	Eliminar(ctx context.Context, id string, tenantID string) error
	CrearMagicToken(ctx context.Context, usuarioID string) (string, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) Crear(ctx context.Context, tenantID string, input UsuarioInput) (*Usuario, error) {
	var u Usuario
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO usuarios (tenant_id, email, nombre, rol)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, tenant_id, email, nombre, rol, created_at`,
		tenantID, input.Email, input.Nombre, input.Rol,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Nombre, &u.Rol, &u.CreatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrEmailConflict
		}
		return nil, fmt.Errorf("error creando usuario: %w", err)
	}

	return &u, nil
}

func (s *pgStore) Listar(ctx context.Context, tenantID string) ([]Usuario, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, tenant_id, email, nombre, rol, created_at
		 FROM usuarios
		 WHERE tenant_id = $1
		 ORDER BY created_at ASC`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("error listando usuarios: %w", err)
	}
	defer rows.Close()

	var usuarios []Usuario
	for rows.Next() {
		var u Usuario
		err := rows.Scan(&u.ID, &u.TenantID, &u.Email, &u.Nombre, &u.Rol, &u.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("error leyendo usuario: %w", err)
		}
		usuarios = append(usuarios, u)
	}

	return usuarios, nil
}

func (s *pgStore) Eliminar(ctx context.Context, id string, tenantID string) error {
	cmdTag, err := db.Pool.Exec(ctx,
		`DELETE FROM usuarios WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	)
	if err != nil {
		return fmt.Errorf("error eliminando usuario: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *pgStore) CrearMagicToken(ctx context.Context, usuarioID string) (string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)
	expiresAt := time.Now().Add(15 * time.Minute)

	_, err := db.Pool.Exec(ctx,
		`INSERT INTO magic_tokens (usuario_id, token, expires_at)
		 VALUES ($1, $2, $3)`,
		usuarioID, token, expiresAt,
	)
	if err != nil {
		return "", fmt.Errorf("error guardando token de invitacion: %w", err)
	}

	return token, nil
}
