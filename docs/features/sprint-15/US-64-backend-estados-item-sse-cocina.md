# US-64: Modelo de Estados por Ítem y Canal SSE de Cocina

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Kitchen Display System (KDS) & Impresión de Comandas  
> **Tipo**: `Backend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-64-backend-kds-sse`  

---

## 1. Descripción de la Historia

**Como** sistema, modelo estados por ítem de pedido (pendiente, en preparación, listo) además del estado global y los emito por SSE en un canal exclusivo de cocina.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Columna `estado` en tabla `pedido_items` con valores (`pendiente`, `preparando`, `listo`).
- [ ] Endpoint SSE `/kds/eventos?sucursal_id=...` para actualizaciones en tiempo real de cocina.
- [ ] Endpoint `PATCH /pedidos/items/{id}/estado` para actualizar ítems individuales.
- [ ] Transición automática: si todos los ítems pasan a 'listo', el estado global del pedido avanza automáticamente a 'listo'.

---

## 3. Checklist de Tareas Técnicas

- [ ] Migración SQL para estado individual en ítems de pedido.
- [ ] Hub de eventos SSE segmentado para personal de cocina.
- [ ] Endpoint de actualización de ítem individual.
- [ ] Pruebas unitarias de avance de estado y cálculo agregado.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/016_alter_pedido_items_estado.sql`
- `repos/api/internal/pedido/store.go`
- `repos/api/internal/pedido/service.go`
- `repos/api/internal/pedido/handler.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Habilita US-65 y US-66.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-64-backend-kds-sse
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
