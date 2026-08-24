package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
)

type Store interface {
	ObtenerUsuarioPorEmail(ctx context.Context, email string) (*UsuarioAuth, error)
	ObtenerUsuarioPorID(ctx context.Context, id string) (*UsuarioAuth, error)
	GuardarToken(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error)
	ObtenerToken(ctx context.Context, token string) (*MagicToken, error)
	MarcarTokenUsado(ctx context.Context, tokenID string) error
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) ObtenerUsuarioPorEmail(ctx context.Context, email string) (*UsuarioAuth, error) {
	u := &UsuarioAuth{}
	err := db.Pool.QueryRow(ctx,
		// lower() para que emails cargados con mayúsculas sigan matcheando.
		`SELECT id, tenant_id, email, rol FROM usuarios WHERE lower(email) = lower($1)`, email,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Rol)
	if err != nil {
		return nil, fmt.Errorf("usuario no encontrado: %w", err)
	}
	return u, nil
}

func (s *pgStore) ObtenerUsuarioPorID(ctx context.Context, id string) (*UsuarioAuth, error) {
	u := &UsuarioAuth{}
	err := db.Pool.QueryRow(ctx,
		`SELECT id, tenant_id, email, rol FROM usuarios WHERE id = $1`, id,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Rol)
	if err != nil {
		return nil, fmt.Errorf("usuario no encontrado: %w", err)
	}
	return u, nil
}

func (s *pgStore) GuardarToken(ctx context.Context, usuarioID, token string, expiresAt time.Time) (string, error) {
	var id string
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO magic_tokens (usuario_id, token, expires_at)
		 VALUES ($1, $2, $3) RETURNING id`,
		usuarioID, token, expiresAt,
	).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("error guardando token: %w", err)
	}
	return id, nil
}

func (s *pgStore) ObtenerToken(ctx context.Context, token string) (*MagicToken, error) {
	mt := &MagicToken{}
	err := db.Pool.QueryRow(ctx,
		`SELECT id, usuario_id, token, expires_at, used_at
		 FROM magic_tokens WHERE token = $1`,
		token,
	).Scan(&mt.ID, &mt.UsuarioID, &mt.Token, &mt.ExpiresAt, &mt.UsedAt)
	if err != nil {
		return nil, fmt.Errorf("token no encontrado: %w", err)
	}
	return mt, nil
}

func (s *pgStore) MarcarTokenUsado(ctx context.Context, tokenID string) error {
	_, err := db.Pool.Exec(ctx,
		`UPDATE magic_tokens SET used_at = now() WHERE id = $1`, tokenID,
	)
	return err
}
