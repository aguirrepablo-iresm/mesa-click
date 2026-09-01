package main

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/carta"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/mesa"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/notificacion"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/pedido"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/sucursal"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/usuario"
)

func registrarRutas(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", handlerHealth)

	// Auth & Email Provider
	// proveedorReal indica si hay un canal de email de verdad configurado.
	// Si no lo hay, el magic link solo se loguea, así que fuera de producción
	// lo devolvemos en la respuesta del endpoint para poder probar el login.
	proveedorReal := false
	var emailSender auth.EmailSender = &auth.LogEmailSender{}

	if brevoAPIKey := os.Getenv("BREVO_API_KEY"); brevoAPIKey != "" {
		senderEmail := os.Getenv("BREVO_FROM_EMAIL")
		if senderEmail == "" {
			senderEmail = os.Getenv("FROM_EMAIL")
		}
		senderName := os.Getenv("BREVO_SENDER_NAME")
		if senderName == "" {
			senderName = "Mesa CLICK"
		}
		emailSender = auth.NuevoBrevoEmailSender(brevoAPIKey, senderName, senderEmail)
		proveedorReal = true
	} else if smtpHost := os.Getenv("SMTP_HOST"); smtpHost != "" {
		smtpPort := os.Getenv("SMTP_PORT")
		smtpUser := os.Getenv("SMTP_USER")
		smtpPass := os.Getenv("SMTP_PASS")
		if smtpPass == "" {
			smtpPass = os.Getenv("SMTP_PASSWORD")
		}
		smtpFrom := os.Getenv("SMTP_FROM")
		if smtpFrom == "" {
			smtpFrom = os.Getenv("FROM_EMAIL")
		}
		emailSender = auth.NuevoSMTPEmailSender(smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom)
		proveedorReal = true
	} else if resendAPIKey := os.Getenv("RESEND_API_KEY"); resendAPIKey != "" {
		fromEmail := os.Getenv("FROM_EMAIL")
		if fromEmail == "" {
			fromEmail = "onboarding@resend.dev"
		}
		emailSender = auth.NuevoResendEmailSender(resendAPIKey, fromEmail)
		proveedorReal = true
	}

	esProduccion := os.Getenv("APP_ENV") == "production"
	if !proveedorReal {
		slog.Warn("sin proveedor de email configurado: el magic link solo se escribe en el log",
			"produccion", esProduccion)
	}

	authStore := auth.NuevoStore()
	authSvc := auth.NuevoService(authStore, emailSender)
	authH := auth.NuevosHandlers(authSvc, !proveedorReal && !esProduccion)
	mux.HandleFunc("POST /auth/magic-link", authH.SolicitarLink)
	mux.HandleFunc("GET /auth/verify", authH.VerificarToken)

	// Tenant
	tenantStore := tenant.NuevoStore()
	tenantSvc := tenant.NuevoService(tenantStore)
	tenantH := tenant.NuevosHandlers(tenantSvc)
	mux.Handle("POST /tenants", http.HandlerFunc(tenantH.Crear))
	mux.Handle("GET /tenants/email-disponible", http.HandlerFunc(tenantH.EmailAdminDisponible))
	mux.Handle("GET /tenants/me", auth.Requerir(http.HandlerFunc(tenantH.ObtenerMe)))

	// Sucursales y Sectores (admin — protegidas)
	sucursalStore := sucursal.NuevoStore()
	sucursalSvc := sucursal.NuevoService(sucursalStore)
	sucursalH := sucursal.NuevosHandlers(sucursalSvc)
	mux.Handle("GET /sucursales", auth.Requerir(http.HandlerFunc(sucursalH.Listar)))
	mux.Handle("GET /sucursales/{id}", auth.Requerir(http.HandlerFunc(sucursalH.ObtenerPorID)))
	mux.Handle("POST /sucursales", auth.Requerir(http.HandlerFunc(sucursalH.Crear)))
	mux.Handle("PATCH /sucursales/{id}", auth.Requerir(http.HandlerFunc(sucursalH.Actualizar)))
	mux.Handle("DELETE /sucursales/{id}", auth.Requerir(http.HandlerFunc(sucursalH.Eliminar)))

	mux.Handle("POST /sucursales/{sucursal_id}/sectores", auth.Requerir(http.HandlerFunc(sucursalH.CrearSector)))
	mux.Handle("GET /sucursales/{sucursal_id}/sectores", auth.Requerir(http.HandlerFunc(sucursalH.ListarSectores)))
	mux.Handle("DELETE /sectores/{id}", auth.Requerir(http.HandlerFunc(sucursalH.EliminarSector)))

	// Equipo / Usuarios (admin — protegidas)
	usuarioStore := usuario.NuevoStore()
	usuarioSvc := usuario.NuevoService(usuarioStore)
	usuarioH := usuario.NuevosHandlers(usuarioSvc)
	mux.Handle("GET /usuarios", auth.Requerir(http.HandlerFunc(usuarioH.Listar)))
	mux.Handle("POST /usuarios", auth.Requerir(http.HandlerFunc(usuarioH.Invitar)))
	mux.Handle("DELETE /usuarios/{id}", auth.Requerir(http.HandlerFunc(usuarioH.Eliminar)))

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

	// Notificaciones / SSE
	notificacionH := notificacion.NuevosHandlers()
	mux.Handle("GET /sucursales/{sucursal_id}/eventos", auth.Requerir(http.HandlerFunc(notificacionH.EventosSucursal)))
	mux.HandleFunc("GET /pedidos/{id}/eventos", notificacionH.EventosPedido)

	// Públicos (sin auth — cliente con QR)
	mux.HandleFunc("GET /publica/sucursales/{sucursal_id}/carta", cartaH.CartaPublica)
	mux.HandleFunc("GET /publica/mesas/{qr_token}", mesaH.MesaPorQR)
}

func handlerHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	dbEstado := "ok"
	status := http.StatusOK

	if db.Pool != nil {
		if err := db.Pool.Ping(r.Context()); err != nil {
			dbEstado = "error: " + err.Error()
			status = http.StatusServiceUnavailable
		}
	} else {
		dbEstado = "desconectado"
	}

	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]any{
		"servicio":  "mesa-click-api",
		"estado":    "ok",
		"database":  dbEstado,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
