package tenant_test

import (
	"context"
	"errors"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
)

type mockStore struct {
	crearFn      func(ctx context.Context, input tenant.OnboardingInput) (*tenant.Tenant, error)
	actualizarFn func(ctx context.Context, id string, input tenant.ActualizarTenantInput) (*tenant.Tenant, error)
}

func (m *mockStore) Crear(ctx context.Context, input tenant.OnboardingInput) (*tenant.Tenant, error) {
	return m.crearFn(ctx, input)
}
func (m *mockStore) ObtenerPorID(ctx context.Context, id string) (*tenant.Tenant, error) {
	return nil, nil
}
func (m *mockStore) Actualizar(ctx context.Context, id string, input tenant.ActualizarTenantInput) (*tenant.Tenant, error) {
	if m.actualizarFn != nil {
		return m.actualizarFn(ctx, id, input)
	}
	return nil, nil
}
func (m *mockStore) EmailAdminEnUso(ctx context.Context, email string) (bool, error) {
	return false, nil
}

func TestCrear_Exitoso(t *testing.T) {
	store := &mockStore{
		crearFn: func(ctx context.Context, input tenant.OnboardingInput) (*tenant.Tenant, error) {
			return &tenant.Tenant{ID: "t-1", Nombre: input.Nombre, Slug: input.Slug}, nil
		},
	}
	svc := tenant.NuevoService(store)
	result, err := svc.Crear(context.Background(), tenant.OnboardingInput{
		Nombre:      "Mi Bar",
		Slug:        "mi-bar",
		EmailAdmin:  "admin@mibar.com",
		NombreAdmin: "Carlos",
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if result.ID != "t-1" {
		t.Errorf("ID: got %q, want %q", result.ID, "t-1")
	}
}

func TestCrear_SlugVacio_Error(t *testing.T) {
	svc := tenant.NuevoService(&mockStore{
		crearFn: func(ctx context.Context, input tenant.OnboardingInput) (*tenant.Tenant, error) {
			return nil, errors.New("slug vacío")
		},
	})
	_, err := svc.Crear(context.Background(), tenant.OnboardingInput{
		Nombre:     "Sin Slug",
		EmailAdmin: "a@b.com",
	})
	if err == nil {
		t.Fatal("esperaba error por slug vacío")
	}
}

func TestActualizar_Exitoso(t *testing.T) {
	store := &mockStore{
		actualizarFn: func(ctx context.Context, id string, input tenant.ActualizarTenantInput) (*tenant.Tenant, error) {
			nombre := "Default"
			if input.Nombre != nil {
				nombre = *input.Nombre
			}
			return &tenant.Tenant{ID: id, Nombre: nombre}, nil
		},
	}
	svc := tenant.NuevoService(store)
	nombre := "Bar Nuevo"
	res, err := svc.Actualizar(context.Background(), "t-1", tenant.ActualizarTenantInput{
		Nombre: &nombre,
	})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if res.Nombre != "Bar Nuevo" {
		t.Errorf("got %s, want Bar Nuevo", res.Nombre)
	}
}
