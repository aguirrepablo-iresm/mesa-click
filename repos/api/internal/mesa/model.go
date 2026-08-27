package mesa

import "errors"

// Sentinel errors
var (
	ErrNotFound        = errors.New("mesa no encontrada")
	ErrValidation      = errors.New("datos inválidos")
	ErrNumeroDuplicado = errors.New("ya existe una mesa con ese número")
)

type Mesa struct {
	ID         string `json:"id"`
	SucursalID string `json:"sucursal_id"`
	SectorID   string `json:"sector_id,omitempty"`
	Numero     int    `json:"numero"`
	Capacidad  int    `json:"capacidad"`
	QRToken    string `json:"qr_token"`
	Estado     string `json:"estado"` // "activa" | "inactiva"
}

type MesaInput struct {
	SucursalID string `json:"sucursal_id"`
	Numero     int    `json:"numero"`
	Capacidad  int    `json:"capacidad"`
}

type MesaUpdate struct {
	Numero    *int    `json:"numero"`
	Capacidad *int    `json:"capacidad"`
	Estado    *string `json:"estado"`
}

type MesaPublica struct {
	ID         string `json:"id"`
	Numero     int    `json:"numero"`
	SucursalID string `json:"sucursal_id"`
	TenantID   string `json:"tenant_id"`
}
