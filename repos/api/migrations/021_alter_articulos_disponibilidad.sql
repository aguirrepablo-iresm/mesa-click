-- 021_alter_articulos_disponibilidad.sql
-- US-62: Disponibilidad de ítems (86) y reposición automática

ALTER TABLE articulos 
    ADD COLUMN disponible BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN reponer_diariamente BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX idx_articulos_disponible ON articulos(tenant_id, disponible);
