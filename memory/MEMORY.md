# Memory Index — Mesa CLICK

- [Mantener docs actualizados](feedback_mantener-docs-actualizados.md) — Soy el encargado de actualizar AGENTS.md, GEMINI.md, CLAUDE.md y READMEs ante cualquier cambio de fase, sprint o arquitectura
- **EmailSender Abstraction:** Se implementó `auth.EmailSender` para usar `LogEmailSender` localmente y `ResendEmailSender` en producción, destrabando la configuración de magic link.
- **Sprint 4 Backend Completado:** Creados los paquetes y handlers para `internal/sucursal` (CRUD sucursales y sectores) e `internal/usuario` (CRUD equipo e invitaciones).
- **Sprint 5 & 6 Backend Completados (25/06/2026):**
  * Implementado el almacenamiento y flujo del servicio de pedidos en `internal/pedido`.
  * Diseñado un broker de Server-Sent Events (SSE) concurrente seguro en `internal/notificacion` y expuestos endpoints SSE (con y sin autenticación) en `rutas.go`.
  * Desarrollada una suite robusta de tests unitarios e integración en `internal/notificacion/broker_test.go` para validar suscripción, publicación, desuscripción y stream de red, asegurando la compilación exitosa (`go test ./...` pasa al 100%).
- **Estrategia Git y Ambientes de Despliegue:**
  * Ramas principales: `main` (Producción) y `qa` (Testing).
  * Todo desarrollo de nueva feature o corrección de bug inicia a partir de `qa` (`feat/*`, `fix/*`).
  * Al validar en `qa`, se mergea hacia `main`.
  * `main` corre en **Render** (servicio Free, Docker, región Ohio) tanto para la API backend (`repos/api` → `mesa-click-api`) como para el frontend (`repos/web` → `mesa-click-web`).
