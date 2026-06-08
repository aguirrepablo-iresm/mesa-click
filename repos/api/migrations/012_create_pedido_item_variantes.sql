-- 012_create_pedido_item_variantes.sql
-- Variantes elegidas para un ítem del pedido.
-- Ej: el ítem "Café" tiene la variante "Grande"

CREATE TABLE pedido_item_variantes (
    id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_item_id  UUID  NOT NULL REFERENCES pedido_items(id) ON DELETE CASCADE,
    variante_id     UUID  NOT NULL REFERENCES variantes(id) ON DELETE RESTRICT
);

CREATE INDEX idx_piv_pedido_item ON pedido_item_variantes(pedido_item_id);
