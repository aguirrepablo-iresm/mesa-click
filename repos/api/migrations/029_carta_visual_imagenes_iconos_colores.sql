-- US-86 / US-87: identidad visual enriquecida para la carta publica.
ALTER TABLE categorias
    ADD COLUMN IF NOT EXISTS icono TEXT;

ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS color_categoria TEXT,
    ADD COLUMN IF NOT EXISTS color_accion TEXT;

