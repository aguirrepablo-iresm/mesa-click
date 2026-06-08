-- 002_create_usuarios.sql
-- Personas que trabajan en el negocio: admin, encargado o mozo.

CREATE TABLE usuarios (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email       TEXT        UNIQUE NOT NULL,
    nombre      TEXT        NOT NULL,
    rol         TEXT        NOT NULL CHECK (rol IN ('admin', 'encargado', 'mozo')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);
