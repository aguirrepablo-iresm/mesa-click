# US-57: Personalización de Platos con Variantes, Opciones y Notas Libres

> **Sprint**: Sprint 12 (14/09 – 20/09/2026)  
> **Épica**: Mobile-First Comensal  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-57-personalizacion-platos`  

---

## 1. Descripción de la Historia

**Como** cliente, puedo personalizar platos con variantes, opciones y notas libres antes de agregar al pedido con confirmación táctil clara.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Al seleccionar un ítem con opciones, se abre un diálogo modal de personalización.
- [ ] Soporte para opciones mutuamente excluyentes (radio: término de cocción, tamaño) y múltiples (checkbox: aderezos, extras).
- [ ] Actualización del subtotal en vivo según los agregados seleccionados.
- [ ] Campo de notas libres para indicaciones especiales a cocina (ej. 'sin cebolla').

---

## 3. Checklist de Tareas Técnicas

- [ ] Extender tipo y estructura de datos de ítems en carrito para incluir opciones y notas.
- [ ] Crear modal interactivo de personalización de producto.
- [ ] Adaptar envío de ítems en `api.crearPedido` enviando las opciones y aclaraciones.

---

## 4. Archivos Clave Involucrados

- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-56.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-57-personalizacion-platos
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
