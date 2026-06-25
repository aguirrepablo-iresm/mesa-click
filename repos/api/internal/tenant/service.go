package tenant

import (
	"context"
	"errors"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) Crear(ctx context.Context, input OnboardingInput) (*Tenant, error) {
	if input.Slug == "" {
		return nil, errors.New("slug requerido")
	}
	if input.EmailAdmin == "" {
		return nil, errors.New("email del admin requerido")
	}
	return svc.store.Crear(ctx, input)
}

func (svc *Service) ObtenerPorID(ctx context.Context, id string) (*Tenant, error) {
	return svc.store.ObtenerPorID(ctx, id)
}
