-- Sprint 17 / US-72: soporte de métricas operativas.
-- listo_at conserva el instante real en que cocina terminó un pedido; updated_at
-- puede cambiar después al cerrar la cuenta y no sirve para medir despacho.

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS listo_at TIMESTAMPTZ;

UPDATE pedidos
SET listo_at = updated_at
WHERE listo_at IS NULL
  AND estado IN ('listo', 'cerrado');

CREATE INDEX IF NOT EXISTS idx_pedidos_metricas_sucursal_fecha_estado
    ON pedidos (sucursal_id, created_at, estado);

CREATE INDEX IF NOT EXISTS idx_pedidos_metricas_cerrados
    ON pedidos (sucursal_id, created_at)
    INCLUDE (id, updated_at, listo_at)
    WHERE estado = 'cerrado';

CREATE INDEX IF NOT EXISTS idx_pedido_items_metricas_pedido_articulo
    ON pedido_items (pedido_id, articulo_id)
    INCLUDE (cantidad, precio_unitario);
