-- 021_add_pago_habilitado_to_mesas.sql
-- Habilitación explícita del pago digital por parte del personal (recepción/mozo)
-- tras la solicitud de cierre de cuenta por parte del comensal.

ALTER TABLE mesas
    ADD COLUMN IF NOT EXISTS pago_habilitado BOOLEAN NOT NULL DEFAULT FALSE;
