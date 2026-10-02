package carta

import (
	"context"
	"fmt"
	"math"
	"strings"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/notificacion"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) ListarCategorias(ctx context.Context, tenantID string) ([]Categoria, error) {
	return svc.store.ListarCategorias(ctx, tenantID)
}

func (svc *Service) CrearCategoria(ctx context.Context, tenantID string, input CategoriaInput) (*Categoria, error) {
	if input.Nombre == "" {
		return nil, fmt.Errorf("nombre requerido: %w", ErrValidation)
	}
	return svc.store.CrearCategoria(ctx, tenantID, input)
}

func (svc *Service) EliminarCategoria(ctx context.Context, id, tenantID string) error {
	return svc.store.EliminarCategoria(ctx, id, tenantID)
}

func (svc *Service) ListarArticulos(ctx context.Context, tenantID string) ([]Articulo, error) {
	return svc.store.ListarArticulos(ctx, tenantID)
}

func (svc *Service) CrearArticulo(ctx context.Context, tenantID string, input ArticuloInput) (*Articulo, error) {
	if input.Nombre == "" {
		return nil, fmt.Errorf("nombre requerido: %w", ErrValidation)
	}
	if input.Precio < 0 {
		return nil, fmt.Errorf("precio no puede ser negativo: %w", ErrValidation)
	}
	if input.CategoriaID == "" {
		return nil, fmt.Errorf("categoria_id requerido: %w", ErrValidation)
	}
	return svc.store.CrearArticulo(ctx, tenantID, input)
}

func (svc *Service) ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error) {
	if u.Precio != nil && *u.Precio < 0 {
		return nil, fmt.Errorf("precio no puede ser negativo: %w", ErrValidation)
	}
	return svc.store.ActualizarArticulo(ctx, id, tenantID, u)
}

func (svc *Service) ActualizarDisponibilidad(ctx context.Context, id, tenantID string, disponible bool) (*Articulo, error) {
	if strings.TrimSpace(id) == "" {
		return nil, fmt.Errorf("id requerido: %w", ErrValidation)
	}
	art, err := svc.store.ActualizarDisponibilidad(ctx, id, tenantID, disponible)
	if err != nil {
		return nil, err
	}
	// Notificar en tiempo real por SSE
	notificacion.Instancia.Publicar(fmt.Sprintf("tenant:%s:carta", tenantID), "articulo_disponibilidad_cambiada", art)
	return art, nil
}

func (svc *Service) ReponerTodos(ctx context.Context, tenantID string) (*ReponerTodosResultado, error) {
	cant, err := svc.store.ReponerTodos(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	res := &ReponerTodosResultado{Repuestos: cant}
	notificacion.Instancia.Publicar(fmt.Sprintf("tenant:%s:carta", tenantID), "carta_repuesta", res)
	return res, nil
}

func (svc *Service) AjustarPrecios(ctx context.Context, tenantID string, input AjustePreciosInput) (*AjustePreciosResultado, error) {
	input.CategoriaID = strings.TrimSpace(input.CategoriaID)
	input.Redondeo = strings.TrimSpace(input.Redondeo)
	if input.Redondeo == "" {
		input.Redondeo = RedondeoNinguno
	}

	if math.IsNaN(input.Porcentaje) || math.IsInf(input.Porcentaje, 0) || input.Porcentaje == 0 {
		return nil, fmt.Errorf("el porcentaje debe ser distinto de cero: %w", ErrValidation)
	}
	if input.Porcentaje < -100 || input.Porcentaje > 1000 {
		return nil, fmt.Errorf("el porcentaje debe estar entre -100 y 1000: %w", ErrValidation)
	}
	if input.Redondeo != RedondeoNinguno && input.Redondeo != Redondeo10 && input.Redondeo != Redondeo100 {
		return nil, fmt.Errorf("opción de redondeo inválida: %w", ErrValidation)
	}

	resultado, err := svc.store.AjustarPrecios(ctx, tenantID, input)
	if err != nil {
		return nil, err
	}
	if resultado.Actualizados == 0 {
		return nil, fmt.Errorf("no hay productos para actualizar: %w", ErrValidation)
	}
	return resultado, nil
}

func (svc *Service) EliminarArticulo(ctx context.Context, id, tenantID string) error {
	return svc.store.EliminarArticulo(ctx, id, tenantID)
}

func (svc *Service) ObtenerCartaPublica(ctx context.Context, sucursalID string) (*CartaPublica, error) {
	return svc.store.ObtenerCartaPublica(ctx, sucursalID)
}

func (svc *Service) ListarVariantes(ctx context.Context, articuloID, tenantID string) ([]Variante, error) {
	if articuloID == "" {
		return nil, fmt.Errorf("articulo_id requerido: %w", ErrValidation)
	}
	return svc.store.ListarVariantes(ctx, articuloID, tenantID)
}

func (svc *Service) CrearVariante(ctx context.Context, articuloID, tenantID string, input CrearVarianteInput) (*Variante, error) {
	if articuloID == "" {
		return nil, fmt.Errorf("articulo_id requerido: %w", ErrValidation)
	}
	if input.Nombre == "" {
		return nil, fmt.Errorf("nombre requerido: %w", ErrValidation)
	}
	if input.PrecioAdicional < 0 {
		return nil, fmt.Errorf("precio_adicional no puede ser negativo: %w", ErrValidation)
	}
	return svc.store.CrearVariante(ctx, articuloID, tenantID, input)
}

func (svc *Service) ActualizarVariante(ctx context.Context, id, tenantID string, input ActualizarVarianteInput) (*Variante, error) {
	if id == "" {
		return nil, fmt.Errorf("id requerido: %w", ErrValidation)
	}
	if input.PrecioAdicional != nil && *input.PrecioAdicional < 0 {
		return nil, fmt.Errorf("precio_adicional no puede ser negativo: %w", ErrValidation)
	}
	return svc.store.ActualizarVariante(ctx, id, tenantID, input)
}

func (svc *Service) EliminarVariante(ctx context.Context, id, tenantID string) error {
	if id == "" {
		return fmt.Errorf("id requerido: %w", ErrValidation)
	}
	return svc.store.EliminarVariante(ctx, id, tenantID)
}
