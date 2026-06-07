-- 008_create_articulos.sql
-- Platos o bebidas del menú. Pertenecen a un tenant y a una categoría.
-- sucursal_id es opcional: si es NULL, el artículo aplica a todas las sucursales.

CREATE TABLE articulos (
    id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID           NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sucursal_id  UUID           REFERENCES sucursales(id) ON DELETE CASCADE,
    categoria_id UUID           NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre       TEXT           NOT NULL,
    descripcion  TEXT,
    precio       NUMERIC(10,2)  NOT NULL CHECK (precio >= 0),
    foto_url     TEXT,
    activo       BOOLEAN        NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_articulos_tenant    ON articulos(tenant_id);
CREATE INDEX idx_articulos_categoria ON articulos(categoria_id);
