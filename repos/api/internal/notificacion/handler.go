package notificacion

import (
	"fmt"
	"log/slog"
	"net/http"
)

type Handlers struct{}

func NuevosHandlers() *Handlers { return &Handlers{} }

func (h *Handlers) EventosSucursal(w http.ResponseWriter, r *http.Request) {
	sucursalID := r.PathValue("sucursal_id")
	if sucursalID == "" {
		http.Error(w, "sucursal_id requerido", http.StatusBadRequest)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "SSE no soportado", http.StatusInternalServerError)
		return
	}

	// Seteo de headers SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	canal := fmt.Sprintf("sucursal:%s", sucursalID)
	ch, desuscribir := Instancia.Suscribir(canal)
	defer desuscribir()

	slog.InfoContext(r.Context(), "cliente conectado a eventos de sucursal", "sucursal_id", sucursalID)

	// Ping inicial para abrir conexion
	fmt.Fprintf(w, "event: ping\ndata: conectado\n\n")
	flusher.Flush()

	for {
		select {
		case ev, ok := <-ch:
			if !ok {
				return
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", ev.Nombre, ev.Data)
			flusher.Flush()
		case <-r.Context().Done():
			slog.InfoContext(r.Context(), "cliente desconectado de eventos de sucursal", "sucursal_id", sucursalID)
			return
		}
	}
}

func (h *Handlers) EventosPedido(w http.ResponseWriter, r *http.Request) {
	pedidoID := r.PathValue("id")
	if pedidoID == "" {
		http.Error(w, "id de pedido requerido", http.StatusBadRequest)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "SSE no soportado", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	canal := fmt.Sprintf("pedido:%s", pedidoID)
	ch, desuscribir := Instancia.Suscribir(canal)
	defer desuscribir()

	slog.InfoContext(r.Context(), "cliente conectado a eventos de pedido", "pedido_id", pedidoID)

	fmt.Fprintf(w, "event: ping\ndata: conectado\n\n")
	flusher.Flush()

	for {
		select {
		case ev, ok := <-ch:
			if !ok {
				return
			}
			fmt.Fprintf(w, "event: %s\ndata: %s\n\n", ev.Nombre, ev.Data)
			flusher.Flush()
		case <-r.Context().Done():
			slog.InfoContext(r.Context(), "cliente desconectado de eventos de pedido", "pedido_id", pedidoID)
			return
		}
	}
}
