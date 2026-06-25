package pedido

import (
	"context"
	"errors"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/notificacion"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) Crear(ctx context.Context, input NuevoPedidoInput) (*Pedido, error) {
	if input.MesaID == "" {
		return nil, fmt.Errorf("mesa_id requerido: %w", ErrValidation)
	}
	if len(input.Items) == 0 {
		return nil, fmt.Errorf("el pedido debe tener al menos un ítem: %w", ErrValidation)
	}
	for _, item := range input.Items {
		if item.Cantidad <= 0 {
			return nil, fmt.Errorf("cantidad inválida para artículo %s: %w", item.ArticuloID, ErrValidation)
		}
	}
	sucursalID, err := svc.store.ObtenerSucursalPorMesa(ctx, input.MesaID)
	if err != nil {
		return nil, fmt.Errorf("mesa no encontrada: %w", ErrNotFound)
	}
	p, err := svc.store.Crear(ctx, input, sucursalID)
	if err != nil {
		return nil, err
	}

	// Notificar en tiempo real al recepcionista de la sucursal
	notificacion.Instancia.Publicar(fmt.Sprintf("sucursal:%s", p.SucursalID), "pedido_creado", p)

	return p, nil
}

func (svc *Service) ListarActivos(ctx context.Context, sucursalID, tenantID string) ([]Pedido, error) {
	return svc.store.ListarActivos(ctx, sucursalID, tenantID)
}

func (svc *Service) CambiarEstado(ctx context.Context, id, tenantID, nuevoEstado string) (*Pedido, error) {
	if !estadoValido(nuevoEstado) {
		return nil, fmt.Errorf("estado inválido: %q (válidos: recibido, preparando, listo, cerrado): %w", nuevoEstado, ErrValidation)
	}
	p, err := svc.store.CambiarEstado(ctx, id, tenantID, nuevoEstado)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return nil, err
		}
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Notificar en tiempo real al comensal (pedido) y al recepcionista (sucursal)
	notificacion.Instancia.Publicar(fmt.Sprintf("pedido:%s", p.ID), "pedido_actualizado", p)
	notificacion.Instancia.Publicar(fmt.Sprintf("sucursal:%s", p.SucursalID), "pedido_actualizado", p)

	return p, nil
}

func estadoValido(estado string) bool {
	for _, v := range EstadosValidos {
		if v == estado {
			return true
		}
	}
	return false
}
