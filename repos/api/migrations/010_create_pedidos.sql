-- 010_create_pedidos.sql
-- Un pedido agrupa todo lo que pidió una mesa en una visita.
-- El estado avanza: recibido → preparando → listo → cerrado

CREATE TABLE pedidos (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id      UUID        NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
    sucursal_id  UUID        NOT NULL REFERENCES sucursales(id) ON DELETE RESTRICT,
    estado       TEXT        NOT NULL DEFAULT 'recibido'
                             CHECK (estado IN ('recibido', 'preparando', 'listo', 'cerrado')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedidos_mesa     ON pedidos(mesa_id);
CREATE INDEX idx_pedidos_sucursal ON pedidos(sucursal_id);
CREATE INDEX idx_pedidos_estado   ON pedidos(estado);
