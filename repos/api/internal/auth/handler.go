package auth

import (
	"encoding/json"
	"net/http"
	"os"
)

type Handlers struct {
	svc *Service
	// exponerLink habilita devolver el magic link en la respuesta HTTP.
	// Solo se activa fuera de producción y sin proveedor de email real, para
	// poder probar el login sin casilla de correo.
	exponerLink bool
}

func NuevosHandlers(svc *Service, exponerLink bool) *Handlers {
	return &Handlers{svc: svc, exponerLink: exponerLink}
}

func (h *Handlers) SolicitarLink(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Email == "" {
		jsonError(w, "email requerido", http.StatusBadRequest)
		return
	}

	link, err := h.svc.SolicitarLink(r.Context(), body.Email)
	if err != nil {
		jsonError(w, "error interno", http.StatusInternalServerError)
		return
	}

	resp := map[string]string{"mensaje": "si el email existe, recibirás un link"}
	if h.exponerLink && link != "" {
		resp["magic_link_dev"] = link
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func (h *Handlers) VerificarToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		jsonError(w, "token requerido", http.StatusBadRequest)
		return
	}

	usuario, err := h.svc.VerificarToken(r.Context(), token)
	if err != nil {
		jsonError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	secreto := os.Getenv("JWT_SECRET")
	jwt, err := GenerarJWT(&Claims{
		UsuarioID: usuario.ID,
		TenantID:  usuario.TenantID,
		Rol:       usuario.Rol,
	}, secreto)
	if err != nil {
		jsonError(w, "error generando sesión", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    jwt,
		HttpOnly: true,
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 30,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": jwt})
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
