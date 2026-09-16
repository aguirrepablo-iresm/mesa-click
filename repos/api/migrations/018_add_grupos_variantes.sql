-- 018_add_grupos_variantes.sql
-- Grupos de variantes (ej: "Término de cocción", "Guarnición", "Extras"),
-- selección única (radio vs checkbox) y orden de visualización.

ALTER TABLE variantes 
    ADD COLUMN IF NOT EXISTS grupo TEXT,
    ADD COLUMN IF NOT EXISTS seleccion_unica BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_variantes_articulo_grupo ON variantes(articulo_id, grupo, orden);
