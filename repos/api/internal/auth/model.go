package auth

import (
	"context"
	"time"
)

type MagicToken struct {
	ID        string
	UsuarioID string
	Token     string
	ExpiresAt time.Time
	UsedAt    *time.Time
}

type UsuarioAuth struct {
	ID       string
	TenantID string
	Email    string
	Rol      string
}

type Claims struct {
	UsuarioID string `json:"usuario_id"`
	TenantID  string `json:"tenant_id"`
	Rol       string `json:"rol"`
}

type ctxKey string

const claimsKey ctxKey = "auth_claims"

func ClaimsFromContext(ctx context.Context) *Claims {
	c, _ := ctx.Value(claimsKey).(*Claims)
	return c
}
