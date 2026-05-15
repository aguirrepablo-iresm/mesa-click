# Mesa CLICK — Contexto para Gemini

> **Leer `AGENTS.md` primero.** Este archivo contiene las reglas completas del proyecto, el estado del sprint actual y los mandatos de documentación. `GEMINI.md` sólo agrega contexto específico para el modelo Gemini.

---

## Mandato principal (no negociable)

Antes de cualquier tarea — incluso antes de hacer preguntas de aclaración — leer:

1. `docs/product/mesa-click-presentacion.html` → slide "Backlog" para identificar las US del sprint actual.
2. `docs/flows/happy-path-admin-negocio.md` y `docs/flows/happy-path-cliente.md` para entender el flujo esperado.
3. `AGENTS.md` para conocer en qué fase y sprint estamos.

---

## Resumen del proyecto

**Mesa CLICK** es una plataforma web PWA para digitalizar pedidos en locales gastronómicos (bares, cafeterías, restaurantes). Los clientes escanean un QR por mesa, ven la carta digital y hacen el pedido desde el celular. El negocio gestiona todo desde un dashboard en tiempo real.

### Actores principales
| Actor | Acceso | Descripción |
|---|---|---|
| Admin de negocio | Login (magic link) | Configura sucursales, mesas, carta y usuarios |
| Encargado | Login (magic link) | Gestiona su sucursal |
| Recepcionista / Mozo | Login (magic link) | Dashboard de pedidos en vivo |
| Cliente / Comensal | Sin login (QR) | Carta, pedido, seguimiento, cuenta |

---

## Estado actual

- **Fase**: 1 — Frontend funcional sin backend
- **Sprint en curso**: Sprint 1 (11/05 – 17/05/2025)
- **Completado** (Sprint 0): Landing, Login, Onboarding admin, Dashboard (estructura base)
- **En curso** (Sprint 1): Happy path Admin completo + dashboard recepcionista con datos mockeados
- **Próximo** (Sprint 2): Happy path Cliente (carta pública, pedido, seguimiento, cuenta)

Ver el roadmap completo con fechas en `docs/product/mesa-click-presentacion.html`.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (v16+), React 19+, Tailwind CSS v4+, TypeScript |
| Backend (Fase 2) | Go, PostgreSQL, slog, Sentry |
| Auth (Fase 2) | Magic link por email |
| Tiempo real (Fase 2) | Server-Sent Events (SSE) |

---

## Reglas de trabajo en Fase 1

- Toda la data es **mockeada o estática**. No hay API real todavía.
- El objetivo de Fase 1 es tener los dos happy paths completos y navegables para aprobación del docente.
- El código del frontend vive en `repos/web/`. Respetar su estructura de carpetas.
- No construir lógica de backend ni endpoints en esta fase.

---

## Referencia de documentación clave

| Archivo | Contenido |
|---|---|
| `AGENTS.md` | Reglas completas, fases, sprints, convenciones |
| `docs/product/mesa-click-presentacion.html` | Presentación con US, roadmap y backlog por sprint |
| `docs/product/arquitectura-back.md` | Entidades, relaciones, servicios y auth (para Fase 2) |
| `docs/flows/happy-path-admin-negocio.md` | Flujo del admin: registro → onboarding → carta → QR |
| `docs/flows/happy-path-cliente.md` | Flujo del cliente: QR → carta → pedido → cuenta |
| `repos/web/AGENTS.md` | Reglas específicas del frontend Next.js |
