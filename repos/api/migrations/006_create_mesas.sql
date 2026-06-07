-- 006_create_mesas.sql
-- Mesa física con su QR único. El qr_token es lo que va en la URL del cliente.

CREATE TABLE mesas (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id  UUID    NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    sector_id    UUID    REFERENCES sectores(id) ON DELETE SET NULL,
    numero       INT     NOT NULL,
    capacidad    INT     NOT NULL DEFAULT 4,
    qr_token     TEXT    UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
    estado       TEXT    NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),

    UNIQUE (sucursal_id, numero)
);

CREATE INDEX idx_mesas_sucursal ON mesas(sucursal_id);
CREATE INDEX idx_mesas_qr_token ON mesas(qr_token);
