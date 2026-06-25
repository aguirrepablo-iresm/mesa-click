// cmd/server/rutas.go
//
// Acá se registran todas las rutas de la API.
// Cada ruta conecta una URL con la función (handler) que la maneja.
//
// A medida que avancen los sprints, se agregan rutas acá
// importando los handlers de cada paquete interno.

package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
)

func registrarRutas(mux *http.ServeMux) {

	// --- Health check ---
	// GET /health → verifica que el servidor está vivo.
	// Útil para monitoreo y para que el equipo confirme que todo anda.
	mux.HandleFunc("GET /health", handlerHealth)

	// --- Auth ---
	authStore := auth.NuevoStore()
	authSvc := auth.NuevoService(authStore)
	authH := auth.NuevosHandlers(authSvc)
	mux.HandleFunc("POST /auth/magic-link", authH.SolicitarLink)
	mux.HandleFunc("GET /auth/verify", authH.VerificarToken)

	// --- Tenants ---
	tenantStore := tenant.NuevoStore()
	tenantSvc := tenant.NuevoService(tenantStore)
	tenantH := tenant.NuevosHandlers(tenantSvc)
	mux.Handle("POST /tenants", http.HandlerFunc(tenantH.Crear))
	mux.Handle("GET /tenants/me", auth.Requerir(http.HandlerFunc(tenantH.ObtenerMe)))
}

// handlerHealth responde con el estado del servidor.
// Si el servidor está vivo, responde 200 OK con un JSON simple.
func handlerHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"estado":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
