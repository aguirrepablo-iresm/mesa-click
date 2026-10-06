package main

import "testing"

func TestEsEntornoDesarrolloLocal(t *testing.T) {
	tests := []struct {
		nombre   string
		entorno  string
		appURL   string
		esperado bool
	}{
		{nombre: "sin entorno en localhost", entorno: "", appURL: "http://localhost:3000", esperado: true},
		{nombre: "sin entorno en loopback", entorno: "", appURL: "http://127.0.0.1:3000", esperado: true},
		{nombre: "sin entorno ni URL", entorno: "", esperado: false},
		{nombre: "sin entorno en dominio público", entorno: "", appURL: "https://mesaclick.app", esperado: false},
		{nombre: "development", entorno: "development", esperado: true},
		{nombre: "local normalizado", entorno: " LOCAL ", esperado: true},
		{nombre: "qa", entorno: "qa", esperado: false},
		{nombre: "staging", entorno: "staging", esperado: false},
		{nombre: "produccion", entorno: "production", esperado: false},
	}

	for _, tt := range tests {
		t.Run(tt.nombre, func(t *testing.T) {
			if obtenido := esEntornoDesarrolloLocal(tt.entorno, tt.appURL); obtenido != tt.esperado {
				t.Fatalf(
					"esEntornoDesarrolloLocal(%q, %q) = %v; esperado %v",
					tt.entorno,
					tt.appURL,
					obtenido,
					tt.esperado,
				)
			}
		})
	}
}
