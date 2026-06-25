package mesa

import (
	"context"
	"errors"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
)

// Store define las operaciones de persistencia del módulo mesa.
type Store interface {
	Listar(ctx context.Context, tenantID string) ([]Mesa, error)
	Crear(ctx context.Context, input MesaInput, qrToken string) (*Mesa, error)
	Actualizar(ctx context.Context, id, tenantID string, u MesaUpdate) (*Mesa, error)
	Eliminar(ctx context.Context, id, tenantID string) error
	ObtenerPorQRToken(ctx context.Context, token string) (*MesaPublica, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) Listar(ctx context.Context, tenantID string) ([]Mesa, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT m.id, m.sucursal_id, COALESCE(m.sector_id::text,''), m.numero, m.capacidad, m.qr_token, m.estado
		 FROM mesas m
		 JOIN sucursales su ON su.id = m.sucursal_id
		 WHERE su.tenant_id = $1
		 ORDER BY m.numero`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var mesas []Mesa
	for rows.Next() {
		var m Mesa
		if err := rows.Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado); err != nil {
			return nil, err
		}
		mesas = append(mesas, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return mesas, nil
}

func (s *pgStore) Crear(ctx context.Context, input MesaInput, qrToken string) (*Mesa, error) {
	m := &Mesa{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO mesas (sucursal_id, numero, capacidad, qr_token, estado)
		 VALUES ($1, $2, $3, $4, 'activa')
		 RETURNING id, sucursal_id, COALESCE(sector_id::text,''), numero, capacidad, qr_token, estado`,
		input.SucursalID, input.Numero, input.Capacidad, qrToken,
	).Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado)
	return m, err
}

func (s *pgStore) Actualizar(ctx context.Context, id, tenantID string, u MesaUpdate) (*Mesa, error) {
	m := &Mesa{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE mesas SET
		   numero    = COALESCE($3, numero),
		   capacidad = COALESCE($4, capacidad),
		   estado    = COALESCE($5, estado)
		 WHERE id = $1
		   AND sucursal_id IN (SELECT id FROM sucursales WHERE tenant_id = $2)
		 RETURNING id, sucursal_id, COALESCE(sector_id::text,''), numero, capacidad, qr_token, estado`,
		id, tenantID, u.Numero, u.Capacidad, u.Estado,
	).Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return m, nil
}

func (s *pgStore) Eliminar(ctx context.Context, id, tenantID string) error {
	tag, err := db.Pool.Exec(ctx,
		`DELETE FROM mesas WHERE id = $1
		 AND sucursal_id IN (SELECT id FROM sucursales WHERE tenant_id = $2)`, id, tenantID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *pgStore) ObtenerPorQRToken(ctx context.Context, token string) (*MesaPublica, error) {
	mp := &MesaPublica{}
	err := db.Pool.QueryRow(ctx,
		`SELECT m.id, m.numero, m.sucursal_id, su.tenant_id
		 FROM mesas m
		 JOIN sucursales su ON su.id = m.sucursal_id
		 WHERE m.qr_token = $1 AND m.estado = 'activa'`, token,
	).Scan(&mp.ID, &mp.Numero, &mp.SucursalID, &mp.TenantID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return mp, nil
}
