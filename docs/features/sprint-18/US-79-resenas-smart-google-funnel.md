# US-79: Calificación Post-Consumo y Smart Google Review Funnel

> **Sprint**: Sprint 18 (26/10 – 01/11/2026)  
> **Épica**: Business Analytics, Reputación & Exportación  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-79-smart-google-funnel`  

---

## 1. Descripción de la Historia

**Como** comensal con pedido 'Listo', puedo calificar la experiencia (1 a 5★ + comentario) y, si es 4-5★, recibir la invitación directa con 1 tap para recomendar el local en Google Maps; si es 1-3★, el feedback queda privado para resolución interna.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Al cerrarse o completarse el pedido, la pantalla de seguimiento muestra tarjeta de calificación.
- [ ] Selector táctil interactivo de 1 a 5 estrellas con campo de comentario breve opcional.
- [ ] Lógica de Smart Funneling: si 4 o 5★, botón destacado 'Recomendanos en Google' abriendo el enlace/Place ID configurado.
- [ ] Si 1, 2 o 3★, mensaje agradeciendo el feedback sincero y notificación inmediata al dashboard de administración.
- [ ] Endpoint backend `POST /publica/pedidos/{id}/resena` para almacenar la valoración.

---

## 3. Checklist de Tareas Técnicas

- [ ] Migración SQL para tabla `resenas` (estrellas, comentario, pedido_id, tenant_id, created_at).
- [ ] Endpoint en Go para guardar reseña post-consumo.
- [ ] Componente en frontend comensal con animación de estrellas y derivación a Google Maps.
- [ ] Conectar con la URL configurada en US-50/US-51.

---

## 4. Archivos Clave Involucrados

- `docs/features/reseñas-local.html`
- `repos/api/migrations/018_create_resenas.sql`
- `repos/api/internal/resena/*`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/comensal/ModalResena.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Conectada con US-50 y US-51 (Google review URL).
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-79-smart-google-funnel
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
