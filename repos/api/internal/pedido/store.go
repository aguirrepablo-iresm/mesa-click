package pedido

import (
	"context"
	"errors"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
)

type Store interface {
	Crear(ctx context.Context, input NuevoPedidoInput, sucursalID string) (*Pedido, error)
	ListarActivos(ctx context.Context, sucursalID, tenantID string) ([]Pedido, error)
	CambiarEstado(ctx context.Context, id, tenantID, nuevoEstado string) (*Pedido, error)
	ObtenerSucursalPorMesa(ctx context.Context, mesaID string) (string, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) ObtenerSucursalPorMesa(ctx context.Context, mesaID string) (string, error) {
	var sucursalID string
	err := db.Pool.QueryRow(ctx,
		`SELECT sucursal_id FROM mesas WHERE id = $1`, mesaID,
	).Scan(&sucursalID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNotFound
		}
		return "", fmt.Errorf("error obteniendo sucursal por mesa: %w", err)
	}
	return sucursalID, nil
}

func (s *pgStore) Crear(ctx context.Context, input NuevoPedidoInput, sucursalID string) (*Pedido, error) {
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	p := &Pedido{}
	err = tx.QueryRow(ctx,
		`INSERT INTO pedidos (mesa_id, sucursal_id, estado)
		 VALUES ($1, $2, 'recibido')
		 RETURNING id, mesa_id, sucursal_id, estado, created_at, updated_at`,
		input.MesaID, sucursalID,
	).Scan(&p.ID, &p.MesaID, &p.SucursalID, &p.Estado, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("error creando pedido: %w", err)
	}

	var tenantID string
	err = tx.QueryRow(ctx,
		`SELECT tenant_id FROM sucursales WHERE id = $1`, sucursalID,
	).Scan(&tenantID)
	if err != nil {
		return nil, fmt.Errorf("sucursal no encontrada: %w", ErrNotFound)
	}

	for _, item := range input.Items {
		var precioUnitario float64
		err = tx.QueryRow(ctx,
			`SELECT precio FROM articulos WHERE id = $1 AND tenant_id = $2 AND activo = true`,
			item.ArticuloID, tenantID,
		).Scan(&precioUnitario)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return nil, fmt.Errorf("artículo %s no disponible: %w", item.ArticuloID, ErrValidation)
			}
			return nil, fmt.Errorf("error obteniendo artículo: %w", err)
		}

		var itemID string
		err = tx.QueryRow(ctx,
			`INSERT INTO pedido_items (pedido_id, articulo_id, cantidad, precio_unitario, notas)
			 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
			p.ID, item.ArticuloID, item.Cantidad, precioUnitario, item.Notas,
		).Scan(&itemID)
		if err != nil {
			return nil, fmt.Errorf("error insertando item: %w", err)
		}

		p.Items = append(p.Items, PedidoItem{
			ID:             itemID,
			PedidoID:       p.ID,
			ArticuloID:     item.ArticuloID,
			Cantidad:       item.Cantidad,
			PrecioUnitario: precioUnitario,
			Notas:          item.Notas,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *pgStore) ListarActivos(ctx context.Context, sucursalID, tenantID string) ([]Pedido, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT p.id, p.mesa_id, p.sucursal_id, p.estado, p.created_at, p.updated_at
		 FROM pedidos p
		 JOIN sucursales su ON su.id = p.sucursal_id
		 WHERE p.sucursal_id = $1
		   AND su.tenant_id = $2
		   AND p.estado != 'cerrado'
		 ORDER BY p.created_at`,
		sucursalID, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pedidos []Pedido
	for rows.Next() {
		var p Pedido
		if err := rows.Scan(&p.ID, &p.MesaID, &p.SucursalID, &p.Estado, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		pedidos = append(pedidos, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return pedidos, nil
}

func (s *pgStore) CambiarEstado(ctx context.Context, id, tenantID, nuevoEstado string) (*Pedido, error) {
	p := &Pedido{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE pedidos SET estado = $1, updated_at = now()
		 WHERE id = $2
		   AND sucursal_id IN (SELECT id FROM sucursales WHERE tenant_id = $3)
		 RETURNING id, mesa_id, sucursal_id, estado, created_at, updated_at`,
		nuevoEstado, id, tenantID,
	).Scan(&p.ID, &p.MesaID, &p.SucursalID, &p.Estado, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error cambiando estado del pedido: %w", err)
	}
	return p, nil
}
