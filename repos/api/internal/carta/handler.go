package carta

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

type Handlers struct {
	svc *Service
}

func NuevosHandlers(svc *Service) *Handlers { return &Handlers{svc: svc} }

func (h *Handlers) ListarCategorias(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	cats, err := h.svc.ListarCategorias(r.Context(), claims.TenantID)
	if err != nil {
		slog.ErrorContext(r.Context(), "error listando categorías", "err", err)
		jsonError(w, "error listando categorías", http.StatusInternalServerError)
		return
	}
	jsonOK(w, cats)
}

func (h *Handlers) CrearCategoria(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	var input CategoriaInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}
	cat, err := h.svc.CrearCategoria(r.Context(), claims.TenantID, input)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cat)
}

func (h *Handlers) EliminarCategoria(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	id := r.PathValue("id")
	if err := h.svc.EliminarCategoria(r.Context(), id, claims.TenantID); err != nil {
		jsonError(w, "categoría no encontrada", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handlers) ListarArticulos(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	arts, err := h.svc.ListarArticulos(r.Context(), claims.TenantID)
	if err != nil {
		slog.ErrorContext(r.Context(), "error listando artículos", "err", err)
		jsonError(w, "error listando artículos", http.StatusInternalServerError)
		return
	}
	jsonOK(w, arts)
}

func (h *Handlers) CrearArticulo(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	var input ArticuloInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}
	art, err := h.svc.CrearArticulo(r.Context(), claims.TenantID, input)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(art)
}

func (h *Handlers) ActualizarArticulo(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	id := r.PathValue("id")
	var u ArticuloUpdate
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}
	art, err := h.svc.ActualizarArticulo(r.Context(), id, claims.TenantID, u)
	if err != nil {
		jsonError(w, "artículo no encontrado", http.StatusNotFound)
		return
	}
	jsonOK(w, art)
}

func (h *Handlers) EliminarArticulo(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	id := r.PathValue("id")
	if err := h.svc.EliminarArticulo(r.Context(), id, claims.TenantID); err != nil {
		jsonError(w, "artículo no encontrado", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handlers) CartaPublica(w http.ResponseWriter, r *http.Request) {
	sucursalID := r.PathValue("sucursal_id")
	c, err := h.svc.ObtenerCartaPublica(r.Context(), sucursalID)
	if err != nil {
		jsonError(w, "carta no disponible", http.StatusNotFound)
		return
	}
	jsonOK(w, c)
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
