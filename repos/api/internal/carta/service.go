package carta

import (
	"context"
	"errors"
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
		return nil, errors.New("nombre requerido")
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
		return nil, errors.New("nombre requerido")
	}
	if input.Precio < 0 {
		return nil, errors.New("precio no puede ser negativo")
	}
	if input.CategoriaID == "" {
		return nil, errors.New("categoria_id requerido")
	}
	return svc.store.CrearArticulo(ctx, tenantID, input)
}

func (svc *Service) ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error) {
	if u.Precio != nil && *u.Precio < 0 {
		return nil, errors.New("precio no puede ser negativo")
	}
	return svc.store.ActualizarArticulo(ctx, id, tenantID, u)
}

func (svc *Service) EliminarArticulo(ctx context.Context, id, tenantID string) error {
	return svc.store.EliminarArticulo(ctx, id, tenantID)
}

func (svc *Service) ObtenerCartaPublica(ctx context.Context, sucursalID string) (*CartaPublica, error) {
	return svc.store.ObtenerCartaPublica(ctx, sucursalID)
}
