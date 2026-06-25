package mesa

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

type Service struct {
	store Store
}

func NuevoService(s Store) *Service { return &Service{store: s} }

func (svc *Service) Listar(ctx context.Context, tenantID string) ([]Mesa, error) {
	return svc.store.Listar(ctx, tenantID)
}

func (svc *Service) Crear(ctx context.Context, tenantID string, input MesaInput) (*Mesa, error) {
	if input.Numero <= 0 {
		return nil, fmt.Errorf("número de mesa debe ser mayor a 0: %w", ErrValidation)
	}
	if input.SucursalID == "" {
		return nil, fmt.Errorf("sucursal_id requerido: %w", ErrValidation)
	}
	qrToken, err := generarQRToken()
	if err != nil {
		return nil, fmt.Errorf("error generando QR token: %w", err)
	}
	return svc.store.Crear(ctx, input, qrToken)
}

func (svc *Service) Actualizar(ctx context.Context, id, tenantID string, u MesaUpdate) (*Mesa, error) {
	if u.Estado != nil && *u.Estado != "activa" && *u.Estado != "inactiva" {
		return nil, fmt.Errorf("estado inválido: debe ser 'activa' o 'inactiva': %w", ErrValidation)
	}
	return svc.store.Actualizar(ctx, id, tenantID, u)
}

func (svc *Service) Eliminar(ctx context.Context, id, tenantID string) error {
	return svc.store.Eliminar(ctx, id, tenantID)
}

func (svc *Service) ObtenerPorQRToken(ctx context.Context, token string) (*MesaPublica, error) {
	return svc.store.ObtenerPorQRToken(ctx, token)
}

func generarQRToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
