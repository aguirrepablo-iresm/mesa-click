# US-62: Persistencia de Disponibilidad y Reposición Automática

> **Sprint**: Sprint 14 (28/09 – 04/10/2026)  
> **Épica**: Disponibilidad de Ítems (86) & Menús por Franja Horaria  
> **Tipo**: `Backend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-62-backend-disponibilidad`  

---

## 1. Descripción de la Historia

**Como** sistema, persisto la disponibilidad de cada ítem, con reposición automática al inicio del día y endpoint de reposición manual masiva.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Columna `disponible BOOLEAN DEFAULT true` y `reponer_diariamente BOOLEAN DEFAULT true` en tabla `articulos`.
- [ ] Endpoint `PATCH /carta/articulos/{id}/disponibilidad`.
- [ ] Endpoint `POST /carta/reponer-todos` para restaurar stock de todos los ítems de una sucursal con un solo clic.
- [ ] Lógica de reposición automática al detectar apertura de nuevo turno diario.

---

## 3. Checklist de Tareas Técnicas

- [ ] Migración SQL para columnas de disponibilidad.
- [ ] Actualizar store y handler en Go.
- [ ] Endpoint masivo de reposición de stock.
- [ ] Tests unitarios en `carta/service_test.go`.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/015_alter_articulos_disponibilidad.sql`
- `repos/api/internal/carta/store.go`
- `repos/api/internal/carta/service.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Base de US-61.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-62-backend-disponibilidad
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
