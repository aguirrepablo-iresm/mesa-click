package sucursal

import "errors"

var (
	ErrNotFound       = errors.New("sucursal no encontrada")
	ErrSectorNotFound = errors.New("sector no encontrado")
	ErrValidation     = errors.New("error de validación")
)

type Sucursal struct {
	ID        string         `json:"id"`
	TenantID  string         `json:"tenant_id"`
	Nombre    string         `json:"nombre"`
	Whatsapp  *string        `json:"whatsapp,omitempty"`
	Email     *string        `json:"email,omitempty"`
	Telefono  *string        `json:"telefono,omitempty"`
	Horarios  map[string]any `json:"horarios"`
	CreatedAt string         `json:"created_at"`
}

type SucursalInput struct {
	Nombre   string         `json:"nombre"`
	Whatsapp *string        `json:"whatsapp,omitempty"`
	Email    *string        `json:"email,omitempty"`
	Telefono *string        `json:"telefono,omitempty"`
	Horarios map[string]any `json:"horarios,omitempty"`
}

type Sector struct {
	ID         string `json:"id"`
	SucursalID string `json:"sucursal_id"`
	Nombre     string `json:"nombre"`
}

type SectorInput struct {
	Nombre string `json:"nombre"`
}
