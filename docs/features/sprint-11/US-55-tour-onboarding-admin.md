# US-55: Tour Interactivo de Onboarding para Administrador

> **Sprint**: Sprint 11 (07/09 – 13/09/2026)  
> **Épica**: Rediseño UI/UX Base & Onboarding Guiado  
> **Tipo**: `Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-55-tour-onboarding-admin`  

---

## 1. Descripción de la Historia

**Como** admin nuevo, un tour interactivo paso a paso me guía por sucursales, mesas, carta y QR en mi primer ingreso, y puedo reactivarlo cuando quiera desde un botón de Ayuda.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Detección automática del primer ingreso del admin con modal o popover interactivo.
- [ ] Tour guiado en 4 pasos principales: 1) Configurar negocio/sucursal, 2) Crear mesas y generar QR, 3) Cargar la carta digital, 4) Ver pedidos en vivo.
- [ ] Permite avanzar, retroceder u omitir el tour en cualquier momento.
- [ ] Botón accesible permanente en la cabecera / menú: 'Ver tour guiado' para reactivarlo.

---

## 3. Checklist de Tareas Técnicas

- [ ] Implementar componente de overlay/tour interactivo con pasos destacados.
- [ ] Persistir estado de tour completado (localStorage y/o perfil tenant).
- [ ] Añadir acceso directo en el header o barra de navegación para relanzar el tour.
- [ ] Validar responsive para que funcione en pantallas táctiles y escritorio.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/DashboardHeader.tsx`
- `repos/web/app/dashboard/page.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Alineada con US-53 y US-54.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-55-tour-onboarding-admin
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
