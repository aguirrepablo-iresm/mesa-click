# US-70: Bloqueo Elegante con Modal de Upgrade al Superar Límites

> **Sprint**: Sprint 16 (12/10 – 18/10/2026)  
> **Épica**: Modelo Freemium (Free vs Pro) & Control de Suscripciones  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-70-bloqueo-upgrade-modal`  

---

## 1. Descripción de la Historia

**Como** admin en plan Free, el sistema me bloquea elegantemente la creación de mesas o productos extra con un modal amigable invitando al upgrade.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Al presionar '+ Nueva Mesa' o '+ Nuevo Producto' habiendo alcanzado el cupo, se despliega modal educativo.
- [ ] Mensaje explicativo sin frustración: 'Has alcanzado el límite de 10 mesas de tu plan Free'.
- [ ] Botón directo de contacto / upgrade a Pro.
- [ ] Manejo del error HTTP 403 `PLAN_LIMIT_REACHED` en el cliente API para abrir automáticamente el modal.

---

## 3. Checklist de Tareas Técnicas

- [ ] Diseñar modal `UpgradeModal.tsx` con estética moderna.
- [ ] Conectar interceptor de errores en `lib/api.ts`.
- [ ] Deshabilitar preventivamente botones de adición si el cupo está al 100%.
- [ ] Validar experiencia de usuario fluida.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/UpgradeModal.tsx`
- `repos/web/components/dashboard/MesasSection.tsx`
- `repos/web/components/dashboard/CartaSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-68 y US-69.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-70-bloqueo-upgrade-modal
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
