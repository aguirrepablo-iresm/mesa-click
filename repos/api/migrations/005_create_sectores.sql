-- 005_create_sectores.sql
-- Zona dentro de una sucursal. Ej: "Salón principal", "Terraza", "Barra".

CREATE TABLE sectores (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id  UUID  NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre       TEXT  NOT NULL
);

CREATE INDEX idx_sectores_sucursal ON sectores(sucursal_id);
