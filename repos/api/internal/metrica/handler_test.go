package metrica

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

func TestResumenHandlerDevuelveMetricasDelTenant(t *testing.T) {
	store := &storeFalso{
		bases: []ResumenBase{
			{FacturacionTotal: 25000, PedidosTotales: 3, PedidosCerrados: 2, PedidosActivos: 1},
			{FacturacionTotal: 20000, PedidosTotales: 2, PedidosCerrados: 2},
		},
	}
	handler := NuevosHandlers(NuevoService(store))
	req := httptest.NewRequest(http.MethodGet, "/metricas/resumen?desde=2026-10-06&hasta=2026-10-06", nil)
	req = req.WithContext(auth.ContextConClaims(req.Context(), &auth.Claims{TenantID: "tenant-1"}))
	response := httptest.NewRecorder()

	handler.Resumen(response, req)

	if response.Code != http.StatusOK {
		t.Fatalf("status inesperado: got %d, body %s", response.Code, response.Body.String())
	}
	if body := response.Body.String(); !strings.Contains(body, `"facturacion_total":25000`) {
		t.Fatalf("respuesta inesperada: %s", body)
	}
	if cache := response.Header().Get("Cache-Control"); cache != "private, max-age=30" {
		t.Fatalf("cache inesperado: %q", cache)
	}
}

func TestResumenHandlerRechazaFechasIncompletas(t *testing.T) {
	handler := NuevosHandlers(NuevoService(&storeFalso{}))
	req := httptest.NewRequest(http.MethodGet, "/metricas/resumen?desde=2026-10-06", nil)
	req = req.WithContext(auth.ContextConClaims(req.Context(), &auth.Claims{TenantID: "tenant-1"}))
	response := httptest.NewRecorder()

	handler.Resumen(response, req)

	if response.Code != http.StatusBadRequest {
		t.Fatalf("status inesperado: got %d, body %s", response.Code, response.Body.String())
	}
}
