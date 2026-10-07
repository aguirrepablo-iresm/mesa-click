-- Calificaciones y reseñas post-consumo de comensales por mesa y cuenta.

CREATE TABLE IF NOT EXISTS resenas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID NOT NULL REFERENCES mesas(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    cuenta_version INTEGER NOT NULL DEFAULT 1,
    estrellas SMALLINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario TEXT,
    google_cliqueado BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_resenas_mesa_cuenta UNIQUE (mesa_id, cuenta_version)
);

CREATE INDEX IF NOT EXISTS idx_resenas_tenant_id ON resenas (tenant_id);
CREATE INDEX IF NOT EXISTS idx_resenas_sucursal_id ON resenas (sucursal_id);
CREATE INDEX IF NOT EXISTS idx_resenas_created_at ON resenas (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resenas_mesa_cuenta ON resenas (mesa_id, cuenta_version);

