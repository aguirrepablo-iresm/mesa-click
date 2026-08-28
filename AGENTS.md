# Mesa CLICK — Agent Rules

Estas reglas aplican a cualquier agente de IA (Claude, Gemini, CLI, etc.) que trabaje en este repositorio. **Este es el documento principal de referencia para el contexto del proyecto.**

---

## ANTES DE EMPEZAR

1. **Leer las User Stories del sprint actual** en:
   `docs/presentations/parte-2/index.html` → slide "Backlog" (o `docs/presentations/mesa-click-presentacion.html` para el histórico del MVP)

2. **Leer el happy path correspondiente** a la tarea:
   - `docs/flows/happy-path-admin-negocio.md` — flujo del admin de negocio
   - `docs/flows/happy-path-cliente.md` — flujo del cliente / comensal

3. **Consultar el Status Report más reciente** para ver bloqueantes o decisiones pendientes:
   - `docs/presentations/status-report-03.html`

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
| **Fase actual** | Fase 4 — Evolución, Monetización & Analítica (2do Cuatrimestre) |
| **Sprint en curso** | **Sprint 10 (Configuración Avanzada de Cuenta & Rediseño UI/UX Base)** |
| **Objetivo Fase 4** | Llevar Mesa CLICK a nivel comercial: SaaS Freemium (Free vs Pro), Mobile-First comensal, carga masiva CSV/Excel, métricas y analítica de negocio |

### Sprints detallados
| Sprint | Objetivo | Estado |
|---|---|---|
| 0 | Maqueta base: landing, login, onboarding, dashboard | ✓ Completado |
| 1 | Happy path Admin completo + dashboard recepcionista (mock) | ✓ Completado |
| 2 | Happy path Cliente completo (carta, pedido, seguimiento, cuenta) | ✓ Completado |
| 3 | Stack + DB: entidades, relaciones, migraciones | ✓ Completado |
| 4 | Servicios core (tenant, sucursal, mesa, carta) + auth magic link | ✓ Completado |
| 5 | Servicio de pedidos + tiempo real (SSE) | ✓ Completado |
| 6 | Tests unitarios e integración | ✓ Completado |
| 7 | Integración flujo admin y autenticación real | ✓ Completado |
| 8 | Integración flujo cliente y recepcionista en tiempo real | ✓ Completado |
| 9 | QA end-to-end, polish responsive y deploy a producción | ✓ Completado |
| 10 | Configuración avanzada de cuenta & Rediseño UI/UX Base | ⚡ En Curso |
| 11 | Mobile-First Comensal + Carga masiva y ajuste de precios | 📋 Planificado |
| 12 | Modelo Freemium (Free vs Pro) & Control de suscripciones | 📋 Planificado |
| 13 | Dashboard con métricas & Business Analytics | 📋 Planificado |
| 14 | QA E2E, Load Testing, Polish final & Cierre | 📋 Planificado |

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
└── AGENTS.md    ← este archivo (fuente de verdad principal)
```

---

## Reglas por fase
 
### Fase 4 — Evolución, Monetización & Analítica (Actual - 2do Cuatrimestre)
- **UI/UX & Mobile-First**: Todo componente del flujo de mesa debe priorizar la interacción táctil en dispositivos móviles (tap targets de al menos 44px, gestos bottom-sheet, tabs sticky).
- **Control de Suscripciones**: El backend debe validar las cuotas del plan (Free vs Pro) en middleware antes de permitir la creación de mesas, ítems o sucursales adicionales.
- **Carga Masiva**: Las operaciones de importación de menús por CSV/Excel deben ser atómicas y devolver reportes claros de filas procesadas con error.
- **Métricas**: Consultas de agregación SQL optimizadas con índices adecuados para no penalizar la performance del servidor.
- Mantener cobertura de tests en Go y validar compilación con `go test ./...` y `npm run build` en web antes de cada merge.

---

## Estrategia de Ramas y Despliegue (Git Workflow)

### Ramas Principales y Entornos
- **`main` (Producción)**: Código productivo y estable.
  - **Backend (`repos/api`)**: Desplegado y corriendo en **Render** (Servicio Free, Docker, Región: Ohio, Servicio: `mesa-click-api`).
  - **Frontend (`repos/web`)**: Desplegado y corriendo en **Render** (Servicio Free, Docker, Región: Ohio, Servicio: `mesa-click-web`).
- **`qa` (QA / Staging)**: Rama base para integración continua y pruebas de calidad.

### Flujo de Desarrollo
1. **Creación de ramas**: Todo nuevo desarrollo (feature o corrección de bug) **debe crearse a partir de `qa`**:
   - `git checkout qa && git pull`
   - `git checkout -b feat/US-XX-descripcion` (features)
   - `git checkout -b fix/descripcion` (correcciones de bugs)
2. **Integración en QA**: Al finalizar, abrir PR / merge hacia **`qa`** para validación y testing.
3. **Pase a Producción**: Una vez testeado y validado en `qa`, se mergea hacia **`main`**, actualizando automáticamente ambos servicios (`mesa-click-api` y `mesa-click-web`) en Render mediante Docker.

---

## Convenciones generales
- **Branches**: `feat/US-XX-descripcion` o `fix/descripcion` (creadas **siempre y sin excepción** a partir de `qa`). **Nunca commitear directo en `main`**.
- **Commits**: Explicar el "por qué" en lugar del "qué".
- **Variables de entorno (`.env`)**: Solicitar credenciales y `.env` para la API directamente a **Pablo Aguirre**.
- **No duplicar lógica**: Si algo ya está en el backend, el frontend solo lo consume.
