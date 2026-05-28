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
│   │   ├── mesa-click-presentacion.html   ← roadmap, US, backlog y línea de tiempo
│   │   └── arquitectura-back.md           ← entidades, servicios y auth (Fase 2)
│   └── flows/
│       ├── happy-path-admin-negocio.md    ← flujo del admin de negocio
│       └── happy-path-cliente.md          ← flujo del cliente / comensal
├── repos/
│   └── web/                               ← frontend Next.js
│       ├── app/
│       │   ├── page.tsx                   ← landing
│       │   ├── login/page.tsx
│       │   ├── onboarding/page.tsx
│       │   ├── dashboard/page.tsx         ← panel admin (Carta, Mesas, Equipo, Recepcionista)
│       │   └── mesa/[token]/page.tsx      ← carta del cliente (escaneo de QR)
│       ├── components/
│       │   ├── dashboard/                 ← CartaSection, MesasSection, EquipoSection, RecepcionistaSection
│       │   └── menu/                      ← CategoriaNav, ItemCard, CartDrawer, SeguimientoView
│       └── lib/mock/                      ← datos mockeados (menu, mesas, pedidos, equipo)
├── AGENTS.md                              ← reglas para todos los agentes de IA
└── GEMINI.md                              ← contexto específico para Gemini
```

## Plan de desarrollo — 3 fases

| Fase | Sprints | Período | Objetivo | Estado |
|---|---|---|---|---|
| **1 — Frontend** | 0–2 | 04/05 → 24/05 | Happy paths navegables sin backend | ✅ Completa |
| **2 — Backend** | 3–6 | 25/05 → 21/06 | API, DB, servicios, auth, tests | 🔄 En curso |
| **3 — Integración** | 7–9 | 22/06 → 12/07 | Conectar front con back, QA, deploy | ⏳ Pendiente |

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

## Cómo probar el frontend (Fase 1 completa)

Todo funciona con datos mockeados — sin backend, sin base de datos. Solo necesitás tener el servidor levantado (`npm run dev`).

---

### Panel de administración — `http://localhost:3000/dashboard`

Navegá con la barra lateral izquierda. Hacé clic en el ícono de hamburguesa (☰) para expandir las etiquetas.

#### 📋 Carta
Gestión del menú del restaurante.

| Acción | Cómo probarlo |
|---|---|
| Ver categorías e ítems | Al entrar ya se ven las 3 categorías mock (Hamburguesas, Entradas, Bebidas) |
| Agregar categoría | Botón **"+ Nueva categoría"** → escribí el nombre → Enter o "Agregar" |
| Agregar ítem | Dentro de una categoría, botón **"+ Ítem"** → completar nombre y precio (obligatorios) |
| Ocultar/mostrar ítem | Link **"Ocultar"** o **"Mostrar"** al lado de cada ítem |
| Eliminar ítem | Botón **✕** — pide confirmación antes de borrar |
| Eliminar categoría | Botón **"Eliminar cat."** — pide confirmación |

#### 🪑 Mesas & QR
Vista de las 8 mesas con sus códigos QR.

| Acción | Cómo probarlo |
|---|---|
| Ver QR de cada mesa | El QR se genera automáticamente al cargar la sección |
| Descargar QR | Botón **"↓ Descargar QR"** debajo de cada QR — descarga un PNG |
| Ver URL del QR | El QR apunta a `http://localhost:3000/mesa/mesa-token-N` |
| Probar el QR | Escanearlo con el celular (si estás en la misma red) o abrir la URL directamente |

#### 👥 Equipo
Lista de usuarios del negocio e invitación.

| Acción | Cómo probarlo |
|---|---|
| Ver equipo actual | Lista los 3 usuarios mock (Pablo, Martín, Mateo) |
| Invitar usuario | Completar nombre + email + rol (Encargado/Mozo) → "Enviar invitación" |
| Ver validación | Intentar enviar con campos vacíos o email sin @ → aparece mensaje de error |
| Confirmar éxito | Al invitar correctamente aparece "✓ Invitación enviada" por 3 segundos |

#### 🧾 Recepcionista
Dashboard de pedidos activos con cambio de estado.

| Acción | Cómo probarlo |
|---|---|
| Ver pedidos activos | Se muestran 3 pedidos mock de las mesas 2, 4 y 7 |
| Ver alerta de cuenta | Mesa 7 aparece destacada en rojo con **⚠️ Pide la cuenta** |
| Avanzar estado | Botón **"→ Preparando"** o **"→ Listo"** — avanza el estado del pedido |
| Cerrar pedido | Cuando un pedido llega a "Listo", aparece **"Cerrar pedido"** que lo elimina de la lista |
| Estado vacío | Cerrá todos los pedidos → aparece "No hay pedidos activos en este momento" |

---

### Vista del cliente (comensal) — `http://localhost:3000/mesa/[token]`

Simulá la experiencia del cliente que escaneó el QR de su mesa. Las URLs disponibles son:

```
http://localhost:3000/mesa/mesa-token-1   ← Mesa 1 (libre)
http://localhost:3000/mesa/mesa-token-2   ← Mesa 2 (ocupada)
http://localhost:3000/mesa/mesa-token-3   ← Mesa 3 (libre)
...hasta mesa-token-8
```

**Flujo completo a probar:**

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir cualquier URL de mesa | Se ve la carta con chips de categorías arriba |
| 2 | Tocar **"+"** en varios ítems | Aparece barra azul en el fondo con el total |
| 3 | Tocar la barra azul | Se abre la vista del carrito |
| 4 | Ajustar cantidades con **−** y **+** | La cantidad baja a 0 → el ítem desaparece del carrito |
| 5 | Escribir una nota en un ítem | Campo de texto "Nota para la cocina" debajo de cada ítem |
| 6 | Tocar **"Enviar pedido"** | Cambia a la vista de seguimiento |
| 7 | Esperar 4 segundos | El estado avanza automáticamente de "Recibido" a "Preparando" |
| 8 | Esperar 8 segundos más | El estado avanza a "¡Listo para retirar!" |
| 9 | Tocar **"+ Agregar más ítems"** | Vuelve a la carta sin borrar el pedido anterior |
| 10 | Tocar **"Pedir la cuenta"** | Aparece "✓ El mozo fue notificado" y el botón se deshabilita |

> **Nota:** Los ítems marcados como "No disponible" en la sección Carta del admin no aparecen en la carta del cliente.

**URL inválida:** `http://localhost:3000/mesa/token-inexistente` → muestra "Mesa no encontrada".

---

### Presentación del proyecto

Para ver el roadmap, backlog, línea de tiempo y estado del proyecto, abrí directamente en el browser:

```
docs/product/mesa-click-presentacion.html
```

Navegá con las flechas del teclado (← →) o con los botones de la barra superior. La última slide **"Línea de tiempo"** muestra el progreso cronológico de todos los sprints.

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
