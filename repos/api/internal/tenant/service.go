package tenant

import (
	"context"
	"fmt"
	"strings"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
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
	// El login por magic link busca al usuario por email; guardarlo siempre en
	// minúsculas evita que un registro con mayúsculas quede inaccesible.
	input.EmailAdmin = auth.NormalizarEmail(input.EmailAdmin)
	input.EmailSucursal = auth.NormalizarEmail(input.EmailSucursal)
	input.SucursalNombre = strings.TrimSpace(input.SucursalNombre)
	input.Whatsapp = strings.TrimSpace(input.Whatsapp)
	if input.SucursalNombre == "" {
		input.SucursalNombre = "Casa central"
	}
	if input.Horarios == nil {
		input.Horarios = make(map[string]any)
	}
	return svc.store.Crear(ctx, input)
}

func (svc *Service) ObtenerPorID(ctx context.Context, id string) (*Tenant, error) {
	return svc.store.ObtenerPorID(ctx, id)
}

func (svc *Service) Actualizar(ctx context.Context, id string, input ActualizarTenantInput) (*Tenant, error) {
	if id == "" {
		return nil, fmt.Errorf("%w: id de tenant requerido", ErrValidation)
	}
	if input.Nombre != nil {
		trimmed := strings.TrimSpace(*input.Nombre)
		if trimmed == "" {
			return nil, fmt.Errorf("%w: el nombre no puede estar vacío", ErrValidation)
		}
		input.Nombre = &trimmed
	}
	if input.NombreFantasia != nil {
		trimmed := strings.TrimSpace(*input.NombreFantasia)
		input.NombreFantasia = &trimmed
	}
	if input.Rubro != nil {
		normalizado := normalizarRubro(*input.Rubro)
		input.Rubro = &normalizado
	}
	if input.EmailContacto != nil {
		normalizado := auth.NormalizarEmail(*input.EmailContacto)
		input.EmailContacto = &normalizado
	}
	if input.Whatsapp != nil {
		trimmed := strings.TrimSpace(*input.Whatsapp)
		input.Whatsapp = &trimmed
	}
	if input.Descripcion != nil {
		trimmed := strings.TrimSpace(*input.Descripcion)
		input.Descripcion = &trimmed
	}
	if input.GoogleReviewURL != nil {
		trimmed := strings.TrimSpace(*input.GoogleReviewURL)
		input.GoogleReviewURL = &trimmed
	}
	if input.LogoURL != nil {
		trimmed := strings.TrimSpace(*input.LogoURL)
		input.LogoURL = &trimmed
	}
	if input.ColorPrimario != nil {
		trimmed := strings.TrimSpace(*input.ColorPrimario)
		input.ColorPrimario = &trimmed
	}
	if input.EstiloVisual != nil {
		trimmed := strings.ToLower(strings.TrimSpace(*input.EstiloVisual))
		if trimmed != "claro" && trimmed != "oscuro" {
			trimmed = "oscuro"
		}
		input.EstiloVisual = &trimmed
	}

	return svc.store.Actualizar(ctx, id, input)
}

func (svc *Service) EmailAdminDisponible(ctx context.Context, email string) (bool, error) {
	email = auth.NormalizarEmail(email)
	if email == "" {
		return false, fmt.Errorf("%w: email del admin requerido", ErrValidation)
	}

	enUso, err := svc.store.EmailAdminEnUso(ctx, email)
	if err != nil {
		return false, err
	}
	return !enUso, nil
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
	case "cerveceria":
		return "cerveceria"
	case "pizzeria":
		return "pizzeria"
	case "bar", "pub", "bar / pub":
		return "bar"
	case "otro":
		return "otro"
	default:
		return "otro"
	}
}
