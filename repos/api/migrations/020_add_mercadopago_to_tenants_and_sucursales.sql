-- 020_add_mercadopago_to_tenants_and_sucursales.sql
-- Credenciales de cobro de Mercado Pago independientes por negocio (tenant) y por sucursal física.

ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS mp_access_token TEXT,
    ADD COLUMN IF NOT EXISTS mp_public_key TEXT,
    ADD COLUMN IF NOT EXISTS mp_activo BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE sucursales
    ADD COLUMN IF NOT EXISTS mp_access_token TEXT,
    ADD COLUMN IF NOT EXISTS mp_public_key TEXT,
    ADD COLUMN IF NOT EXISTS mp_activo BOOLEAN;
