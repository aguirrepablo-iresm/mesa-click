# Mesa CLICK — Frontend (Next.js)

Frontend web de Mesa CLICK. Permite a los admins configurar su negocio y a los clientes hacer pedidos desde la mesa escaneando un QR.

Para el contexto completo del proyecto, ver el [README raíz](../../README.md) y [AGENTS.md](../../AGENTS.md).

## Estado actual

**Fase 1 completada** — Frontend mockeado aprobado (US-01 a US-18).

**Fase 2 en curso — Sprint 4 (08/06 – 14/06/2025)**
El backend está levantado en `repos/api/` (Go + PostgreSQL). Este repo sigue con datos mockeados hasta la Fase 3 (integración).

Ver las user stories del sprint en `../../docs/presentations/mesa-click-presentacion.html`.

## Levantar localmente

Requisitos: Node.js 20+.

```powershell
npm install
npm run dev
```

Disponible en [http://localhost:3000](http://localhost:3000).

## Stack

- **Framework**: Next.js App Router (v16+)
- **UI**: React 19+, Tailwind CSS v4+
- **Lenguaje**: TypeScript estricto

## Estructura de carpetas

```
app/
├── page.tsx              ← landing
├── login/page.tsx        ← login / registro
├── onboarding/page.tsx   ← onboarding admin (4 pasos)
└── dashboard/page.tsx    ← panel de administración

components/
├── landing/
└── onboarding/
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run lint` | Verificar errores de ESLint |

## Convenciones

- No usar `any` en TypeScript
- No hacer llamadas a APIs externas en Fase 1 (todo es mock)
- Componentes funcionales con hooks — sin class components
- Estilos exclusivamente con Tailwind CSS
- La vista del cliente es **mobile-first** (el cliente usa el celular)
