-- Estado de la cuenta actual de cada mesa.
-- La mesa física permanece activa aunque el mozo cierre una cuenta.

ALTER TABLE mesas
    ADD COLUMN IF NOT EXISTS cuenta_solicitada BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cuenta_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE mesas
    ADD CONSTRAINT mesas_cuenta_version_positive CHECK (cuenta_version > 0);
