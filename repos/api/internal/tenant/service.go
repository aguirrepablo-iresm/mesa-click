package tenant

import (
	"context"
	"fmt"
	"strings"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) Crear(ctx context.Context, input OnboardingInput) (*Tenant, error) {
	if input.Slug == "" {
		return nil, fmt.Errorf("%w: slug requerido", ErrValidation)
	}
	if input.EmailAdmin == "" {
		return nil, fmt.Errorf("%w: email del admin requerido", ErrValidation)
	}
	input.Rubro = normalizarRubro(input.Rubro)
	return svc.store.Crear(ctx, input)
}

func (svc *Service) ObtenerPorID(ctx context.Context, id string) (*Tenant, error) {
	return svc.store.ObtenerPorID(ctx, id)
}

func normalizarRubro(r string) string {
	r = strings.ToLower(strings.TrimSpace(r))
	// Reemplazar acentos
	r = strings.ReplaceAll(r, "í", "i")
	r = strings.ReplaceAll(r, "á", "a")
	r = strings.ReplaceAll(r, "é", "e")
	r = strings.ReplaceAll(r, "ó", "o")
	r = strings.ReplaceAll(r, "ú", "u")

	switch r {
	case "restaurante", "restaurant":
		return "restaurante"
	case "cafeteria", "cafe":
		return "cafeteria"
	case "comida_rapida", "comida rapida", "fast_food", "fast food":
		return "comida_rapida"
	case "bar", "pub", "bar / pub", "cerveceria":
		return "bar"
	case "otro":
		return "otro"
	default:
		return "otro"
	}
}
