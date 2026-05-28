<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Contexto del proyecto — Mesa CLICK (Frontend)

> **Leer antes de empezar**: Las User Stories del sprint actual están en
> `../../docs/product/mesa-click-presentacion.html` → slide "Backlog".
> Los happy paths están en `../../docs/flows/`.
> Las reglas generales del proyecto están en `../../AGENTS.md`.

---

## Fase actual: Fase 2 — Backend (arranque)

**Fase 1 completada** — US-01 a US-18 implementadas. Frontend mockeado navegable y aprobado.

**Sprint en curso: Sprint 3 (25/05 – 31/05/2025)**
- Stack backend Go + PostgreSQL + slog + Sentry
- Esquema de BD con entidades del MVP y migraciones versionadas
- Entorno Docker local configurado (US-19 a US-22)

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

- No crear llamadas a `fetch` ni a APIs externas en Fase 1
- No instalar librerías sin justificación explícita en la US
- Mantener diseño responsive — la vista del cliente es mobile-first (el cliente usa su celular)
- Antes de agregar una pantalla nueva, verificar que existe la US correspondiente en el sprint actual
