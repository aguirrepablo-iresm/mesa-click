-- 014_alter_tenants_settings.sql
-- Configuración avanzada de cuenta (US-51): metadatos de contacto, branding, fiscal y reputación

ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS email_contacto   TEXT,
    ADD COLUMN IF NOT EXISTS whatsapp         TEXT,
    ADD COLUMN IF NOT EXISTS logo_url         TEXT,
    ADD COLUMN IF NOT EXISTS color_primario   TEXT,
    ADD COLUMN IF NOT EXISTS estilo_visual    TEXT DEFAULT 'oscuro',
    ADD COLUMN IF NOT EXISTS datos_fiscales   JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS google_review_url TEXT;

-- Permitir rubros adicionales frecuentes en gastronomía
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_rubro_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_rubro_check
    CHECK (rubro IN ('restaurante', 'cafeteria', 'comida_rapida', 'bar', 'cerveceria', 'pizzeria', 'otro'));

-- Ampliar roles de usuario para permitir rol cocina (Sprint 15 KDS)
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('admin', 'encargado', 'mozo', 'cocina'));
