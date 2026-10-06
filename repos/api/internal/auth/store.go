package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
)

type Store interface {
	ObtenerUsuarioPorEmail(ctx context.Context, email string) (*UsuarioAuth, error)
	ObtenerUsuarioPorGoogleSub(ctx context.Context, googleSub string) (*UsuarioAuth, error)
	ObtenerUsuarioPorID(ctx context.Context, id string) (*UsuarioAuth, error)
	VincularGoogleSub(ctx context.Context, usuarioID, googleSub string) error
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
		`SELECT id, tenant_id, email, rol, google_sub, password_hash FROM usuarios WHERE lower(email) = lower($1)`, email,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Rol, &u.GoogleSub, &u.PasswordHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUsuarioNoEncontrado
		}
		return nil, fmt.Errorf("error consultando usuario por email: %w", err)
	}
	return u, nil
}

func (s *pgStore) ObtenerUsuarioPorGoogleSub(ctx context.Context, googleSub string) (*UsuarioAuth, error) {
	u := &UsuarioAuth{}
	err := db.Pool.QueryRow(ctx,
		`SELECT id, tenant_id, email, rol, google_sub, password_hash FROM usuarios WHERE google_sub = $1`, googleSub,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Rol, &u.GoogleSub, &u.PasswordHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUsuarioNoEncontrado
		}
		return nil, fmt.Errorf("error consultando usuario por identidad de Google: %w", err)
	}
	return u, nil
}

func (s *pgStore) ObtenerUsuarioPorID(ctx context.Context, id string) (*UsuarioAuth, error) {
	u := &UsuarioAuth{}
	err := db.Pool.QueryRow(ctx,
		`SELECT id, tenant_id, email, rol, google_sub, password_hash FROM usuarios WHERE id = $1`, id,
	).Scan(&u.ID, &u.TenantID, &u.Email, &u.Rol, &u.GoogleSub, &u.PasswordHash)
	if err != nil {
		return nil, fmt.Errorf("usuario no encontrado: %w", err)
	}
	return u, nil
}

func (s *pgStore) VincularGoogleSub(ctx context.Context, usuarioID, googleSub string) error {
	resultado, err := db.Pool.Exec(ctx,
		`UPDATE usuarios
		 SET google_sub = $2
		 WHERE id = $1 AND (google_sub IS NULL OR google_sub = $2)`,
		usuarioID, googleSub,
	)
	if err != nil {
		return fmt.Errorf("error vinculando identidad de Google: %w", err)
	}
	if resultado.RowsAffected() != 1 {
		return errors.New("el usuario ya está vinculado a otra cuenta de Google")
	}
	return nil
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
