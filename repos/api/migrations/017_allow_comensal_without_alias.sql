-- US-81: el alias es opcional. El UUID sigue siendo obligatorio para distinguir
-- los consumos anónimos y bloquear el desglose individual hasta identificarlos.

ALTER TABLE pedido_items
    DROP CONSTRAINT IF EXISTS pedido_items_comensal_completo;

UPDATE pedido_items
SET comensal_nombre = NULL
WHERE comensal_nombre IS NOT NULL
  AND BTRIM(comensal_nombre) = '';

ALTER TABLE pedido_items
    ADD CONSTRAINT pedido_items_comensal_completo CHECK (
        (comensal_id IS NULL AND comensal_nombre IS NULL)
        OR
        comensal_id IS NOT NULL
    );
