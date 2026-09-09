package mesa

import (
	"context"
	"errors"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

// Store define las operaciones de persistencia del módulo mesa.
type Store interface {
	Listar(ctx context.Context, tenantID string) ([]Mesa, error)
	Crear(ctx context.Context, tenantID string, input MesaInput, qrToken string) (*Mesa, error)
	Actualizar(ctx context.Context, id, tenantID string, u MesaUpdate) (*Mesa, error)
	CerrarCuenta(ctx context.Context, id, tenantID string) (*Mesa, error)
	Eliminar(ctx context.Context, id, tenantID string) error
	ObtenerPorQRToken(ctx context.Context, token string) (*MesaPublica, error)
	SolicitarCuentaPorQRToken(ctx context.Context, token string) (*MesaPublica, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) Listar(ctx context.Context, tenantID string) ([]Mesa, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT m.id, m.sucursal_id, COALESCE(m.sector_id::text,''), m.numero, m.capacidad, m.qr_token, m.estado,
		        m.cuenta_solicitada, m.cuenta_version
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
		if err := rows.Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado,
			&m.CuentaSolicitada, &m.CuentaVersion); err != nil {
			return nil, err
		}
		mesas = append(mesas, m)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return mesas, nil
}

func (s *pgStore) Crear(ctx context.Context, tenantID string, input MesaInput, qrToken string) (*Mesa, error) {
	m := &Mesa{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO mesas (sucursal_id, numero, capacidad, qr_token, estado)
		 SELECT $1, $2, $3, $4, 'activa'
		 FROM sucursales
		 WHERE id = $1 AND tenant_id = $5
		 RETURNING id, sucursal_id, COALESCE(sector_id::text,''), numero, capacidad, qr_token, estado,
		           cuenta_solicitada, cuenta_version`,
		input.SucursalID, input.Numero, input.Capacidad, qrToken, tenantID,
	).Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado,
		&m.CuentaSolicitada, &m.CuentaVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		if isConstraintViolation(err, "mesas_sucursal_id_numero_key") {
			return nil, ErrNumeroDuplicado
		}
		return nil, err
	}
	return m, nil
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
		 RETURNING id, sucursal_id, COALESCE(sector_id::text,''), numero, capacidad, qr_token, estado,
		           cuenta_solicitada, cuenta_version`,
		id, tenantID, u.Numero, u.Capacidad, u.Estado,
	).Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado,
		&m.CuentaSolicitada, &m.CuentaVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		if isConstraintViolation(err, "mesas_sucursal_id_numero_key") {
			return nil, ErrNumeroDuplicado
		}
		return nil, err
	}
	return m, nil
}

func (s *pgStore) CerrarCuenta(ctx context.Context, id, tenantID string) (*Mesa, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	m := &Mesa{}
	err = tx.QueryRow(ctx,
		`UPDATE mesas SET cuenta_solicitada = false, cuenta_version = cuenta_version + 1
		 WHERE id = $1
		   AND sucursal_id IN (SELECT id FROM sucursales WHERE tenant_id = $2)
		 RETURNING id, sucursal_id, COALESCE(sector_id::text,''), numero, capacidad, qr_token, estado,
		           cuenta_solicitada, cuenta_version`,
		id, tenantID,
	).Scan(&m.ID, &m.SucursalID, &m.SectorID, &m.Numero, &m.Capacidad, &m.QRToken, &m.Estado,
		&m.CuentaSolicitada, &m.CuentaVersion)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	if _, err = tx.Exec(ctx,
		`UPDATE pedidos
		 SET estado = 'cerrado', updated_at = now()
		 WHERE mesa_id = $1 AND estado != 'cerrado'`,
		id,
	); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
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
		`SELECT m.id, m.numero, m.sucursal_id, su.tenant_id, m.estado,
		        m.cuenta_solicitada, m.cuenta_version,
		        COALESCE(NULLIF(TRIM(t.nombre_fantasia), ''), NULLIF(TRIM(t.nombre), ''), NULLIF(TRIM(su.nombre), ''), 'Tu negocio'),
		        t.logo_url, t.color_primario, t.estilo_visual
		 FROM mesas m
		 JOIN sucursales su ON su.id = m.sucursal_id
		 JOIN tenants t ON t.id = su.tenant_id
		 WHERE m.qr_token = $1`, token,
	).Scan(&mp.ID, &mp.Numero, &mp.SucursalID, &mp.TenantID, &mp.Estado,
		&mp.CuentaSolicitada, &mp.CuentaVersion,
		&mp.Nombre, &mp.LogoURL, &mp.ColorPrimario, &mp.EstiloVisual)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return mp, nil
}

func (s *pgStore) SolicitarCuentaPorQRToken(ctx context.Context, token string) (*MesaPublica, error) {
	tag, err := db.Pool.Exec(ctx,
		`UPDATE mesas
		 SET cuenta_solicitada = true
		 WHERE qr_token = $1 AND estado = 'activa'`, token)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		_, lookupErr := s.ObtenerPorQRToken(ctx, token)
		if lookupErr != nil {
			return nil, lookupErr
		}
		return nil, ErrMesaInactiva
	}
	return s.ObtenerPorQRToken(ctx, token)
}

func isConstraintViolation(err error, constraintName string) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == constraintName
}
