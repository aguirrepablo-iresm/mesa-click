package carta_test

import (
	"context"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/carta"
)

type mockStore struct {
	categorias []carta.Categoria
	articulos  []carta.Articulo
}

func (m *mockStore) ListarCategorias(ctx context.Context, tenantID string) ([]carta.Categoria, error) {
	var result []carta.Categoria
	for _, c := range m.categorias {
		if c.TenantID == tenantID {
			result = append(result, c)
		}
	}
	return result, nil
}
func (m *mockStore) CrearCategoria(ctx context.Context, tenantID string, input carta.CategoriaInput) (*carta.Categoria, error) {
	c := carta.Categoria{ID: "cat-1", TenantID: tenantID, Nombre: input.Nombre, Orden: input.Orden}
	m.categorias = append(m.categorias, c)
	return &c, nil
}
func (m *mockStore) EliminarCategoria(ctx context.Context, id, tenantID string) error { return nil }
func (m *mockStore) ListarArticulos(ctx context.Context, tenantID string) ([]carta.Articulo, error) {
	return m.articulos, nil
}
func (m *mockStore) CrearArticulo(ctx context.Context, tenantID string, input carta.ArticuloInput) (*carta.Articulo, error) {
	a := carta.Articulo{ID: "art-1", TenantID: tenantID, CategoriaID: input.CategoriaID, Nombre: input.Nombre, Precio: input.Precio, Activo: true}
	return &a, nil
}
func (m *mockStore) ActualizarArticulo(ctx context.Context, id, tenantID string, u carta.ArticuloUpdate) (*carta.Articulo, error) {
	return &carta.Articulo{ID: id}, nil
}
func (m *mockStore) EliminarArticulo(ctx context.Context, id, tenantID string) error { return nil }
func (m *mockStore) ObtenerCartaPublica(ctx context.Context, sucursalID string) (*carta.CartaPublica, error) {
	return &carta.CartaPublica{}, nil
}

func TestListarCategorias(t *testing.T) {
	store := &mockStore{
		categorias: []carta.Categoria{
			{ID: "1", TenantID: "t-1", Nombre: "Bebidas"},
			{ID: "2", TenantID: "t-2", Nombre: "Otras"},
		},
	}
	svc := carta.NuevoService(store)
	cats, err := svc.ListarCategorias(context.Background(), "t-1")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if len(cats) != 1 {
		t.Errorf("got %d categorías, want 1", len(cats))
	}
	if cats[0].Nombre != "Bebidas" {
		t.Errorf("got %q, want %q", cats[0].Nombre, "Bebidas")
	}
}

func TestCrearArticulo_PrecioNegativo(t *testing.T) {
	svc := carta.NuevoService(&mockStore{})
	_, err := svc.CrearArticulo(context.Background(), "t-1", carta.ArticuloInput{
		Nombre: "Test",
		Precio: -5,
	})
	if err == nil {
		t.Fatal("esperaba error por precio negativo")
	}
}
