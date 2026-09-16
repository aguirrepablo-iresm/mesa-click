package carta

import "errors"

// Sentinel errors
var (
	ErrNotFound  = errors.New("recurso no encontrado")
	ErrValidation = errors.New("datos inválidos")
)

type Categoria struct {
	ID       string `json:"id"`
	TenantID string `json:"tenant_id,omitempty"`
	Nombre   string `json:"nombre"`
	Orden    int    `json:"orden"`
}

type Articulo struct {
	ID          string     `json:"id"`
	TenantID    string     `json:"tenant_id,omitempty"`
	CategoriaID string     `json:"categoria_id"`
	Nombre      string     `json:"nombre"`
	Descripcion string     `json:"descripcion,omitempty"`
	Precio      float64    `json:"precio"`
	FotoURL     string     `json:"foto_url,omitempty"`
	Activo      bool       `json:"activo"`
	Variantes   []Variante `json:"variantes,omitempty"`
}

type Variante struct {
	ID              string  `json:"id"`
	ArticuloID      string  `json:"articulo_id"`
	Nombre          string  `json:"nombre"`
	PrecioAdicional float64 `json:"precio_adicional"`
	Grupo           *string `json:"grupo,omitempty"`
	SeleccionUnica  bool    `json:"seleccion_unica"`
	Orden           int     `json:"orden"`
}

type CrearVarianteInput struct {
	Nombre          string  `json:"nombre"`
	PrecioAdicional float64 `json:"precio_adicional"`
	Grupo           *string `json:"grupo,omitempty"`
	SeleccionUnica  bool    `json:"seleccion_unica"`
	Orden           int     `json:"orden"`
}

type ActualizarVarianteInput struct {
	Nombre          *string  `json:"nombre,omitempty"`
	PrecioAdicional *float64 `json:"precio_adicional,omitempty"`
	Grupo           *string  `json:"grupo,omitempty"`
	SeleccionUnica  *bool    `json:"seleccion_unica,omitempty"`
	Orden           *int     `json:"orden,omitempty"`
}

type CategoriaInput struct {
	Nombre string `json:"nombre"`
	Orden  int    `json:"orden"`
}

type ArticuloInput struct {
	CategoriaID string  `json:"categoria_id"`
	Nombre      string  `json:"nombre"`
	Descripcion string  `json:"descripcion"`
	Precio      float64 `json:"precio"`
	FotoURL     string  `json:"foto_url"`
}

type ArticuloUpdate struct {
	Nombre *string  `json:"nombre"`
	Precio *float64 `json:"precio"`
	Activo *bool    `json:"activo"`
}

type CartaPublica struct {
	Categorias []CategoriaConArticulos `json:"categorias"`
}

type CategoriaConArticulos struct {
	Categoria
	Articulos []Articulo `json:"articulos"`
}
