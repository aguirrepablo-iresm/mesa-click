-- 007_create_categorias.sql
-- Agrupan los artículos del menú. Ej: "Entradas", "Bebidas", "Postres".
-- El campo orden define cómo se muestran en la carta.

CREATE TABLE categorias (
    id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID  NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nombre      TEXT  NOT NULL,
    orden       INT   NOT NULL DEFAULT 0
);

CREATE INDEX idx_categorias_tenant ON categorias(tenant_id);
