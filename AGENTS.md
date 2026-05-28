# Mesa CLICK — Agent Rules

Estas reglas aplican a cualquier agente de IA (Claude, Gemini, Copilot, etc.) que trabaje en este repositorio.

---

## ANTES DE ESCRIBIR CUALQUIER LÍNEA DE CÓDIGO

1. **Leer las User Stories del sprint actual** en:
   `docs/product/mesa-click-presentacion.html` → slide "Backlog"

2. **Leer el happy path correspondiente** a la tarea:
   - `docs/flows/happy-path-admin-negocio.md` — flujo del admin de negocio
   - `docs/flows/happy-path-cliente.md` — flujo del cliente / comensal

3. **Identificar en qué fase y sprint estamos** (ver sección "Estado del proyecto" más abajo) antes de decidir qué construir.

> No implementar nada que no esté cubierto por una US del sprint en curso. Si hay dudas, preguntar antes de avanzar.

---

## Estado del proyecto

| | |
|---|---|
| **Fase actual** | Fase 2 — Backend |
| **Sprint en curso** | Sprint 3 (25/05 – 31/05/2025) |
| **Próximo sprint** | Sprint 4 (01/06 – 07/06/2025) |

### Fases del proyecto
```
Fase 1 — Frontend sin back   (Sprints 0–2)   04/05 → 24/05/2025
Fase 2 — Backend             (Sprints 3–6)   25/05 → 21/06/2025
Fase 3 — Integración         (Sprints 7–9)   22/06 → 12/07/2025
```

### Sprints detallados
| Sprint | Semana | Objetivo |
|---|---|---|
| 0 ✓ | 04/05–10/05 | Maqueta base: landing, login, onboarding, dashboard |
| 1 ✓ | 11/05–17/05 | Happy path Admin completo + dashboard recepcionista (mock) |
| 2 ✓ | 18/05–24/05 | Happy path Cliente completo (carta, pedido, seguimiento, cuenta) |
| **3 ●** | **25/05–31/05** | **Stack + DB: entidades, relaciones, migraciones** |
| 4 | 01/06–07/06 | Servicios core + auth magic link |
| 5 | 08/06–14/06 | Servicio de pedidos + tiempo real (SSE) |
| 6 | 15/06–21/06 | Tests unitarios e integración |
| 7 | 22/06–28/06 | Integración: flujo admin + auth real |
| 8 | 29/06–05/07 | Integración: flujo cliente + recepcionista |
| 9 | 06/07–12/07 | QA end-to-end + polish + deploy |

---

## Estructura del monorepo

```
mesa-click/
├── repos/
│   └── web/          ← Next.js frontend (única repo activa en Fase 1)
├── docs/
│   ├── product/
│   │   ├── mesa-click-presentacion.html   ← US, roadmap y backlog
│   │   └── arquitectura-back.md           ← entidades, servicios, auth (referencia para Fase 2)
│   └── flows/
│       ├── happy-path-admin-negocio.md
│       └── happy-path-cliente.md
├── AGENTS.md    ← este archivo (fuente de verdad para todos los agentes)
└── GEMINI.md
```

---

## Roles del equipo

| Rol | Responsabilidad | Stack |
|---|---|---|
| **Front** | UI/UX, páginas, componentes, rutas | Next.js v16+, React 19+, Tailwind CSS v4+, TypeScript |
| **Back** | API, base de datos, servicios, auth | Go, PostgreSQL, slog, Sentry |
| **Int** | Contratos de API, flujo end-to-end, integración | Coordina Front ↔ Back |

---

## Reglas por fase

### Fase 1 — Frontend sin backend (ahora)
- Todo funciona con **datos mockeados** o estáticos. No hay llamadas a API reales.
- El objetivo es que los tres happy paths sean **navegables y aprobados por el docente**.
- No crear endpoints ni lógica de back en esta fase.
- Respetar la estructura de carpetas de `repos/web/`.

### Fase 2 — Backend (a partir del Sprint 3)
- Referirse a `docs/product/arquitectura-back.md` para entidades, relaciones y servicios.
- Usar `slog` para logging estructurado.
- Reportar errores inesperados (500) con `c.Error(err)` a Sentry via middleware.
- Cada servicio debe tener tests antes de darlo por terminado.

### Fase 3 — Integración
- Reemplazar mocks del front por llamadas reales a la API.
- Respetar los contratos de API definidos en la Fase 2.
- Validar cada flujo con los happy paths documentados.

---

## Convenciones generales
- **Commits**: explicar el "por qué" del cambio, no el "qué".
- **Branches**: una branch por US o tarea. Naming: `feat/US-XX-descripcion`, `fix/descripcion`.
- **PRs**: describir qué US cubre, cómo probarlo y si hay algo pendiente.
- **No implementar fuera de scope**: si una tarea no tiene US asociada en el sprint actual, consultarlo antes.
