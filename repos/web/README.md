# Mesa CLICK — Frontend (Next.js)

Frontend web de Mesa CLICK. Permite a los admins configurar su negocio y a los clientes hacer pedidos desde la mesa escaneando un QR.

Para el contexto completo del proyecto, ver el [README raíz](../../README.md) y [AGENTS.md](../../AGENTS.md).

## Estado actual

**Fase 1 — Frontend funcional sin backend.**
Toda la data es mockeada o estática. No hay llamadas a API reales.

**Sprint en curso: Sprint 1 (11/05 – 17/05/2025)**
- Happy path Admin de Negocio completo (QR UI, gestión de carta, usuarios internos)
- Dashboard del Recepcionista con datos mockeados

Ver las user stories del sprint en `../../docs/product/mesa-click-presentacion.html`.

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
