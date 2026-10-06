-- 028_add_password_hash_usuarios.sql
-- Credencial local opcional para el acceso administrativo con email y contraseña.
-- Permanece nullable para usuarios existentes y miembros invitados, que pueden
-- continuar ingresando con Google o mediante su enlace de invitación.

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN usuarios.password_hash IS
    'Hash bcrypt de la contraseña de Mesa CLICK; nunca contiene la contraseña en texto plano.';
