# US-75: Filtros Temporales y Exportación de Reportes a PDF y Excel

> **Sprint**: Sprint 18 (26/10 – 01/11/2026)  
> **Épica**: Business Analytics, Reputación & Exportación  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-75-exportacion-reportes`  

---

## 1. Descripción de la Historia

**Como** admin, puedo filtrar el dashboard por rangos de fecha y exportar el reporte consolidado a PDF o Excel para control contable y toma de decisiones.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Filtros de rango temporal: 'Hoy', 'Ayer', 'Esta semana', 'Este mes', 'Rango personalizado'.
- [ ] Botón 'Exportar a Excel (.xlsx / .csv)' con desglose de pedidos, mesas, fechas y montos.
- [ ] Botón 'Descargar informe PDF' con carátula del negocio, KPIs y gráficos impresos en formato A4.
- [ ] Generación ágil en el navegador sin bloquear el hilo principal.

---

## 3. Checklist de Tareas Técnicas

- [ ] Implementar componente de filtro de fecha con presets rápidos.
- [ ] Integrar generador de CSV/Excel en frontend.
- [ ] Formatear hoja de estilo de impresión o generar PDF ejecutivo.
- [ ] Validar con reportes de más de 500 registros.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/MetricasSection.tsx`
- `repos/web/lib/export.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Complementa US-73 y US-74.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-75-exportacion-reportes
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
