# US-65: Pantalla KDS Dedicada de Cocina con Temporizadores

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Kitchen Display System (KDS) & Impresión de Comandas  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-65-pantalla-kds`  

---

## 1. Descripción de la Historia

**Como** cocina, tengo una pantalla dedicada (KDS) separada del dashboard de recepción, con comandas en columnas por estado y temporizador visual de antigüedad.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Ruta `/kds` con diseño de alto contraste optimizado para pantallas y tablets de cocina.
- [ ] Columnas kanban: 'Pendientes', 'En Preparación' y 'Listos para Servir'.
- [ ] Temporizador por comanda con código de color: Verde (<10 min), Amarillo (10-20 min), Rojo (>20 min).
- [ ] Visualización clara de número de mesa, comanda, ítems, variantes y notas del comensal.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear página `/kds` y componentes de tarjetas de comanda.
- [ ] Conectar conexión SSE al canal de cocina.
- [ ] Implementar lógica de temporizador en vivo con alertas cromáticas.
- [ ] Diseñar modo pantalla completa (Full Screen) para monitores táctiles.

---

## 4. Archivos Clave Involucrados

- `repos/web/app/kds/page.tsx`
- `repos/web/components/kds/*`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-64.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-65-pantalla-kds
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
