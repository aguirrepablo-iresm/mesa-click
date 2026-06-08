-- 004_create_sucursales.sql
-- Sede física de un negocio. Un tenant puede tener varias.

CREATE TABLE sucursales (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre      TEXT        NOT NULL,
    whatsapp    TEXT,
    email       TEXT,
    telefono    TEXT,
    horarios    JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sucursales_tenant ON sucursales(tenant_id);
