# US-53: Rediseño UI/UX Base y Sistema de Diseño Accesible

> **Sprint**: Sprint 11 (07/09 – 13/09/2026)  
> **Épica**: Rediseño UI/UX Base & Onboarding Guiado  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-53-rediseno-ui-base`  

---

## 1. Descripción de la Historia

**Como** usuario, la interfaz de administración adopta un nuevo sistema de diseño más limpio, accesible y con mejor contraste para operar con agilidad y confort visual.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Verificación de contraste tipográfico y elementos de acción según WCAG 2.1 AA.
- [ ] Normalización de escala de espaciados, bordes redondeados y sombras en Tailwind.
- [ ] Componentes base homogeneizados (Botones con feedback táctil de 44px min, Modales accesibles, Inputs consistentes).
- [ ] Compatibilidad y fluidez tanto en pantallas de escritorio como en tablets.

---

## 3. Checklist de Tareas Técnicas

- [ ] Auditar paleta de color y contraste en dashboard y componentes comunes.
- [ ] Refactorizar componentes UI recurrentes (cards, inputs, badges de estado).
- [ ] Asegurar tap targets táctiles mínimos de 44x44px.
- [ ] Probar en resoluciones de 320px a 1440px.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/*`
- `repos/web/app/globals.css`
- `repos/web/tailwind.config.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Ninguna. Base visual para todos los desarrollos de la Fase 4.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-53-rediseno-ui-base
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
