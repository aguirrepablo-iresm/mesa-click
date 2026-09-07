# US-54: Estados Vacíos, Skeletons de Carga y Microinteracciones

> **Sprint**: Sprint 11 (07/09 – 13/09/2026)  
> **Épica**: Rediseño UI/UX Base & Onboarding Guiado  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-54-estados-vacio-carga-error`  

---

## 1. Descripción de la Historia

**Como** usuario, los estados vacíos, de carga y de error tienen tratamiento visual enriquecido y microinteracciones consistentes para entender el estado del sistema en todo momento.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Empty states ilustrados y con mensaje orientador + botón de acción directa en: Carta sin productos, Mesas vacías, Pedidos activos sin comandas, Equipo sin invitar.
- [ ] Skeletons de carga estilizados que evitan saltos de maquetación (layout shifts).
- [ ] Mensajes de error descriptivos con opción de reintentar la acción.
- [ ] Microinteracciones con animaciones sutiles al guardar, eliminar o cambiar estados.

---

## 3. Checklist de Tareas Técnicas

- [ ] Diseñar e implementar componente `EmptyState` reutilizable con ícono, texto y CTA.
- [ ] Crear componentes skeleton para tabla de pedidos, lista de carta y tarjetas de mesas.
- [ ] Estandarizar toasts o notificaciones flotantes de feedback.
- [ ] Validar transiciones suaves sin bloqueo de UI.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/RecepcionistaSection.tsx`
- `repos/web/components/dashboard/CartaSection.tsx`
- `repos/web/components/dashboard/MesasSection.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Relacionada con US-53.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-54-estados-vacio-carga-error
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
