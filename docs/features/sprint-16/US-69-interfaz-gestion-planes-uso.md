# US-69: Sección 'Planes y Suscripción' con Métricas de Uso de Cuota

> **Sprint**: Sprint 16 (12/10 – 18/10/2026)  
> **Épica**: Modelo Freemium (Free vs Pro) & Control de Suscripciones  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-69-interfaz-planes`  

---

## 1. Descripción de la Historia

**Como** admin, veo una sección de 'Planes y Suscripción' con el uso actual de mis cuotas (mesas, productos, sucursales) y botones de upgrade a Pro.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Pestaña o modal de suscripción en el dashboard.
- [ ] Barras de progreso visuales con uso actual (ej. 8/10 mesas usadas, 25/30 platos).
- [ ] Badge visible en la barra superior indicando si el comercio está en plan 'Free' o 'Pro'.
- [ ] Comparativo claro de características entre Free y Pro.

---

## 3. Checklist de Tareas Técnicas

- [ ] Crear componente `PlanesSection.tsx` o integrar en `ConfiguracionSection.tsx`.
- [ ] Diseñar barras de progreso y comparativa de planes.
- [ ] Conectar con endpoint de estado de plan.
- [ ] Botón interactivo 'Solicitar Upgrade Pro'.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/ConfiguracionSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-68.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-69-interfaz-planes
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
