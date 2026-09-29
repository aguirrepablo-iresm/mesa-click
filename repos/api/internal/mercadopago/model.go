package mercadopago

import (
	"errors"
	"time"
)

var (
	ErrMesaNoEncontrada    = errors.New("mesa no encontrada")
	ErrSinConsumos         = errors.New("la mesa no tiene consumos pendientes para pagar")
	ErrTokenNoConfigurado  = errors.New("esta sucursal no tiene configurada su cuenta de Mercado Pago")
	ErrMercadoPagoInactivo = errors.New("los cobros por Mercado Pago no están habilitados para esta sucursal")
	ErrPagoNoAprobado      = errors.New("el pago no fue aprobado por Mercado Pago")
	ErrPagoNoCorresponde   = errors.New("el pago no corresponde a esta mesa o cuenta")
	ErrPagoYaProcesado     = errors.New("el pago ya fue procesado previamente")
	ErrPagoNoHabilitado    = errors.New("el pago aún no ha sido habilitado por recepción")
)

type PreferenciaItem struct {
	ID          string  `json:"id,omitempty"`
	Title       string  `json:"title"`
	Description string  `json:"description,omitempty"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	CurrencyID  string  `json:"currency_id"`
}

type PreferenciaBackURLs struct {
	Success string `json:"success"`
	Failure string `json:"failure"`
	Pending string `json:"pending"`
}

type PreferenciaRequest struct {
	Items             []PreferenciaItem   `json:"items"`
	BackURLs          PreferenciaBackURLs `json:"back_urls"`
	ExternalReference string              `json:"external_reference"`
	NotificationURL   string              `json:"notification_url,omitempty"`
	AutoReturn        string              `json:"auto_return,omitempty"`
}

type PreferenciaResponse struct {
	ID               string `json:"id"`
	InitPoint        string `json:"init_point"`
	SandboxInitPoint string `json:"sandbox_init_point"`
}

type PagoMercadoPago struct {
	ID                int64      `json:"id"`
	Status            string     `json:"status"`
	StatusDetail      string     `json:"status_detail"`
	ExternalReference string     `json:"external_reference"`
	TransactionAmount float64    `json:"transaction_amount"`
	DateApproved      *time.Time `json:"date_approved"`
	PaymentMethodID   string     `json:"payment_method_id"`
	PaymentTypeID     string     `json:"payment_type_id"`
}

type ConfirmarPagoInput struct {
	PaymentID string `json:"payment_id"`
}

type PreferenciaDTO struct {
	PreferenceID     string  `json:"preference_id"`
	InitPoint        string  `json:"init_point"`
	SandboxInitPoint string  `json:"sandbox_init_point"`
	MontoTotal       float64 `json:"monto_total"`
}

type RegistroPago struct {
	ID            string    `json:"id"`
	MesaID        string    `json:"mesa_id"`
	CuentaVersion int       `json:"cuenta_version"`
	Proveedor     string    `json:"proveedor"`
	PreferenciaID string    `json:"preferencia_id"`
	PagoID        string    `json:"pago_id"`
	Monto         float64   `json:"monto"`
	Moneda        string    `json:"moneda"`
	Estado        string    `json:"estado"`
	CreatedAt     time.Time `json:"created_at"`
}
