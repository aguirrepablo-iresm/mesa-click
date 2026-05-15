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

## Fase actual: Fase 1 — Frontend sin backend

Toda la lógica es estática o mockeada. No hay API real. El objetivo es tener los dos happy paths navegables y aprobados.

**Sprint en curso: Sprint 1 (11/05 – 17/05/2025)**
- Happy path Admin de Negocio completo (QR UI, gestión de carta, invitación de usuarios)
- Dashboard del Recepcionista con datos mockeados (pedidos activos, cambio de estado)

**Sprint siguiente: Sprint 2 (18/05 – 24/05/2025)**
- Happy path Cliente (carta pública desde QR, carrito, pedido, seguimiento, cuenta)

---

## Estructura del proyecto (`repos/web/`)

```
repos/web/
├── app/                  ← rutas y páginas (Next.js App Router)
│   ├── page.tsx          (landing)
│   ├── login/page.tsx
│   ├── onboarding/page.tsx
│   └── dashboard/page.tsx
├── components/           ← componentes reutilizables
│   ├── landing/
│   └── onboarding/
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
