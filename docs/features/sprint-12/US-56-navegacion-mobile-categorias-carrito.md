# US-56: Navegación Mobile Táctil con Categorías Sticky y Carrito Bottom-Sheet

> **Sprint**: Sprint 12 (14/09 – 20/09/2026)  
> **Épica**: Mobile-First Comensal  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-56-navegacion-mobile`  

---

## 1. Descripción de la Historia

**Como** cliente, tengo una navegación mobile táctil optimizada con selector de categorías sticky y carrito flotante bottom-sheet para hacer pedidos con una sola mano desde mi smartphone.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Barra de categorías pegajosa (sticky top) con scroll horizontal que detecta la categoría visible según el scroll.
- [ ] Barra flotante inferior con total acumulado y cantidad de ítems.
- [ ] Al tocar el carrito, se despliega una hoja inferior (bottom-sheet) deslizable para revisar ítems y confirmar.
- [ ] Interacción gestual natural con soporte para swipe hacia abajo para cerrar.

---

## 3. Checklist de Tareas Técnicas

- [ ] Refactorizar vista comensal `/mesa/[token]` con arquitectura mobile-first.
- [ ] Implementar selector sticky de categorías con IntersectionObserver.
- [ ] Diseñar e implementar modal bottom-sheet para el carrito de compras.
- [ ] Asegurar tap targets táctiles confortables (min 48px).

---

## 4. Archivos Clave Involucrados

- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/comensal/*`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Base para US-57.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-56-navegacion-mobile
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
