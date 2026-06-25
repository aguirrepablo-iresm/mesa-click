package mesa_test

import (
	"context"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/mesa"
)

type mockStore struct {
	mesas []mesa.Mesa
}

func (m *mockStore) Listar(ctx context.Context, tenantID string) ([]mesa.Mesa, error) {
	return m.mesas, nil
}
func (m *mockStore) Crear(ctx context.Context, tenantID string, input mesa.MesaInput, qrToken string) (*mesa.Mesa, error) {
	return &mesa.Mesa{ID: "m-1", Numero: input.Numero, QRToken: qrToken, Estado: "activa"}, nil
}
func (m *mockStore) Actualizar(ctx context.Context, id, tenantID string, u mesa.MesaUpdate) (*mesa.Mesa, error) {
	return &mesa.Mesa{ID: id}, nil
}
func (m *mockStore) Eliminar(ctx context.Context, id, tenantID string) error { return nil }
func (m *mockStore) ObtenerPorQRToken(ctx context.Context, token string) (*mesa.MesaPublica, error) {
	return &mesa.MesaPublica{ID: "m-1"}, nil
}

func TestCrear_QRTokenGenerado(t *testing.T) {
	svc := mesa.NuevoService(&mockStore{})
	m, err := svc.Crear(context.Background(), "tenant-1", mesa.MesaInput{
		SucursalID: "suc-1",
		Numero:     5,
		Capacidad:  4,
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if m.QRToken == "" {
		t.Error("QRToken vacío — debería generarse automáticamente")
	}
}

func TestCrear_NumeroInvalido(t *testing.T) {
	svc := mesa.NuevoService(&mockStore{})
	_, err := svc.Crear(context.Background(), "tenant-1", mesa.MesaInput{
		SucursalID: "suc-1",
		Numero:     0,
	})
	if err == nil {
		t.Fatal("esperaba error por número de mesa inválido")
	}
}
