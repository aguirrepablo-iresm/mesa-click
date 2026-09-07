# US-80: Dashboard de Reseñas y Reputación con CSAT y Alertas de Servicio

> **Sprint**: Sprint 18 (26/10 – 01/11/2026)  
> **Épica**: Business Analytics, Reputación & Exportación  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-80-dashboard-reputacion`  

---

## 1. Descripción de la Historia

**Como** admin, accedo a una sección de 'Reseñas y Reputación' en el dashboard con índice de satisfacción (CSAT), desglose de estrellas, comentarios en tiempo real y alertas de clientes insatisfechos.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Tarjeta de Índice de Satisfacción del Cliente (CSAT) calculado como % de reseñas 4 y 5 estrellas.
- [ ] Gráfico de barras con la distribución de calificaciones de 1 a 5 estrellas.
- [ ] Muro de comentarios recibidos con fecha, número de mesa, mozo que atendió y comentario.
- [ ] Banner de alerta destacado en tiempo real si ingresa una calificación de 1 a 3★ para que el encargado pueda intervenir antes de que el cliente se retire.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear sección `ReputacionSection.tsx` en el dashboard.
- [ ] Endpoint `GET /resenas?sucursal_id=...` para listar valoraciones.
- [ ] Cálculo de CSAT y métricas de reputación.
- [ ] Alerta visual destacada para ratings bajos.

---

## 4. Archivos Clave Involucrados

- `docs/features/reseñas-local.html`
- `repos/web/components/dashboard/ReputacionSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-79.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-80-dashboard-reputacion
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
