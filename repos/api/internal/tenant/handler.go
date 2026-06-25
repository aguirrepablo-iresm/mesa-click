package tenant

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
	"github.com/jackc/pgx/v5/pgconn"
)

type Handlers struct {
	svc *Service
}

func NuevosHandlers(svc *Service) *Handlers { return &Handlers{svc: svc} }

func (h *Handlers) Crear(w http.ResponseWriter, r *http.Request) {
	var input OnboardingInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "body inválido", http.StatusBadRequest)
		return
	}

	t, err := h.svc.Crear(r.Context(), input)
	if err != nil {
		// Validation errors from service layer are safe to expose
		if errors.Is(err, ErrValidation) {
			jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		// DB errors (including slug conflict) are sanitized
		slog.ErrorContext(r.Context(), "error creando tenant", "err", err)
		if isSlugConflict(err) {
			jsonError(w, "el slug ya está en uso", http.StatusConflict)
		} else {
			jsonError(w, "error creando negocio", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}

func (h *Handlers) ObtenerMe(w http.ResponseWriter, r *http.Request) {
	claims := auth.ClaimsFromContext(r.Context())
	if claims == nil {
		jsonError(w, "no autorizado", http.StatusUnauthorized)
		return
	}

	t, err := h.svc.ObtenerPorID(r.Context(), claims.TenantID)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			jsonError(w, "tenant no encontrado", http.StatusNotFound)
		} else {
			slog.ErrorContext(r.Context(), "error obteniendo tenant", "err", err)
			jsonError(w, "error interno", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// isSlugConflict detects a PostgreSQL unique-constraint violation (code 23505).
func isSlugConflict(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}
