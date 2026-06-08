# Mesa CLICK — Agent Rules

Estas reglas aplican a cualquier agente de IA (Claude, Gemini, CLI, etc.) que trabaje en este repositorio. **Este es el documento principal de referencia para el contexto del proyecto.**

---

## ANTES DE EMPEZAR

1. **Leer las User Stories del sprint actual** en:
   `docs/presentations/mesa-click-presentacion.html` → slide "Backlog"

2. **Leer el happy path correspondiente** a la tarea:
   - `docs/flows/happy-path-admin-negocio.md` — flujo del admin de negocio
   - `docs/flows/happy-path-cliente.md` — flujo del cliente / comensal

3. **Consultar el Status Report más reciente** para ver bloqueantes o decisiones pendientes:
   - `docs/presentations/status-report-01.html`

> No implementar nada que no esté cubierto por una US del sprint en curso. Si hay dudas, preguntar antes de avanzar.

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

## Estado del proyecto

| | |
|---|---|
| **Fase actual** | Fase 2 — Backend |
| **Sprint en curso** | **Sprint 4 ● (08/06 – 14/06/2026)** |
| **Objetivo Sprint 4** | Servicios core (CRUDs) + auth magic link |

### Sprints detallados
| Sprint | Objetivo | Estado |
|---|---|---|
| 0 | Maqueta base: landing, login, onboarding, dashboard | ✓ Completado |
| 1 | Happy path Admin completo + dashboard recepcionista (mock) | ✓ Completado |
| 2 | Happy path Cliente completo (carta, pedido, seguimiento, cuenta) | ✓ Completado |
| 3 | Stack + DB: entidades, relaciones, migraciones | ✓ Completado |
| **4** | **Servicios core (tenant, sucursal, mesa, carta) + auth magic link** | **● EN CURSO** |
| 5 | Servicio de pedidos + tiempo real (SSE) | Pendiente |
| 6 | Tests unitarios e integración | Pendiente |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (v16+), React 19+, Tailwind CSS v4+, TypeScript |
| Backend | Go (Golang), PostgreSQL, net/http estándar |
| Logging | `slog` (estructurado) |
| Auth | Magic link por email (JWT) |
| Tiempo real | Server-Sent Events (SSE) |

---

## Estructura del monorepo

```
mesa-click/
├── repos/
│   ├── api/          ← Backend Go
│   └── web/          ← Frontend Next.js
├── docs/
│   ├── presentations/
│   │   ├── mesa-click-presentacion.html   ← US, roadmap y backlog
│   │   └── status-report-01.html          ← último reporte de estado
│   ├── product/
│   │   └── arquitectura-back.md           ← diseño técnico del backend
│   └── flows/
│       ├── happy-path-admin-negocio.md
│       └── happy-path-cliente.md
├── AGENTS.md    ← este archivo (fuente de verdad principal)
└── GEMINI.md    ← instrucciones específicas para Gemini CLI
```

---

## Reglas por fase

### Fase 2 — Backend (Actual)
- Consultar `docs/product/arquitectura-back.md` para el modelo de datos.
- Usar `slog` para logs.
- Reportar errores 500 con `c.Error(err)` a Sentry (si el middleware está presente).
- Antes de cada commit, verificar que el código compila y pasa tests básicos.

### Fase 3 — Integración (Próxima)
- Conectar los componentes del frontend en `repos/web/` con los endpoints reales de `repos/api/`.
- Reemplazar los archivos en `lib/mock/` por llamadas a la API.

---

## Convenciones generales
- **Branches**: `feat/US-XX-descripcion` o `fix/descripcion`.
- **Commits**: Explicar el "por qué" en lugar del "qué".
- **No duplicar lógica**: Si algo ya está en el backend, el frontend solo lo consume.
