package usuario

import "errors"

var (
	ErrNotFound       = errors.New("usuario no encontrado")
	ErrValidation     = errors.New("error de validación")
	ErrEmailConflict  = errors.New("el email ya está registrado")
)

type Usuario struct {
	ID        string `json:"id"`
	TenantID  string `json:"tenant_id"`
	Email     string `json:"email"`
	Nombre    string `json:"nombre"`
	Rol       string `json:"rol"` // 'admin', 'encargado', 'mozo'
	CreatedAt string `json:"created_at"`
}

type UsuarioInput struct {
	Nombre string `json:"nombre"`
	Email  string `json:"email"`
	Rol    string `json:"rol"`
}

type UsuarioInvitacionResponse struct {
	Usuario   *Usuario `json:"usuario"`
	MagicLink string   `json:"magic_link,omitempty"`
}
