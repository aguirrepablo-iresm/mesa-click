# US-54: Estados Vacíos, Skeletons de Carga y Microinteracciones

> **Sprint**: Sprint 11 (07/09 – 13/09/2026)  
> **Épica**: Rediseño UI/UX Base & Onboarding Guiado  
> **Tipo**: `Frontend`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Antigravity (AI Agent)  
> **Rama de trabajo**: `feat/US-54-estados-vacio-carga-error`  

---

## 1. Descripción de la Historia

**Como** usuario, los estados vacíos, de carga y de error tienen tratamiento visual enriquecido y microinteracciones consistentes para entender el estado del sistema en todo momento.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Empty states ilustrados y con mensaje orientador + botón de acción directa en: Carta sin productos, Mesas vacías, Pedidos activos sin comandas, Equipo sin invitar.
- [x] Skeletons de carga estilizados que evitan saltos de maquetación (layout shifts).
- [x] Mensajes de error descriptivos con opción de reintentar la acción.
- [x] Microinteracciones con animaciones sutiles al guardar, eliminar o cambiar estados.

---

## 3. Checklist de Tareas Técnicas

- [x] Diseñar e implementar componente `EmptyState` reutilizable con ícono, texto y CTA.
- [x] Crear componentes skeleton para tabla de pedidos, lista de carta y tarjetas de mesas.
- [x] Estandarizar toasts o notificaciones flotantes de feedback.
- [x] Validar transiciones suaves sin bloqueo de UI.

---

## 4. Archivos Clave Involucrados

### Nuevos
- `repos/web/components/ui/EmptyState.tsx` — Componente reutilizable con ícono (Material Symbols), título, descripción y CTA opcional. Soporta modo `compact`.
- `repos/web/components/ui/Skeleton.tsx` — Bloque shimmer `animate-pulse` para evitar layout shifts.
- `repos/web/components/ui/Toast.tsx` — Sistema de toasts con React Context. `ToastProvider` + `useToast()` con variantes success/error/info, auto-dismiss 3s, max 3 toasts, animaciones keyframe.
- `repos/web/components/ui/index.ts` — Barrel export de los 3 componentes.

### Modificados
- `repos/web/app/dashboard/page.tsx` — Envuelto con `<ToastProvider>`.
- `repos/web/components/dashboard/CartaSection.tsx` — Skeletons de carga, empty state global + por categoría con CTA, toasts en todas las acciones, botón "Reintentar" en errores.
- `repos/web/components/dashboard/MesasSection.tsx` — Skeleton de 4 tarjetas, empty state con CTA, toasts al crear/eliminar.
- `repos/web/components/dashboard/RecepcionistaSection.tsx` — Skeleton de 3 tarjetas de pedido, empty state dinámico (SSE conectado/desconectado), toasts al avanzar estado y cerrar pedido.
- `repos/web/components/dashboard/EquipoSection.tsx` — Skeleton de 3 filas, empty state con scroll al formulario, toasts en todas las acciones, eliminación de todos los `alert()` nativos.

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Relacionada con US-53.
- **Estrategia Git**:
  1. Rama creada a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-54-estados-vacio-carga-error
     ```
  2. Cambios implementados siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Build validado: `cd repos/web && npm run build`.
  4. PR abierto hacia `qa`.
