-- 001_create_tenants.sql
-- El negocio raíz. Todo lo demás le pertenece a un tenant.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tenants (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          TEXT        NOT NULL,
    nombre_fantasia TEXT        NOT NULL,
    rubro           TEXT        NOT NULL CHECK (rubro IN ('restaurante', 'cafeteria', 'comida_rapida', 'bar', 'otro')),
    descripcion     TEXT,
    redes_sociales  JSONB       NOT NULL DEFAULT '{}',
    slug            TEXT        UNIQUE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
