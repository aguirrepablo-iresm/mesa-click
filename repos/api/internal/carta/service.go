package carta

import (
	"context"
	"fmt"
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
