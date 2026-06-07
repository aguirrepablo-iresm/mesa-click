-- 009_create_variantes.sql
-- Opciones de un artículo con precio adicional.
-- Ej: artículo "Café" → variantes "Chico", "Grande +$300", "Con leche de avena +$500"

CREATE TABLE variantes (
    id                UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    articulo_id       UUID           NOT NULL REFERENCES articulos(id) ON DELETE CASCADE,
    nombre            TEXT           NOT NULL,
    precio_adicional  NUMERIC(10,2)  NOT NULL DEFAULT 0 CHECK (precio_adicional >= 0)
);

CREATE INDEX idx_variantes_articulo ON variantes(articulo_id);
