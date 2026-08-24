package pedido

import (
	"errors"
	"time"
)

var (
	ErrNotFound  = errors.New("pedido no encontrado")
	ErrValidation = errors.New("validación fallida")
)

var EstadosValidos = []string{"recibido", "preparando", "listo", "cerrado"}

type Pedido struct {
	ID         string       `json:"id"`
	MesaID     string       `json:"mesa_id"`
	SucursalID string       `json:"sucursal_id"`
	Estado     string       `json:"estado"`
	Items      []PedidoItem `json:"items,omitempty"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

type PedidoItem struct {
	ID             string  `json:"id"`
	PedidoID       string  `json:"pedido_id"`
	ArticuloID     string  `json:"articulo_id"`
	NombreArticulo string  `json:"nombre_articulo,omitempty"`
	Cantidad       int     `json:"cantidad"`
	PrecioUnitario float64 `json:"precio_unitario"`
	Notas          string  `json:"notas,omitempty"`
}

type NuevoPedidoInput struct {
	MesaID string          `json:"mesa_id"`
	Items  []NuevoItemInput `json:"items"`
}

type NuevoItemInput struct {
	ArticuloID string `json:"articulo_id"`
	Cantidad   int    `json:"cantidad"`
	Notas      string `json:"notas"`
}

type CambiarEstadoInput struct {
	Estado string `json:"estado"`
}
