# US-66: Interacción Táctil en KDS y Notificación al Salón

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Kitchen Display System (KDS) & Impresión de Comandas  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-66-interaccion-kds`  

---

## 1. Descripción de la Historia

**Como** cocinero, marco ítems individuales como 'en preparación' o 'listo' con un tap táctil y el pedido se notifica al mozo cuando está listo para retirar.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Tap sobre un ítem individual tacha el producto y lo marca 'listo'.
- [ ] Botón 'Comanda Completa Lista' para despachar todos los ítems de una sola vez.
- [ ] Al completarse el pedido, suena una señal auditiva opcional y se notifica al dashboard de salón/mozos.
- [ ] Historial de comandas despachadas recientemente con posibilidad de deshacer (reabrir).

---

## 3. Checklist de Tareas Técnicas

- [ ] Vincular clicks táctiles con `api.actualizarEstadoItem`.
- [ ] Sonido de campana o beep configurable al recibir nueva comanda.
- [ ] Modal o panel de pedidos recientemente despachados.
- [ ] Validación de sincronización sin parpadeos.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/kds/ComandaCard.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-64 y US-65.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-66-interaccion-kds
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
