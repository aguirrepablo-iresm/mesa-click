# Mesa CLICK — Menú Digital y Gestión de Pedidos

Mesa CLICK es una plataforma web PWA para el sector gastronómico que permite digitalizar menús y gestionar pedidos en tiempo real mediante códigos QR en las mesas.

## Estado del proyecto

| | |
|---|---|
| **Fase actual** | Fase 2 — Backend |
| **Sprint en curso** | Sprint 3 · 25/05 – 31/05/2025 |
| **Fin estimado** | 12/07/2025 |

Ver el roadmap completo con fechas y user stories en `docs/product/mesa-click-presentacion.html`.

## Estructura del monorepo

```
mesa-click/
├── docs/
│   ├── product/
│   │   ├── mesa-click-presentacion.html   ← roadmap, US y backlog por sprint
│   │   └── arquitectura-back.md           ← entidades, servicios y auth (Fase 2)
│   └── flows/
│       ├── happy-path-admin-negocio.md    ← flujo del admin de negocio
│       └── happy-path-cliente.md          ← flujo del cliente / comensal
├── repos/
│   └── web/                               ← frontend Next.js (activo en Fase 1)
├── AGENTS.md                              ← reglas para todos los agentes de IA
└── GEMINI.md                              ← contexto específico para Gemini
```

## Plan de desarrollo — 3 fases

| Fase | Sprints | Período | Objetivo |
|---|---|---|---|
| **1 — Frontend** | 0–2 | 04/05 → 24/05 | Happy paths navegables sin backend |
| **2 — Backend** | 3–6 | 25/05 → 21/06 | API, DB, servicios, auth, tests |
| **3 — Integración** | 7–9 | 22/06 → 12/07 | Conectar front con back, QA, deploy |

## Levantar el frontend localmente

Requisitos: Node.js 20+, Git.

```powershell
# 1. Clonar el repo
git clone <url-del-repo>
cd mesa-click

# 2. Instalar dependencias del frontend
cd repos/web
npm install

# 3. Levantar el servidor de desarrollo
npm run dev
```

Disponible en [http://localhost:3000](http://localhost:3000).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (v16+), React 19+, Tailwind CSS v4+, TypeScript |
| Backend (Fase 2) | Go, PostgreSQL, slog, Sentry |
| Auth (Fase 2) | Magic link por email |
| Tiempo real (Fase 2) | Server-Sent Events (SSE) |

## Equipo

| Alumno | Rol |
|---|---|
| Oviedo Martín | Desarrollo |
| Silvestrin Mateo | Desarrollo |
| Aguirre Pablo | Desarrollo |

Práctica Profesionalizante I — IRESM.

## Para agentes de IA

Antes de empezar cualquier tarea, leer:
1. `AGENTS.md` — reglas, fases, sprint en curso y convenciones
2. `docs/product/mesa-click-presentacion.html` → slide "Backlog" — US del sprint actual
3. `docs/flows/` — happy paths de los flujos a implementar
