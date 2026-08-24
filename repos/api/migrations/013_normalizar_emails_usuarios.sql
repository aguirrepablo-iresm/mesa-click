-- 013_normalizar_emails_usuarios.sql
-- El login por magic link busca al usuario por email. Como la columna es
-- case-sensitive, una cuenta cargada como "Admin@Bar.com" quedaba inaccesible
-- si la persona escribía "admin@bar.com" al iniciar sesión.
-- Normalizamos lo existente y bloqueamos duplicados que solo difieran en mayúsculas.

UPDATE usuarios SET email = lower(trim(email)) WHERE email <> lower(trim(email));

DROP INDEX IF EXISTS idx_usuarios_email_lower;
CREATE UNIQUE INDEX idx_usuarios_email_lower ON usuarios (lower(email));
