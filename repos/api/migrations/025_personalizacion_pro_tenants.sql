-- 025_personalizacion_pro_tenants.sql
-- Personalización exclusiva Pro y retiro de marca de agua en carta digital.

ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS mostrar_marca_agua BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS color_secundario TEXT,
    ADD COLUMN IF NOT EXISTS tipo_fuente TEXT;

