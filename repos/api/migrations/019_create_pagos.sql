-- Historial y registro de pagos realizados por mesa y cuenta.

CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    cuenta_version INTEGER NOT NULL DEFAULT 1,
    proveedor VARCHAR(50) NOT NULL DEFAULT 'mercadopago',
    preferencia_id VARCHAR(100),
    pago_id VARCHAR(100),
    monto NUMERIC(10, 2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'ARS',
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_mesa_cuenta ON pagos (mesa_id, cuenta_version);
CREATE INDEX IF NOT EXISTS idx_pagos_pago_id ON pagos (pago_id);
CREATE INDEX IF NOT EXISTS idx_pagos_preferencia_id ON pagos (preferencia_id);
