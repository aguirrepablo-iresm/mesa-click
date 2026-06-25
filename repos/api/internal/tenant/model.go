package tenant

import "errors"

var (
	ErrNotFound  = errors.New("tenant no encontrado")
	ErrValidation = errors.New("error de validación")
)

type Tenant struct {
	ID             string `json:"id"`
	Nombre         string `json:"nombre"`
	NombreFantasia string `json:"nombre_fantasia,omitempty"`
	Rubro          string `json:"rubro"`
	Slug           string `json:"slug"`
	CreatedAt      string `json:"created_at"`
}

type OnboardingInput struct {
	Nombre         string `json:"nombre"`
	NombreFantasia string `json:"nombre_fantasia"`
	Rubro          string `json:"rubro"`
	Slug           string `json:"slug"`
	EmailAdmin     string `json:"email_admin"`
	NombreAdmin    string `json:"nombre_admin"`
}
