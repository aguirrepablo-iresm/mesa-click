-- 011_create_pedido_items.sql
-- Una línea dentro de un pedido: qué artículo, cuántos, con qué nota.
-- precio_unitario es un snapshot: guarda el precio al momento del pedido,
-- aunque después el artículo cambie de precio.

CREATE TABLE pedido_items (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id        UUID           NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    articulo_id      UUID           NOT NULL REFERENCES articulos(id) ON DELETE RESTRICT,
    cantidad         INT            NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(10,2)  NOT NULL CHECK (precio_unitario >= 0),
    notas            TEXT
);

CREATE INDEX idx_pedido_items_pedido   ON pedido_items(pedido_id);
CREATE INDEX idx_pedido_items_articulo ON pedido_items(articulo_id);
