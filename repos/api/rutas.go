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
)

func registrarRutas(mux *http.ServeMux) {

	// --- Health check ---
	// GET /health → verifica que el servidor está vivo.
	// Útil para monitoreo y para que el equipo confirme que todo anda.
	mux.HandleFunc("GET /health", handlerHealth)

	// --- Próximas rutas (se agregan en sprints siguientes) ---
	//
	// Sprint 4 — Auth:
	//   mux.HandleFunc("POST /auth/magic-link", auth.HandlerSolicitarLink)
	//   mux.HandleFunc("GET  /auth/verify",      auth.HandlerVerificarToken)
	//
	// Sprint 4 — Tenants:
	//   mux.HandleFunc("POST /tenants", tenant.HandlerCrear)
	//
	// Sprint 5 — Carta:
	//   mux.HandleFunc("GET  /articulos",     carta.HandlerListar)
	//   mux.HandleFunc("POST /articulos",     carta.HandlerCrear)
	//
	// Sprint 5 — Pedidos:
	//   mux.HandleFunc("POST /pedidos",              pedido.HandlerCrear)
	//   mux.HandleFunc("PATCH /pedidos/{id}/estado", pedido.HandlerCambiarEstado)
	//
	// Sprint 5 — Menú público (cliente via QR):
	//   mux.HandleFunc("GET /mesa/{token}", mesa.HandlerCartaPublica)
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
