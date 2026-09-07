# US-59: Interfaz de Carga Masiva con Plantilla Oficial y Previsualización

> **Sprint**: Sprint 13 (21/09 – 27/09/2026)  
> **Épica**: Carga Masiva CSV/Excel & Ajuste de Precios  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-59-interfaz-carga-masiva`  

---

## 1. Descripción de la Historia

**Como** admin, puedo descargar la plantilla oficial de carga, previsualizar los errores por fila e importar mi catálogo completo sin depender de soporte técnico.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Botón para descargar plantilla de ejemplo en formato `.csv` y `.xlsx` con datos de muestra.
- [ ] Zona de arrastrar y soltar archivo (Drag & Drop) con validación de extensión y peso.
- [ ] Visualización previa de filas parseadas antes del envío definitivo.
- [ ] Reporte visual post-importación indicando cuántos ítems se dieron de alta y detalle de filas rechazadas.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear modal o sección de importación masiva en `CartaSection.tsx`.
- [ ] Generar archivo modelo de plantilla descargable.
- [ ] Integrar llamada a `api.importarCarta` con barra de progreso o loader.
- [ ] Diseñar tabla de errores con número de fila y motivo de rechazo.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/CartaSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-58.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-59-interfaz-carga-masiva
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
