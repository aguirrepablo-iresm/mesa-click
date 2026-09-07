# US-78: Demo Interactiva en Vivo y Cierre de la Materia

> **Sprint**: Sprint 19 (02/11 – 08/11/2026)  
> **Épica**: QA E2E, Load Testing, Polish Final & Presentación  
> **Tipo**: `Todos`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-78-demo-cierre`  

---

## 1. Descripción de la Historia

**Como** equipo, preparamos la demo interactiva en vivo, datos de prueba limpios y la documentación final para la entrega de la materia.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Base de datos de producción/demo poblada con datos realistas (negocio gastronómico completo, categorías, fotos, horarios y mesas con QR generados).
- [ ] Guion de demo sincronizado entre los 3 integrantes mostrando: Cliente (QR y pedido) -> Cocina (KDS) -> Recepción/Mozo (Salón y cobro) -> Admin (Métricas, Suscripción y Reseñas Google).
- [ ] Presentación de diapositivas (`docs/presentations/parte-2/index.html`) actualizada con estado final 100% completado.
- [ ] Verificación de despliegue estable en Render.

---

## 3. Checklist de Tareas Técnicas

- [ ] Script de seeding de datos de demo gastronómica completa.
- [ ] Ensayo general del flujo integral en vivo.
- [ ] Chequeo final de enlaces, QR impresos para la mesa del jurado y backup.
- [ ] Entrega final de repositorio y documentación.

---

## 4. Archivos Clave Involucrados

- `docs/presentations/parte-2/*`
- `AGENTS.md`
- `README.md`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Culminación de todos los sprints de la Fase 4.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-78-demo-cierre
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
