-- 022_add_franjas_horarias.sql
-- Franjas opcionales para resolver la carta pública según la hora local.
-- Un artículo sin franja propia hereda la de su categoría. Si tampoco existe
-- una franja en la categoría, queda disponible durante todo el día.

CREATE TABLE IF NOT EXISTS franjas_horarias (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre      TEXT        NOT NULL,
    hora_inicio TIME        NOT NULL,
    hora_fin    TIME        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT franjas_horarias_horas_distintas CHECK (hora_inicio <> hora_fin),
    CONSTRAINT franjas_horarias_nombre_tenant_unique UNIQUE (tenant_id, nombre)
);

ALTER TABLE categorias
    ADD COLUMN IF NOT EXISTS franja_horaria_id UUID
        REFERENCES franjas_horarias(id) ON DELETE SET NULL;

ALTER TABLE articulos
    ADD COLUMN IF NOT EXISTS franja_horaria_id UUID
        REFERENCES franjas_horarias(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_franjas_horarias_tenant
    ON franjas_horarias(tenant_id);

CREATE INDEX IF NOT EXISTS idx_categorias_franja_horaria
    ON categorias(franja_horaria_id);

CREATE INDEX IF NOT EXISTS idx_articulos_franja_horaria
    ON articulos(franja_horaria_id);
