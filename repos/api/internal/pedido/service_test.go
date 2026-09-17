package pedido_test

import (
	"context"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/pedido"
)

type mockStore struct {
	crearInput pedido.NuevoPedidoInput
}

func (m *mockStore) Crear(ctx context.Context, input pedido.NuevoPedidoInput, sucursalID string, cuentaVersion int) (*pedido.Pedido, error) {
	m.crearInput = input
	return &pedido.Pedido{ID: "p-1", MesaID: input.MesaID, CuentaVersion: cuentaVersion, Estado: "recibido"}, nil
}
func (m *mockStore) ListarActivos(ctx context.Context, sucursalID, tenantID string) ([]pedido.Pedido, error) {
	return []pedido.Pedido{}, nil
}
func (m *mockStore) ListarCuentaActualPorQR(ctx context.Context, qrToken string) ([]pedido.Pedido, error) {
	return []pedido.Pedido{}, nil
}
func (m *mockStore) CambiarEstado(ctx context.Context, id, tenantID, nuevoEstado string) (*pedido.Pedido, error) {
	return &pedido.Pedido{ID: id, Estado: nuevoEstado}, nil
}
func (m *mockStore) ObtenerSucursalPorMesa(ctx context.Context, mesaID string) (string, int, error) {
	return "suc-1", 3, nil
}

func TestCrear_AsignaComensalAlItem(t *testing.T) {
	store := &mockStore{}
	svc := pedido.NuevoService(store)

	p, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{{
			ArticuloID:     "articulo-1",
			Cantidad:       1,
			ComensalID:     "47dc8c9e-fb98-44d7-80a1-b598addc1e8a",
			ComensalNombre: "  Mateo  ",
		}},
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if p.CuentaVersion != 3 {
		t.Fatalf("cuenta_version incorrecta: got %d, want 3", p.CuentaVersion)
	}
	if got := store.crearInput.Items[0].ComensalNombre; got != "Mateo" {
		t.Errorf("nombre no normalizado: got %q, want %q", got, "Mateo")
	}
}

func TestCrear_ComensalInvalido_Error(t *testing.T) {
	svc := pedido.NuevoService(&mockStore{})
	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{{
			ArticuloID:     "articulo-1",
			Cantidad:       1,
			ComensalID:     "no-es-uuid",
			ComensalNombre: "Mateo",
		}},
	})
	if err == nil {
		t.Fatal("esperaba error por comensal_id inválido")
	}
}

func TestCrear_SinAlias_ConservaIdentidadAnonima(t *testing.T) {
	store := &mockStore{}
	svc := pedido.NuevoService(store)

	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{{
			ArticuloID:     "articulo-1",
			Cantidad:       1,
			ComensalID:     "47dc8c9e-fb98-44d7-80a1-b598addc1e8a",
			ComensalNombre: "",
		}},
	})
	if err != nil {
		t.Fatalf("un comensal sin alias debe poder pedir: %v", err)
	}
	if got := store.crearInput.Items[0].ComensalID; got == "" {
		t.Fatal("el pedido sin alias debe conservar el UUID del comensal")
	}
	if got := store.crearInput.Items[0].ComensalNombre; got != "" {
		t.Fatalf("el alias vacío debe conservarse vacío: got %q", got)
	}
}

func TestCrear_DosComensalesMismoNombre_ConservaIDsDistintos(t *testing.T) {
	store := &mockStore{}
	svc := pedido.NuevoService(store)

	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{
			{
				ArticuloID:     "articulo-1",
				Cantidad:       1,
				ComensalID:     "47dc8c9e-fb98-44d7-80a1-b598addc1e8a",
				ComensalNombre: "Mateo",
			},
			{
				ArticuloID:     "articulo-2",
				Cantidad:       1,
				ComensalID:     "5ef10747-503a-4d72-a433-94978a2447e6",
				ComensalNombre: "Mateo",
			},
		},
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}

	primero := store.crearInput.Items[0]
	segundo := store.crearInput.Items[1]
	if primero.ComensalNombre != segundo.ComensalNombre {
		t.Fatal("el escenario requiere dos nombres iguales")
	}
	if primero.ComensalID == segundo.ComensalID {
		t.Fatal("dos comensales homónimos no deben compartir identidad")
	}
}

func TestCambiarEstado_EstadoInvalido(t *testing.T) {
	svc := pedido.NuevoService(&mockStore{})
	_, err := svc.CambiarEstado(context.Background(), "p-1", "tenant-1", "invalido")
	if err == nil {
		t.Fatal("esperaba error por estado inválido")
	}
}

func TestCambiarEstado_EstadosValidos(t *testing.T) {
	svc := pedido.NuevoService(&mockStore{})
	for _, estado := range pedido.EstadosValidos {
		_, err := svc.CambiarEstado(context.Background(), "p-1", "tenant-1", estado)
		if err != nil {
			t.Errorf("estado %q debería ser válido pero dio error: %v", estado, err)
		}
	}
}

func TestCrear_SinItems_Error(t *testing.T) {
	svc := pedido.NuevoService(&mockStore{})
	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items:  []pedido.NuevoItemInput{},
	})
	if err == nil {
		t.Fatal("esperaba error por pedido sin items")
	}
}

func TestCrear_VarianteVacia_Error(t *testing.T) {
	svc := pedido.NuevoService(&mockStore{})
	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{
			{
				ArticuloID:     "art-1",
				Cantidad:       1,
				ComensalID:     "47dc8c9e-fb98-44d7-80a1-b598addc1e8a",
				ComensalNombre: "Mateo",
				Variantes:      []string{"  "},
			},
		},
	})
	if err == nil {
		t.Fatal("esperaba error por variante_id vacío")
	}
}

func TestCrear_ConVariantes_Exito(t *testing.T) {
	store := &mockStore{}
	svc := pedido.NuevoService(store)
	_, err := svc.Crear(context.Background(), pedido.NuevoPedidoInput{
		MesaID: "mesa-1",
		Items: []pedido.NuevoItemInput{
			{
				ArticuloID:     "art-1",
				Cantidad:       2,
				ComensalID:     "47dc8c9e-fb98-44d7-80a1-b598addc1e8a",
				ComensalNombre: "Mateo",
				Variantes:      []string{"var-1", "var-2"},
			},
		},
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if len(store.crearInput.Items[0].Variantes) != 2 {
		t.Fatalf("esperaba 2 variantes, obtuve %d", len(store.crearInput.Items[0].Variantes))
	}
}
