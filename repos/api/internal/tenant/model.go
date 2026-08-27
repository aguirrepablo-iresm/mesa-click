package tenant

import (
	"errors"
	"time"
)

var (
	ErrNotFound           = errors.New("tenant no encontrado")
	ErrValidation         = errors.New("error de validación")
	ErrSlugConflict       = errors.New("nombre de url ya utilizado")
	ErrEmailAdminConflict = errors.New("correo de acceso ya registrado")
)

type Tenant struct {
	ID             string    `json:"id"`
	Nombre         string    `json:"nombre"`
	NombreFantasia string    `json:"nombre_fantasia,omitempty"`
	Rubro          string    `json:"rubro"`
	Slug           string    `json:"slug"`
	CreatedAt      time.Time `json:"created_at"`
}

type OnboardingInput struct {
	Nombre         string         `json:"nombre"`
	NombreFantasia string         `json:"nombre_fantasia"`
	Rubro          string         `json:"rubro"`
	Slug           string         `json:"slug"`
	EmailAdmin     string         `json:"email_admin"`
	NombreAdmin    string         `json:"nombre_admin"`
	SucursalNombre string         `json:"sucursal_nombre"`
	Whatsapp       string         `json:"whatsapp"`
	EmailSucursal  string         `json:"email_sucursal"`
	Horarios       map[string]any `json:"horarios"`
}
