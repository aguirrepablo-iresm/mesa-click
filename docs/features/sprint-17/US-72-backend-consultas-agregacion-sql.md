# US-72: Consultas SQL de Agregación Optimizadas para Métricas

> **Sprint**: Sprint 17 (19/10 – 25/10/2026)  
> **Épica**: Dashboard con Métricas (KPIs)  
> **Tipo**: `Backend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-72-backend-metricas-sql`  

---

## 1. Descripción de la Historia

**Como** sistema, genero consultas optimizadas de agregación para facturación por turno, ticket promedio y rotación de mesas con tiempos de respuesta instantáneos.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Endpoint `GET /metricas/resumen?desde=...&hasta=...&sucursal_id=...`.
- [ ] Consultas SQL eficientes agrupadas por fecha, turno y estado de pedido.
- [ ] Cálculo de: Facturación total, ticket promedio, cantidad de pedidos cerrados, plato más vendido y tiempo promedio de despacho.
- [ ] Creación de índices en PostgreSQL en columnas de fecha y estado de pedidos.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear paquete `internal/metrica` con store y service.
- [ ] Escribir queries de agregación optimizadas con `SUM`, `AVG` y `COUNT`.
- [ ] Migración SQL de índices para reportes rápidos.
- [ ] Tests unitarios y benchmarking de consulta.

---

## 4. Archivos Clave Involucrados

- `repos/api/internal/metrica/*`
- `repos/api/migrations/017_indices_metricas.sql`
- `repos/api/rutas.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Habilita US-73.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-72-backend-metricas-sql
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
