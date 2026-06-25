package pedido

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

type Handlers struct {
	svc *Service
}

func NuevosHandlers(svc *Service) *Handlers { return &Handlers{svc: svc} }

func (h *Handlers) Crear(w http.ResponseWriter, r *http.Request) {
	var input NuevoPedidoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}
	p, err := h.svc.Crear(r.Context(), input)
	if err != nil {
		if errors.Is(err, ErrValidation) || errors.Is(err, ErrNotFound) {
			jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		slog.ErrorContext(r.Context(), "error creando pedido", "error", err)
		jsonError(w, "error interno", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}

func (h *Handlers) ListarActivos(w http.ResponseWriter, r *http.Request) {
	sucursalID := r.URL.Query().Get("sucursal_id")
	if sucursalID == "" {
		jsonError(w, "sucursal_id requerido como query param", http.StatusBadRequest)
		return
	}
	pedidos, err := h.svc.ListarActivos(r.Context(), sucursalID)
	if err != nil {
		slog.ErrorContext(r.Context(), "error listando pedidos", "error", err)
		jsonError(w, "error listando pedidos", http.StatusInternalServerError)
		return
	}
	jsonOK(w, pedidos)
}

func (h *Handlers) CambiarEstado(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	id := r.PathValue("id")
	var input CambiarEstadoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}
	p, err := h.svc.CambiarEstado(r.Context(), id, claims.TenantID, input.Estado)
	if err != nil {
		if errors.Is(err, ErrValidation) {
			jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		if errors.Is(err, ErrNotFound) {
			jsonError(w, "pedido no encontrado", http.StatusNotFound)
			return
		}
		slog.ErrorContext(r.Context(), "error cambiando estado", "error", err)
		jsonError(w, "error interno", http.StatusInternalServerError)
		return
	}
	jsonOK(w, p)
}

func jsonOK(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
