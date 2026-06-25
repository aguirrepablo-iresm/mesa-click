package pedido_test

import (
	"context"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/pedido"
)

type mockStore struct{}

func (m *mockStore) Crear(ctx context.Context, input pedido.NuevoPedidoInput, sucursalID string) (*pedido.Pedido, error) {
	return &pedido.Pedido{ID: "p-1", MesaID: input.MesaID, Estado: "recibido"}, nil
}
func (m *mockStore) ListarActivos(ctx context.Context, sucursalID, tenantID string) ([]pedido.Pedido, error) {
	return []pedido.Pedido{}, nil
}
func (m *mockStore) CambiarEstado(ctx context.Context, id, tenantID, nuevoEstado string) (*pedido.Pedido, error) {
	return &pedido.Pedido{ID: id, Estado: nuevoEstado}, nil
}
func (m *mockStore) ObtenerSucursalPorMesa(ctx context.Context, mesaID string) (string, error) {
	return "suc-1", nil
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
