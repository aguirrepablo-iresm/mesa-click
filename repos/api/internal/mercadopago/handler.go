package mercadopago

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
)

type Handlers struct {
	svc *Service
}

func NuevosHandlers(svc *Service) *Handlers {
	return &Handlers{svc: svc}
}

func (h *Handlers) CrearPreferencia(w http.ResponseWriter, r *http.Request) {
	qrToken := r.PathValue("qr_token")
	if qrToken == "" {
		jsonError(w, "qr_token requerido", http.StatusBadRequest)
		return
	}

	dto, err := h.svc.CrearPreferenciaMesa(r.Context(), qrToken)
	if err != nil {
		if errors.Is(err, ErrMesaNoEncontrada) {
			jsonError(w, "mesa no encontrada", http.StatusNotFound)
			return
		}
		if errors.Is(err, ErrSinConsumos) {
			jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		slog.ErrorContext(r.Context(), "error creando preferencia de mercado pago", "err", err)
		jsonError(w, "error generando orden de pago", http.StatusInternalServerError)
		return
	}

	jsonOK(w, dto)
}

func (h *Handlers) ConfirmarPago(w http.ResponseWriter, r *http.Request) {
	qrToken := r.PathValue("qr_token")
	if qrToken == "" {
		jsonError(w, "qr_token requerido", http.StatusBadRequest)
		return
	}

	var input ConfirmarPagoInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "cuerpo de solicitud inválido", http.StatusBadRequest)
		return
	}

	registro, err := h.svc.ConfirmarPago(r.Context(), qrToken, input.PaymentID)
	if err != nil {
		if errors.Is(err, ErrPagoNoAprobado) || errors.Is(err, ErrPagoNoCorresponde) {
			jsonError(w, err.Error(), http.StatusBadRequest)
			return
		}
		slog.ErrorContext(r.Context(), "error confirmando pago", "err", err)
		jsonError(w, "error confirmando pago", http.StatusInternalServerError)
		return
	}

	jsonOK(w, registro)
}

func (h *Handlers) Webhook(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	var body struct {
		Action string `json:"action"`
		Type   string `json:"type"`
		Data   struct {
			ID string `json:"id"`
		} `json:"data"`
	}

	_ = json.NewDecoder(r.Body).Decode(&body)

	err := h.svc.ProcesarWebhook(r.Context(), query, body.Data.ID, body.Type)
	if err != nil {
		slog.ErrorContext(r.Context(), "error en webhook de mercado pago", "err", err)
		// Devolvemos 200 igualmente para que Mercado Pago no reintente indefinidamente en caso de payloads no válidos
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
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
