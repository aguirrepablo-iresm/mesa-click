-- 023_add_estado_pedido_items.sql
-- Estado de preparación independiente para cada línea de una comanda.

ALTER TABLE pedido_items
    ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'preparando', 'listo'));

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido_estado
    ON pedido_items(pedido_id, estado);
