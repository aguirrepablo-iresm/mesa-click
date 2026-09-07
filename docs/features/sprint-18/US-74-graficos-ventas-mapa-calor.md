# US-74: Gráficos de Ventas por Categoría y Mapa de Calor por Horario

> **Sprint**: Sprint 18 (26/10 – 01/11/2026)  
> **Épica**: Business Analytics, Reputación & Exportación  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-74-graficos-analytics`  

---

## 1. Descripción de la Historia

**Como** admin, visualizo gráficos de distribución de ventas por categoría y un mapa de calor con los horarios de mayor demanda para optimizar mi personal e insumos.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Gráfico de distribución porcentual de facturación por categoría de productos.
- [ ] Matriz de calor (heatmap) semanal: Días de la semana vs Horarios de 08:00 a 02:00 indicando picos de ocupación.
- [ ] Tooltips interactivos que detallan monto y cantidad de comandas al interactuar.
- [ ] Diseño adaptable y fluido que no degrade la navegación en tablets.

---

## 3. Checklist de Tareas Técnicas

- [ ] Integrar librería ligera de gráficos SVG (o componente nativo Tailwind/Recharts).
- [ ] Procesar datos temporales para armar la grilla del mapa de calor.
- [ ] Añadir leyendas claras y selector de métrica (por facturación o por pedidos).

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/MetricasSection.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-72 y US-73.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-74-graficos-analytics
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
