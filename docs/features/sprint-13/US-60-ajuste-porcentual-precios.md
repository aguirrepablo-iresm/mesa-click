# US-60: Ajuste Porcentual Masivo de Precios por Categoría o Carta Completa

> **Sprint**: Sprint 13 (21/09 – 27/09/2026)  
> **Épica**: Carga Masiva CSV/Excel & Ajuste de Precios  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-60-ajuste-precios`  

---

## 1. Descripción de la Historia

**Como** admin, puedo aplicar un incremento o descuento porcentual masivo a los precios por categoría o a toda la carta con un solo clic y previsualización previa.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Modal de ajuste masivo con selector: toda la carta o categoría específica.
- [ ] Input de porcentaje (+X% / -X%) y opción de redondeo (al múltiplo de 10 o 100 más cercano).
- [ ] Previsualización de ejemplos de precios actuales vs precios resultantes antes de confirmar.
- [ ] Endpoint backend `PATCH /carta/precios/ajuste-porcentual` que actualiza los valores en base de datos.

---

## 3. Checklist de Tareas Técnicas

- [ ] Endpoint en Go para aplicar la fórmula de incremento masivo.
- [ ] Interfaz de modal con simulación en tiempo real en frontend.
- [ ] Confirmación de seguridad ('¿Seguro que deseas actualizar X productos?').
- [ ] Notificación de éxito y refresco de la carta.

---

## 4. Archivos Clave Involucrados

- `repos/api/internal/carta/service.go`
- `repos/web/components/dashboard/CartaSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Independiente pero complementaria a US-59.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-60-ajuste-precios
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
