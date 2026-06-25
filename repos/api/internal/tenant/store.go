package tenant

import (
	"context"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
)

type Store interface {
	Crear(ctx context.Context, input OnboardingInput) (*Tenant, error)
	ObtenerPorID(ctx context.Context, id string) (*Tenant, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) Crear(ctx context.Context, input OnboardingInput) (*Tenant, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var t Tenant
	err = tx.QueryRow(ctx,
		`INSERT INTO tenants (nombre, nombre_fantasia, rubro, slug)
		 VALUES ($1, $2, $3, $4) RETURNING id, nombre, nombre_fantasia, rubro, slug, created_at`,
		input.Nombre, input.NombreFantasia, input.Rubro, input.Slug,
	).Scan(&t.ID, &t.Nombre, &t.NombreFantasia, &t.Rubro, &t.Slug, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("error creando tenant: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO usuarios (tenant_id, email, nombre, rol)
		 VALUES ($1, $2, $3, 'admin')`,
		t.ID, input.EmailAdmin, input.NombreAdmin,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando usuario admin: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO sucursales (tenant_id, nombre)
		 VALUES ($1, 'Casa central')`,
		t.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando sucursal default: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *pgStore) ObtenerPorID(ctx context.Context, id string) (*Tenant, error) {
	t := &Tenant{}
	err := db.Pool.QueryRow(ctx,
		`SELECT id, nombre, nombre_fantasia, rubro, slug, created_at
		 FROM tenants WHERE id = $1`, id,
	).Scan(&t.ID, &t.Nombre, &t.NombreFantasia, &t.Rubro, &t.Slug, &t.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("tenant no encontrado: %w", err)
	}
	return t, nil
}
