<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Contexto del proyecto — Mesa CLICK (Frontend)

> **Leer antes de empezar**: Las User Stories del sprint actual están en
> `../../docs/presentations/mesa-click-presentacion.html` → slide "Backlog".
> Los happy paths están en `../../docs/flows/`.
> Las reglas generales del proyecto están en `../../AGENTS.md`.

---

## Fase actual: Fase 3 — Integración

**Fase 2 completada** — US-19 a US-37 implementadas. Backend Go + PostgreSQL + SSE + Tests completo y aprobado.

**Sprint en curso: Sprint 7 (10/07 – 16/07/2026)**
- Conectar front admin + auth con la API real
- Reemplazar login y onboarding mockeados con llamadas reales a la API
- Conectar la gestión de carta y distribución de mesas con la base de datos real (US-38 a US-41)

---

## Estructura del proyecto (`repos/web/`)

```
repos/web/
├── app/                        ← rutas y páginas (Next.js App Router)
│   ├── page.tsx                (landing)
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/page.tsx      (admin: sidebar con Carta, Mesas, Equipo, Recepcionista)
│   └── mesa/[token]/page.tsx   (cliente: carta → carrito → seguimiento)
├── components/
│   ├── landing/
│   ├── onboarding/
│   ├── dashboard/              (CartaSection, MesasSection, EquipoSection, RecepcionistaSection)
│   └── menu/                   (CategoriaNav, ItemCard, CartDrawer, SeguimientoView)
├── lib/
│   └── mock/                   (menu.ts, mesas.ts, pedidos.ts, equipo.ts)
└── public/
```

---

## Stack y convenciones

- **Framework**: Next.js App Router (no Pages Router)
- **Estilos**: Tailwind CSS v4+ — no usar CSS modules ni styled-components
- **Lenguaje**: TypeScript estricto — no usar `any`
- **Componentes**: funcionales con hooks, sin class components
- **Estado global**: ninguno por ahora (todo local o props)
- **Datos mock**: definir los datos estáticos cerca del componente que los usa (no en stores globales)

## Reglas de código

- **Git workflow**: Crear ramas (`feat/*`, `fix/*`) siempre a partir de `qa`. Al validar en QA, mergear a `main` (desplegado en **Render** como `mesa-click-web` con Docker en región Ohio, servicio Free Web Service).
- No crear llamadas a `fetch` ni a APIs externas en Fase 1
- No instalar librerías sin justificación explícita en la US
- Mantener diseño responsive — la vista del cliente es mobile-first (el cliente usa su celular)
- Antes de agregar una pantalla nueva, verificar que existe la US correspondiente en el sprint actual
