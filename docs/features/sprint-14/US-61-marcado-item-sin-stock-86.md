# US-61: Marcado de Ítem Sin Stock (86) con Actualización en Tiempo Real

> **Sprint**: Sprint 14 (28/09 – 04/10/2026)  
> **Épica**: Disponibilidad de Ítems (86) & Menús por Franja Horaria  
> **Tipo**: `Integración`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Antigravity (AI Agent)  
> **Rama de trabajo**: `feat/US-62-backend-disponibilidad`  

---

## 1. Descripción de la Historia

**Como** personal, puedo marcar un ítem como 'sin stock' (86) con un tap desde la carta o el dashboard y el comensal lo ve agotado en tiempo real sin recargar.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Botón/switch rápido en la lista de platos del dashboard para alternar estado 'En stock' / 'Agotado (86)'.
- [x] Propagación inmediata por SSE al canal público del comensal.
- [x] En la vista del cliente, el plato se atenúa visualmente, se marca con badge 'Agotado' y el botón de agregar queda deshabilitado.
- [x] Si un cliente ya tenía el producto en el carrito, se le advierte al intentar confirmar el pedido.

---

## 3. Checklist de Tareas Técnicas

- [x] Conectar evento de stock en el SSE de la carta.
- [x] Agregar toggle visual en `CartaSection.tsx` y en dashboard de recepción.
- [x] Adaptar renderizado de ítems agotados en la vista móvil comensal.
- [x] Validar en backend que no se puedan crear pedidos con ítems agotados.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/CartaSection.tsx`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/api/internal/pedido/service.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Complementada por US-62.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-61-marcado-sin-stock
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
