package carta_test

import (
	"context"
	"errors"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/carta"
)

type mockStore struct {
	categorias         []carta.Categoria
	articulos          []carta.Articulo
	ajustarPreciosFn   func(ctx context.Context, tenantID string, input carta.AjustePreciosInput) (*carta.AjustePreciosResultado, error)
	actualizarDispFn   func(ctx context.Context, id, tenantID string, disponible bool) (*carta.Articulo, error)
	reponerTodosFn     func(ctx context.Context, tenantID string) (int, error)
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
func (m *mockStore) BuscarOCrearCategoria(ctx context.Context, tenantID, nombre string) (string, error) {
	for _, c := range m.categorias {
		if c.TenantID == tenantID && c.Nombre == nombre {
			return c.ID, nil
		}
	}
	c := carta.Categoria{ID: "cat-auto", TenantID: tenantID, Nombre: nombre}
	m.categorias = append(m.categorias, c)
	return c.ID, nil
}
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
func (m *mockStore) ActualizarDisponibilidad(ctx context.Context, id, tenantID string, disponible bool) (*carta.Articulo, error) {
	if m.actualizarDispFn != nil {
		return m.actualizarDispFn(ctx, id, tenantID, disponible)
	}
	for i, a := range m.articulos {
		if a.ID == id {
			m.articulos[i].Disponible = disponible
			return &m.articulos[i], nil
		}
	}
	return &carta.Articulo{ID: id, Disponible: disponible}, nil
}
func (m *mockStore) ReponerTodos(ctx context.Context, tenantID string) (int, error) {
	if m.reponerTodosFn != nil {
		return m.reponerTodosFn(ctx, tenantID)
	}
	count := 0
	for i := range m.articulos {
		if !m.articulos[i].Disponible {
			m.articulos[i].Disponible = true
			count++
		}
	}
	return count, nil
}
func (m *mockStore) AjustarPrecios(ctx context.Context, tenantID string, input carta.AjustePreciosInput) (*carta.AjustePreciosResultado, error) {
	if m.ajustarPreciosFn != nil {
		return m.ajustarPreciosFn(ctx, tenantID, input)
	}
	return &carta.AjustePreciosResultado{Actualizados: len(m.articulos)}, nil
}
func (m *mockStore) EliminarArticulo(ctx context.Context, id, tenantID string) error { return nil }
func (m *mockStore) ObtenerCartaPublica(ctx context.Context, sucursalID string) (*carta.CartaPublica, error) {
	return &carta.CartaPublica{}, nil
}
func (m *mockStore) ListarVariantes(ctx context.Context, articuloID, tenantID string) ([]carta.Variante, error) {
	return []carta.Variante{}, nil
}
func (m *mockStore) CrearVariante(ctx context.Context, articuloID, tenantID string, input carta.CrearVarianteInput) (*carta.Variante, error) {
	return &carta.Variante{ID: "v-1", ArticuloID: articuloID, Nombre: input.Nombre, PrecioAdicional: input.PrecioAdicional}, nil
}
func (m *mockStore) ActualizarVariante(ctx context.Context, id, tenantID string, input carta.ActualizarVarianteInput) (*carta.Variante, error) {
	return &carta.Variante{ID: id}, nil
}
func (m *mockStore) EliminarVariante(ctx context.Context, id, tenantID string) error { return nil }

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

func TestCrearVariante_Validaciones(t *testing.T) {
	svc := carta.NuevoService(&mockStore{})
	_, err := svc.CrearVariante(context.Background(), "", "t-1", carta.CrearVarianteInput{
		Nombre:          "Extra queso",
		PrecioAdicional: 100,
	})
	if err == nil {
		t.Fatal("esperaba error por articulo_id vacío")
	}

	_, err = svc.CrearVariante(context.Background(), "art-1", "t-1", carta.CrearVarianteInput{
		Nombre:          "",
		PrecioAdicional: 100,
	})
	if err == nil {
		t.Fatal("esperaba error por nombre vacío")
	}

	_, err = svc.CrearVariante(context.Background(), "art-1", "t-1", carta.CrearVarianteInput{
		Nombre:          "Extra queso",
		PrecioAdicional: -10,
	})
	if err == nil {
		t.Fatal("esperaba error por precio_adicional negativo")
	}
}

func TestAjustarPrecios_Exitoso(t *testing.T) {
	store := &mockStore{
		ajustarPreciosFn: func(ctx context.Context, tenantID string, input carta.AjustePreciosInput) (*carta.AjustePreciosResultado, error) {
			if tenantID != "t-1" {
				t.Fatalf("tenantID: got %q, want %q", tenantID, "t-1")
			}
			if input.CategoriaID != "cat-1" || input.Porcentaje != 12.5 || input.Redondeo != carta.Redondeo100 {
				t.Fatalf("input inesperado: %+v", input)
			}
			return &carta.AjustePreciosResultado{Actualizados: 3}, nil
		},
	}

	resultado, err := carta.NuevoService(store).AjustarPrecios(context.Background(), "t-1", carta.AjustePreciosInput{
		CategoriaID: " cat-1 ",
		Porcentaje:  12.5,
		Redondeo:    carta.Redondeo100,
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if resultado.Actualizados != 3 {
		t.Fatalf("actualizados: got %d, want 3", resultado.Actualizados)
	}
}

func TestAjustarPrecios_Validaciones(t *testing.T) {
	tests := []struct {
		nombre string
		input  carta.AjustePreciosInput
	}{
		{nombre: "porcentaje cero", input: carta.AjustePreciosInput{Porcentaje: 0}},
		{nombre: "descuento menor a menos cien", input: carta.AjustePreciosInput{Porcentaje: -100.01}},
		{nombre: "incremento excesivo", input: carta.AjustePreciosInput{Porcentaje: 1000.01}},
		{nombre: "redondeo inválido", input: carta.AjustePreciosInput{Porcentaje: 10, Redondeo: "50"}},
	}

	for _, tt := range tests {
		t.Run(tt.nombre, func(t *testing.T) {
			_, err := carta.NuevoService(&mockStore{}).AjustarPrecios(context.Background(), "t-1", tt.input)
			if !errors.Is(err, carta.ErrValidation) {
				t.Fatalf("se esperaba ErrValidation, obtenido: %v", err)
			}
		})
	}
}

func TestAjustarPrecios_SinProductos(t *testing.T) {
	store := &mockStore{
		ajustarPreciosFn: func(ctx context.Context, tenantID string, input carta.AjustePreciosInput) (*carta.AjustePreciosResultado, error) {
			return &carta.AjustePreciosResultado{Actualizados: 0}, nil
		},
	}

	_, err := carta.NuevoService(store).AjustarPrecios(context.Background(), "t-1", carta.AjustePreciosInput{Porcentaje: 10})
	if !errors.Is(err, carta.ErrValidation) {
		t.Fatalf("se esperaba ErrValidation, obtenido: %v", err)
	}
}

func TestActualizarDisponibilidad(t *testing.T) {
	store := &mockStore{
		articulos: []carta.Articulo{
			{ID: "art-1", TenantID: "t-1", Nombre: "Hamburguesa", Disponible: true},
		},
	}
	svc := carta.NuevoService(store)

	// Marcar como 86 (agotado)
	art, err := svc.ActualizarDisponibilidad(context.Background(), "art-1", "t-1", false)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if art.Disponible {
		t.Fatalf("se esperaba disponible=false, obtenido: %v", art.Disponible)
	}

	// Marcar nuevamente como disponible
	art, err = svc.ActualizarDisponibilidad(context.Background(), "art-1", "t-1", true)
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if !art.Disponible {
		t.Fatalf("se esperaba disponible=true, obtenido: %v", art.Disponible)
	}
}

func TestActualizarDisponibilidad_Validacion(t *testing.T) {
	svc := carta.NuevoService(&mockStore{})
	_, err := svc.ActualizarDisponibilidad(context.Background(), "   ", "t-1", false)
	if !errors.Is(err, carta.ErrValidation) {
		t.Fatalf("se esperaba ErrValidation por ID vacío, obtenido: %v", err)
	}
}

func TestReponerTodos(t *testing.T) {
	store := &mockStore{
		articulos: []carta.Articulo{
			{ID: "art-1", TenantID: "t-1", Nombre: "Hamburguesa", Disponible: false},
			{ID: "art-2", TenantID: "t-1", Nombre: "Cerveza", Disponible: false},
			{ID: "art-3", TenantID: "t-1", Nombre: "Papas", Disponible: true},
		},
	}
	svc := carta.NuevoService(store)

	res, err := svc.ReponerTodos(context.Background(), "t-1")
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if res.Repuestos != 2 {
		t.Fatalf("repuestos: se esperaba 2, obtenido: %d", res.Repuestos)
	}
	for _, a := range store.articulos {
		if !a.Disponible {
			t.Fatalf("el artículo %s debería estar disponible", a.Nombre)
		}
	}
}
