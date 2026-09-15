-- US-81: identidad anónima por dispositivo y pertenencia a la cuenta vigente.
-- Los campos de comensal quedan nullable para conservar pedidos históricos y
-- permitir cargas asistidas del personal que no tengan un comensal asociado.

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS cuenta_version INTEGER NOT NULL DEFAULT 1;

UPDATE pedidos p
SET cuenta_version = m.cuenta_version
FROM mesas m
WHERE p.mesa_id = m.id
  AND p.estado != 'cerrado';

ALTER TABLE pedidos
    ADD CONSTRAINT pedidos_cuenta_version_positive CHECK (cuenta_version > 0);

CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_cuenta_version
    ON pedidos(mesa_id, cuenta_version);

ALTER TABLE pedido_items
    ADD COLUMN IF NOT EXISTS comensal_id UUID,
    ADD COLUMN IF NOT EXISTS comensal_nombre VARCHAR(100);

ALTER TABLE pedido_items
    ADD CONSTRAINT pedido_items_comensal_completo CHECK (
        (comensal_id IS NULL AND comensal_nombre IS NULL)
        OR
        (comensal_id IS NOT NULL AND NULLIF(BTRIM(comensal_nombre), '') IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS idx_pedido_items_comensal
    ON pedido_items(comensal_id);
