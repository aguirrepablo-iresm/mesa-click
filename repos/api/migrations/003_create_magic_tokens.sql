-- 003_create_magic_tokens.sql
-- Tokens para login sin contraseña (magic link por email).
-- Cada token es válido 15 minutos y se usa una sola vez.

CREATE TABLE magic_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token       TEXT        UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ
);

CREATE INDEX idx_magic_tokens_token ON magic_tokens(token);
