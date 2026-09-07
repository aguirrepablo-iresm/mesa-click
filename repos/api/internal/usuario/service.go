package usuario

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/auth"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) Invitar(ctx context.Context, tenantID string, input UsuarioInput) (*UsuarioInvitacionResponse, error) {
	if input.Nombre == "" {
		return nil, fmt.Errorf("%w: nombre requerido", ErrValidation)
	}
	if input.Email == "" {
		return nil, fmt.Errorf("%w: email requerido", ErrValidation)
	}
	if input.Rol != "admin" && input.Rol != "encargado" && input.Rol != "mozo" {
		return nil, fmt.Errorf("%w: rol inválido (debe ser admin, encargado o mozo)", ErrValidation)
	}

	// Mismo criterio que en onboarding: el email es la clave de login.
	input.Email = auth.NormalizarEmail(input.Email)

	u, err := svc.store.Crear(ctx, tenantID, input)
	if err != nil {
		return nil, err
	}

	token, err := svc.store.CrearMagicToken(ctx, u.ID)
	if err != nil {
		slog.ErrorContext(ctx, "error creando token para invitacion", "usuario_id", u.ID, "err", err)
		// No fallamos toda la operacion si falla la creacion del token de invitacion
		return &UsuarioInvitacionResponse{Usuario: u}, nil
	}

	link := auth.ConstruirLinkVerificacion(token)
	slog.InfoContext(ctx, "magic link de invitacion generado", "usuario", u.Email, "url", link)

	return &UsuarioInvitacionResponse{
		Usuario:   u,
		MagicLink: link,
	}, nil
}

func (svc *Service) Listar(ctx context.Context, tenantID string) ([]Usuario, error) {
	return svc.store.Listar(ctx, tenantID)
}

func (svc *Service) Actualizar(ctx context.Context, id string, tenantID string, input ActualizarUsuarioInput) (*Usuario, error) {
	if id == "" {
		return nil, fmt.Errorf("%w: id de usuario requerido", ErrValidation)
	}
	if input.Nombre != nil {
		trimmed := strings.TrimSpace(*input.Nombre)
		if trimmed == "" {
			return nil, fmt.Errorf("%w: el nombre no puede estar vacío", ErrValidation)
		}
		input.Nombre = &trimmed
	}
	if input.Rol != nil {
		rol := strings.ToLower(strings.TrimSpace(*input.Rol))
		if rol != "admin" && rol != "encargado" && rol != "mozo" && rol != "cocina" {
			return nil, fmt.Errorf("%w: rol inválido (debe ser admin, encargado, mozo o cocina)", ErrValidation)
		}
		input.Rol = &rol
	}

	return svc.store.Actualizar(ctx, id, tenantID, input)
}

func (svc *Service) Eliminar(ctx context.Context, id string, tenantID string) error {
	if id == "" {
		return fmt.Errorf("%w: id de usuario requerido", ErrValidation)
	}
	return svc.store.Eliminar(ctx, id, tenantID)
}
