-- Identidad estable de Google para inicio de sesión federado.
-- La columna es opcional hasta que el usuario accede por Google por primera vez.

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS google_sub TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_sub
    ON usuarios (google_sub)
    WHERE google_sub IS NOT NULL;

