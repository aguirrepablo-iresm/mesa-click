# US-73: Panel Visual con Tarjetas de KPIs y Métricas de Operación

> **Sprint**: Sprint 17 (19/10 – 25/10/2026)  
> **Épica**: Dashboard con Métricas (KPIs)  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-73-dashboard-kpis`  

---

## 1. Descripción de la Historia

**Como** admin, veo un panel visual con tarjetas de KPIs (Total vendido hoy, Pedidos activos, Ticket promedio, Platos más vendidos) para entender la salud de mi negocio.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Nueva sección 'Métricas' o panel superior en el dashboard principal.
- [ ] Tarjetas KPI de alto impacto: Facturación Hoy, Ticket Promedio, Pedidos Totales, Tiempo Medio de Atención.
- [ ] Indicadores de variación porcentual respecto al día o semana anterior (flechas verdes/rojas).
- [ ] Ranking de los 5 platos estrella con cantidad de ventas y monto recaudado.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear componente `MetricasSection.tsx` con tarjetas de resumen.
- [ ] Integrar llamada a `api.obtenerMetricasResumen`.
- [ ] Formateo monetario argentino (`$X.XXX`) y de tiempo (`XX min`).
- [ ] Skeletons de carga durante el cálculo de métricas.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/MetricasSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-72.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-73-dashboard-kpis
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
