package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/carta"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/mesa"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/pedido"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
)

func registrarRutas(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", handlerHealth)

	// Auth
	authStore := auth.NuevoStore()
	authSvc := auth.NuevoService(authStore)
	authH := auth.NuevosHandlers(authSvc)
	mux.HandleFunc("POST /auth/magic-link", authH.SolicitarLink)
	mux.HandleFunc("GET /auth/verify", authH.VerificarToken)

	// Tenant
	tenantStore := tenant.NuevoStore()
	tenantSvc := tenant.NuevoService(tenantStore)
	tenantH := tenant.NuevosHandlers(tenantSvc)
	mux.Handle("POST /tenants", http.HandlerFunc(tenantH.Crear))
	mux.Handle("GET /tenants/me", auth.Requerir(http.HandlerFunc(tenantH.ObtenerMe)))

	// Carta (admin — protegida)
	cartaStore := carta.NuevoStore()
	cartaSvc := carta.NuevoService(cartaStore)
	cartaH := carta.NuevosHandlers(cartaSvc)
	mux.Handle("GET /carta/categorias", auth.Requerir(http.HandlerFunc(cartaH.ListarCategorias)))
	mux.Handle("POST /carta/categorias", auth.Requerir(http.HandlerFunc(cartaH.CrearCategoria)))
	mux.Handle("DELETE /carta/categorias/{id}", auth.Requerir(http.HandlerFunc(cartaH.EliminarCategoria)))
	mux.Handle("GET /carta/articulos", auth.Requerir(http.HandlerFunc(cartaH.ListarArticulos)))
	mux.Handle("POST /carta/articulos", auth.Requerir(http.HandlerFunc(cartaH.CrearArticulo)))
	mux.Handle("PATCH /carta/articulos/{id}", auth.Requerir(http.HandlerFunc(cartaH.ActualizarArticulo)))
	mux.Handle("DELETE /carta/articulos/{id}", auth.Requerir(http.HandlerFunc(cartaH.EliminarArticulo)))

	// Mesas (admin — protegidas)
	mesaStore := mesa.NuevoStore()
	mesaSvc := mesa.NuevoService(mesaStore)
	mesaH := mesa.NuevosHandlers(mesaSvc)
	mux.Handle("GET /mesas", auth.Requerir(http.HandlerFunc(mesaH.Listar)))
	mux.Handle("POST /mesas", auth.Requerir(http.HandlerFunc(mesaH.Crear)))
	mux.Handle("PATCH /mesas/{id}", auth.Requerir(http.HandlerFunc(mesaH.Actualizar)))
	mux.Handle("DELETE /mesas/{id}", auth.Requerir(http.HandlerFunc(mesaH.Eliminar)))

	// Pedidos
	pedidoStore := pedido.NuevoStore()
	pedidoSvc := pedido.NuevoService(pedidoStore)
	pedidoH := pedido.NuevosHandlers(pedidoSvc)
	mux.HandleFunc("POST /pedidos", pedidoH.Crear)
	mux.Handle("GET /pedidos", auth.Requerir(http.HandlerFunc(pedidoH.ListarActivos)))
	mux.Handle("PATCH /pedidos/{id}/estado", auth.Requerir(http.HandlerFunc(pedidoH.CambiarEstado)))

	// Públicos (sin auth — cliente con QR)
	mux.HandleFunc("GET /publica/{sucursal_id}/carta", cartaH.CartaPublica)
	mux.HandleFunc("GET /publica/mesa/{qr_token}", mesaH.MesaPorQR)
}

func handlerHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"estado":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
