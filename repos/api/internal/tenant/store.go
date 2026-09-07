package tenant

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Store interface {
	Crear(ctx context.Context, input OnboardingInput) (*Tenant, error)
	ObtenerPorID(ctx context.Context, id string) (*Tenant, error)
	Actualizar(ctx context.Context, id string, input ActualizarTenantInput) (*Tenant, error)
	EmailAdminEnUso(ctx context.Context, email string) (bool, error)
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
		if isUniqueConstraint(err, "tenants_slug_key") {
			return nil, ErrSlugConflict
		}
		return nil, fmt.Errorf("error creando tenant: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO usuarios (tenant_id, email, nombre, rol)
		 VALUES ($1, $2, $3, 'admin')`,
		t.ID, input.EmailAdmin, input.NombreAdmin,
	)
	if err != nil {
		if isUniqueConstraint(err, "usuarios_email_key") || isUniqueConstraint(err, "idx_usuarios_email_lower") {
			return nil, ErrEmailAdminConflict
		}
		return nil, fmt.Errorf("error creando usuario admin: %w", err)
	}

	horariosJSON, err := json.Marshal(input.Horarios)
	if err != nil {
		return nil, fmt.Errorf("error serializando horarios de sucursal: %w", err)
	}

	_, err = tx.Exec(ctx,
		`INSERT INTO sucursales (tenant_id, nombre, whatsapp, email, horarios)
		 VALUES ($1, $2, $3, $4, $5)`,
		t.ID, input.SucursalNombre, optionalString(input.Whatsapp), optionalString(input.EmailSucursal), horariosJSON,
	)
	if err != nil {
		return nil, fmt.Errorf("error creando sucursal default: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return &t, nil
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func isUniqueConstraint(err error, constraintName string) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == constraintName
}

func (s *pgStore) ObtenerPorID(ctx context.Context, id string) (*Tenant, error) {
	t := &Tenant{}
	var datosFiscalesBytes []byte
	err := db.Pool.QueryRow(ctx,
		`SELECT id, nombre, nombre_fantasia, rubro, descripcion, email_contacto, whatsapp,
		        logo_url, color_primario, estilo_visual, datos_fiscales, google_review_url, slug, created_at
		 FROM tenants WHERE id = $1`, id,
	).Scan(&t.ID, &t.Nombre, &t.NombreFantasia, &t.Rubro, &t.Descripcion, &t.EmailContacto, &t.Whatsapp,
		&t.LogoURL, &t.ColorPrimario, &t.EstiloVisual, &datosFiscalesBytes, &t.GoogleReviewURL, &t.Slug, &t.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error obteniendo tenant: %w", err)
	}
	if len(datosFiscalesBytes) > 0 {
		_ = json.Unmarshal(datosFiscalesBytes, &t.DatosFiscales)
	}
	return t, nil
}

func (s *pgStore) Actualizar(ctx context.Context, id string, input ActualizarTenantInput) (*Tenant, error) {
	actual, err := s.ObtenerPorID(ctx, id)
	if err != nil {
		return nil, err
	}

	nombre := actual.Nombre
	if input.Nombre != nil && *input.Nombre != "" {
		nombre = *input.Nombre
	}

	nombreFantasia := actual.NombreFantasia
	if input.NombreFantasia != nil {
		nombreFantasia = *input.NombreFantasia
	}

	rubro := actual.Rubro
	if input.Rubro != nil && *input.Rubro != "" {
		rubro = *input.Rubro
	}

	descripcion := actual.Descripcion
	if input.Descripcion != nil {
		descripcion = input.Descripcion
	}

	emailContacto := actual.EmailContacto
	if input.EmailContacto != nil {
		emailContacto = input.EmailContacto
	}

	whatsapp := actual.Whatsapp
	if input.Whatsapp != nil {
		whatsapp = input.Whatsapp
	}

	logoURL := actual.LogoURL
	if input.LogoURL != nil {
		logoURL = input.LogoURL
	}

	colorPrimario := actual.ColorPrimario
	if input.ColorPrimario != nil {
		colorPrimario = input.ColorPrimario
	}

	estiloVisual := actual.EstiloVisual
	if input.EstiloVisual != nil {
		estiloVisual = input.EstiloVisual
	}

	datosFiscales := actual.DatosFiscales
	if input.DatosFiscales != nil {
		datosFiscales = input.DatosFiscales
	}
	if datosFiscales == nil {
		datosFiscales = make(map[string]any)
	}
	datosFiscalesJSON, err := json.Marshal(datosFiscales)
	if err != nil {
		return nil, fmt.Errorf("error serializando datos fiscales: %w", err)
	}

	googleReviewURL := actual.GoogleReviewURL
	if input.GoogleReviewURL != nil {
		googleReviewURL = input.GoogleReviewURL
	}

	var t Tenant
	var datosFiscalesBytes []byte

	err = db.Pool.QueryRow(ctx,
		`UPDATE tenants
		 SET nombre = $1, nombre_fantasia = $2, rubro = $3, descripcion = $4,
		     email_contacto = $5, whatsapp = $6, logo_url = $7, color_primario = $8,
		     estilo_visual = $9, datos_fiscales = $10, google_review_url = $11
		 WHERE id = $12
		 RETURNING id, nombre, nombre_fantasia, rubro, descripcion, email_contacto, whatsapp,
		           logo_url, color_primario, estilo_visual, datos_fiscales, google_review_url, slug, created_at`,
		nombre, nombreFantasia, rubro, descripcion,
		emailContacto, whatsapp, logoURL, colorPrimario,
		estiloVisual, datosFiscalesJSON, googleReviewURL, id,
	).Scan(&t.ID, &t.Nombre, &t.NombreFantasia, &t.Rubro, &t.Descripcion, &t.EmailContacto, &t.Whatsapp,
		&t.LogoURL, &t.ColorPrimario, &t.EstiloVisual, &datosFiscalesBytes, &t.GoogleReviewURL, &t.Slug, &t.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error actualizando tenant: %w", err)
	}
	if len(datosFiscalesBytes) > 0 {
		_ = json.Unmarshal(datosFiscalesBytes, &t.DatosFiscales)
	}
	return &t, nil
}

func (s *pgStore) EmailAdminEnUso(ctx context.Context, email string) (bool, error) {
	var existe bool
	err := db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM usuarios WHERE lower(email) = lower($1))`,
		email,
	).Scan(&existe)
	if err != nil {
		return false, fmt.Errorf("error verificando email admin: %w", err)
	}
	return existe, nil
}
