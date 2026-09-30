package pedido

import "testing"

func TestResolverEstadoPedido(t *testing.T) {
	tests := []struct {
		nombre    string
		total     int
		listos    int
		iniciados int
		esperado  string
	}{
		{nombre: "todos pendientes", total: 3, esperado: "recibido"},
		{nombre: "uno preparando", total: 3, iniciados: 1, esperado: "preparando"},
		{nombre: "uno listo y faltan items", total: 3, listos: 1, iniciados: 1, esperado: "preparando"},
		{nombre: "todos listos", total: 3, listos: 3, iniciados: 3, esperado: "listo"},
	}

	for _, tt := range tests {
		t.Run(tt.nombre, func(t *testing.T) {
			if obtenido := resolverEstadoPedido(tt.total, tt.listos, tt.iniciados); obtenido != tt.esperado {
				t.Fatalf("estado incorrecto: got %q, want %q", obtenido, tt.esperado)
			}
		})
	}
}
