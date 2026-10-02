package tenant_test

import (
	"context"
	"testing"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
)

func TestPlan_PermitidoYLimites(t *testing.T) {
	ahora := time.Now()
	pasado := ahora.Add(-24 * time.Hour)
	futuro := ahora.Add(30 * 24 * time.Hour)

	casos := []struct {
		nombre          string
		plan            string
		planHasta       *time.Time
		recurso         tenant.Recurso
		uso             int
		quieroPermitido bool
		quieroLimite    int
	}{
		{
			nombre:          "Free con margen en mesas",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoMesas,
			uso:             8,
			quieroPermitido: true,
			quieroLimite:    10,
		},
		{
			nombre:          "Free al límite en mesas",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoMesas,
			uso:             10,
			quieroPermitido: false,
			quieroLimite:    10,
		},
		{
			nombre:          "Free con margen en productos",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoProductos,
			uso:             25,
			quieroPermitido: true,
			quieroLimite:    30,
		},
		{
			nombre:          "Free al límite en productos",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoProductos,
			uso:             30,
			quieroPermitido: false,
			quieroLimite:    30,
		},
		{
			nombre:          "Free al límite en sucursales",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoSucursales,
			uso:             1,
			quieroPermitido: false,
			quieroLimite:    1,
		},
		{
			nombre:          "Free intenta carga masiva (Pro-only)",
			plan:            tenant.PlanFree,
			recurso:         tenant.RecursoCargaMasiva,
			uso:             0,
			quieroPermitido: false,
			quieroLimite:    0,
		},
		{
			nombre:          "Pro activo con uso alto",
			plan:            tenant.PlanPro,
			planHasta:       &futuro,
			recurso:         tenant.RecursoMesas,
			uso:             50,
			quieroPermitido: true,
			quieroLimite:    tenant.Ilimitado,
		},
		{
			nombre:          "Pro activo permite carga masiva",
			plan:            tenant.PlanPro,
			planHasta:       &futuro,
			recurso:         tenant.RecursoCargaMasiva,
			uso:             0,
			quieroPermitido: true,
			quieroLimite:    tenant.Ilimitado,
		},
		{
			nombre:          "Pro vencido degrada a Free y bloquea al límite",
			plan:            tenant.PlanPro,
			planHasta:       &pasado,
			recurso:         tenant.RecursoMesas,
			uso:             10,
			quieroPermitido: false,
			quieroLimite:    10,
		},
		{
			nombre:          "Pro vencido degrada a Free y bloquea carga masiva",
			plan:            tenant.PlanPro,
			planHasta:       &pasado,
			recurso:         tenant.RecursoCargaMasiva,
			uso:             0,
			quieroPermitido: false,
			quieroLimite:    0,
		},
	}

	for _, c := range casos {
		t.Run(c.nombre, func(t *testing.T) {
			cuotas := tenant.EstadoCuotas{
				Plan:      c.plan,
				PlanHasta: c.planHasta,
				Uso: map[tenant.Recurso]int{
					c.recurso: c.uso,
				},
			}

			permitido := cuotas.PermitidoConTiempo(c.recurso, ahora)
			if permitido != c.quieroPermitido {
				t.Errorf("Permitido(): obtenido %v, esperado %v", permitido, c.quieroPermitido)
			}

			limite := cuotas.LimiteConTiempo(c.recurso, ahora)
			if limite != c.quieroLimite {
				t.Errorf("Limite(): obtenido %d, esperado %d", limite, c.quieroLimite)
			}

			alcanzado := cuotas.AlcanzadoConTiempo(c.recurso, ahora)
			if alcanzado == c.quieroPermitido {
				t.Errorf("Alcanzado(): no coincide con opuesto de permitido: %v", alcanzado)
			}
		})
	}
}

func TestEstadoPlanDTO_Calculo(t *testing.T) {
	ahora := time.Now()
	futuro := ahora.Add(5 * 24 * time.Hour)

	t.Run("Plan Free calcula limites y disponibles", func(t *testing.T) {
		store := &mockStore{
			obtenerEstadoCuotasFn: func(ctx context.Context, tenantID string) (*tenant.EstadoCuotas, error) {
				return &tenant.EstadoCuotas{
					Plan: tenant.PlanFree,
					Uso: map[tenant.Recurso]int{
						tenant.RecursoMesas:      8,
						tenant.RecursoProductos:  25,
						tenant.RecursoSucursales: 1,
					},
				}, nil
			},
		}
		svc := tenant.NuevoService(store)
		dto, err := svc.EstadoPlan(context.Background(), "t-1")
		if err != nil {
			t.Fatalf("error inesperado: %v", err)
		}

		if dto.Plan != "free" {
			t.Errorf("Plan: obtenido %q, esperado 'free'", dto.Plan)
		}
		if dto.DiasRestantesPro != nil {
			t.Errorf("DiasRestantesPro: esperado nil, obtenido %v", *dto.DiasRestantesPro)
		}
		if dto.Limites["mesas"] != 10 || dto.Limites["productos"] != 30 || dto.Limites["sucursales"] != 1 {
			t.Errorf("Limites inesperados: %+v", dto.Limites)
		}
		if dto.Disponibles["mesas"] != 2 || dto.Disponibles["productos"] != 5 || dto.Disponibles["sucursales"] != 0 {
			t.Errorf("Disponibles inesperados: %+v", dto.Disponibles)
		}
		if dto.Alcanzado["mesas"] != false || dto.Alcanzado["productos"] != false || dto.Alcanzado["sucursales"] != true {
			t.Errorf("Alcanzado inesperado: %+v", dto.Alcanzado)
		}
	})

	t.Run("Plan Pro calcula ilimitado y dias restantes", func(t *testing.T) {
		store := &mockStore{
			obtenerEstadoCuotasFn: func(ctx context.Context, tenantID string) (*tenant.EstadoCuotas, error) {
				return &tenant.EstadoCuotas{
					Plan:      tenant.PlanPro,
					PlanHasta: &futuro,
					Uso: map[tenant.Recurso]int{
						tenant.RecursoMesas:      15,
						tenant.RecursoProductos:  60,
						tenant.RecursoSucursales: 3,
					},
				}, nil
			},
		}
		svc := tenant.NuevoService(store)
		dto, err := svc.EstadoPlan(context.Background(), "t-1")
		if err != nil {
			t.Fatalf("error inesperado: %v", err)
		}

		if dto.Plan != "pro" {
			t.Errorf("Plan: obtenido %q, esperado 'pro'", dto.Plan)
		}
		if dto.DiasRestantesPro == nil || *dto.DiasRestantesPro <= 0 {
			t.Errorf("DiasRestantesPro: esperado > 0, obtenido %v", dto.DiasRestantesPro)
		}
		if dto.Limites["mesas"] != -1 || dto.Disponibles["mesas"] != -1 {
			t.Errorf("Limites o Disponibles en Pro deben ser -1: %+v", dto)
		}
		if dto.Alcanzado["mesas"] != false || dto.Alcanzado["sucursales"] != false {
			t.Errorf("Alcanzado en Pro debe ser false: %+v", dto.Alcanzado)
		}
	})
}
