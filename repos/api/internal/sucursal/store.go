package sucursal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
)

type Store interface {
	Crear(ctx context.Context, tenantID string, input SucursalInput) (*Sucursal, error)
	ObtenerPorID(ctx context.Context, id string, tenantID string) (*Sucursal, error)
	Listar(ctx context.Context, tenantID string) ([]Sucursal, error)
	Actualizar(ctx context.Context, id string, tenantID string, input SucursalInput) (*Sucursal, error)
	Eliminar(ctx context.Context, id string, tenantID string) error

	CrearSector(ctx context.Context, sucursalID string, tenantID string, input SectorInput) (*Sector, error)
	ListarSectores(ctx context.Context, sucursalID string, tenantID string) ([]Sector, error)
	EliminarSector(ctx context.Context, id string, tenantID string) error
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) Crear(ctx context.Context, tenantID string, input SucursalInput) (*Sucursal, error) {
	horariosJSON, err := json.Marshal(input.Horarios)
	if err != nil {
		return nil, fmt.Errorf("error serializando horarios: %w", err)
	}

	var suc Sucursal
	var horariosBytes []byte

	err = db.Pool.QueryRow(ctx,
		`INSERT INTO sucursales (tenant_id, nombre, whatsapp, email, telefono, horarios)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, tenant_id, nombre, whatsapp, email, telefono, horarios, created_at`,
		tenantID, input.Nombre, input.Whatsapp, input.Email, input.Telefono, horariosJSON,
	).Scan(&suc.ID, &suc.TenantID, &suc.Nombre, &suc.Whatsapp, &suc.Email, &suc.Telefono, &horariosBytes, &suc.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("error insertando sucursal: %w", err)
	}

	if len(horariosBytes) > 0 {
		_ = json.Unmarshal(horariosBytes, &suc.Horarios)
	}

	return &suc, nil
}

func (s *pgStore) ObtenerPorID(ctx context.Context, id string, tenantID string) (*Sucursal, error) {
	var suc Sucursal
	var horariosBytes []byte

	err := db.Pool.QueryRow(ctx,
		`SELECT id, tenant_id, nombre, whatsapp, email, telefono, horarios, created_at
		 FROM sucursales
		 WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	).Scan(&suc.ID, &suc.TenantID, &suc.Nombre, &suc.Whatsapp, &suc.Email, &suc.Telefono, &horariosBytes, &suc.CreatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error obteniendo sucursal: %w", err)
	}

	if len(horariosBytes) > 0 {
		_ = json.Unmarshal(horariosBytes, &suc.Horarios)
	}

	return &suc, nil
}

func (s *pgStore) Listar(ctx context.Context, tenantID string) ([]Sucursal, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, tenant_id, nombre, whatsapp, email, telefono, horarios, created_at
		 FROM sucursales
		 WHERE tenant_id = $1
		 ORDER BY created_at ASC`,
		tenantID,
	)
	if err != nil {
		return nil, fmt.Errorf("error listando sucursales: %w", err)
	}
	defer rows.Close()

	var sucursales []Sucursal
	for rows.Next() {
		var suc Sucursal
		var horariosBytes []byte
		err := rows.Scan(&suc.ID, &suc.TenantID, &suc.Nombre, &suc.Whatsapp, &suc.Email, &suc.Telefono, &horariosBytes, &suc.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("error leyendo sucursal: %w", err)
		}
		if len(horariosBytes) > 0 {
			_ = json.Unmarshal(horariosBytes, &suc.Horarios)
		}
		sucursales = append(sucursales, suc)
	}

	return sucursales, nil
}

func (s *pgStore) Actualizar(ctx context.Context, id string, tenantID string, input SucursalInput) (*Sucursal, error) {
	horariosJSON, err := json.Marshal(input.Horarios)
	if err != nil {
		return nil, fmt.Errorf("error serializando horarios: %w", err)
	}

	var suc Sucursal
	var horariosBytes []byte

	err = db.Pool.QueryRow(ctx,
		`UPDATE sucursales
		 SET nombre = $1, whatsapp = $2, email = $3, telefono = $4, horarios = $5
		 WHERE id = $6 AND tenant_id = $7
		 RETURNING id, tenant_id, nombre, whatsapp, email, telefono, horarios, created_at`,
		input.Nombre, input.Whatsapp, input.Email, input.Telefono, horariosJSON, id, tenantID,
	).Scan(&suc.ID, &suc.TenantID, &suc.Nombre, &suc.Whatsapp, &suc.Email, &suc.Telefono, &horariosBytes, &suc.CreatedAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error actualizando sucursal: %w", err)
	}

	if len(horariosBytes) > 0 {
		_ = json.Unmarshal(horariosBytes, &suc.Horarios)
	}

	return &suc, nil
}

func (s *pgStore) Eliminar(ctx context.Context, id string, tenantID string) error {
	cmdTag, err := db.Pool.Exec(ctx,
		`DELETE FROM sucursales WHERE id = $1 AND tenant_id = $2`,
		id, tenantID,
	)
	if err != nil {
		return fmt.Errorf("error eliminando sucursal: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *pgStore) CrearSector(ctx context.Context, sucursalID string, tenantID string, input SectorInput) (*Sector, error) {
	// Validar que la sucursal pertenezca al tenant antes de insertar el sector
	var exists bool
	err := db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM sucursales WHERE id = $1 AND tenant_id = $2)`,
		sucursalID, tenantID,
	).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrNotFound
	}

	var sec Sector
	err = db.Pool.QueryRow(ctx,
		`INSERT INTO sectores (sucursal_id, nombre)
		 VALUES ($1, $2)
		 RETURNING id, sucursal_id, nombre`,
		sucursalID, input.Nombre,
	).Scan(&sec.ID, &sec.SucursalID, &sec.Nombre)

	if err != nil {
		return nil, fmt.Errorf("error insertando sector: %w", err)
	}

	return &sec, nil
}

func (s *pgStore) ListarSectores(ctx context.Context, sucursalID string, tenantID string) ([]Sector, error) {
	// Validar que la sucursal pertenezca al tenant
	var exists bool
	err := db.Pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM sucursales WHERE id = $1 AND tenant_id = $2)`,
		sucursalID, tenantID,
	).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrNotFound
	}

	rows, err := db.Pool.Query(ctx,
		`SELECT id, sucursal_id, nombre
		 FROM sectores
		 WHERE sucursal_id = $1
		 ORDER BY nombre ASC`,
		sucursalID,
	)
	if err != nil {
		return nil, fmt.Errorf("error listando sectores: %w", err)
	}
	defer rows.Close()

	var sectores []Sector
	for rows.Next() {
		var sec Sector
		err := rows.Scan(&sec.ID, &sec.SucursalID, &sec.Nombre)
		if err != nil {
			return nil, fmt.Errorf("error leyendo sector: %w", err)
		}
		sectores = append(sectores, sec)
	}

	return sectores, nil
}

func (s *pgStore) EliminarSector(ctx context.Context, id string, tenantID string) error {
	// Validar que el sector pertenezca a una sucursal del tenant
	cmdTag, err := db.Pool.Exec(ctx,
		`DELETE FROM sectores
		 WHERE id = $1 AND sucursal_id IN (SELECT id FROM sucursales WHERE tenant_id = $2)`,
		id, tenantID,
	)
	if err != nil {
		return fmt.Errorf("error eliminando sector: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return ErrSectorNotFound
	}

	return nil
}
