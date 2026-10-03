# US-71: Personalización Exclusiva Pro y Retiro de Marca de Agua

> **Sprint**: Sprint 16 (12/10 – 18/10/2026)  
> **Épica**: Modelo Freemium (Free vs Pro) & Control de Suscripciones  
> **Tipo**: `Frontend / Backend`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Dev  
> **Rama de trabajo**: `feat/US-71-personalizacion-pro`  

---

## 1. Descripción de la Historia

**Como** admin en plan Pro, puedo ocultar la marca de agua de Mesa CLICK y personalizar la paleta de colores extendida de mi carta digital.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] En plan Free, se muestra el badge al pie de la carta pública: 'Potenciado por Mesa CLICK'.
- [x] En plan Pro, el toggle 'Mostrar marca de agua' en Apariencia permite desactivarlo.
- [x] Paleta cromática extendida (color secundario/acentos y fuentes) disponible solo en Pro; en Free se muestra con candado de upgrade y dispara `UpgradeModal`.

---

## 3. Checklist de Tareas Técnicas

- [x] Migración 025_personalizacion_pro_tenants.sql para `mostrar_marca_agua`, `color_secundario` y `tipo_fuente`.
- [x] Modelo y store Go actualizados con regla fail-safe en SQL para comensales (`CASE WHEN plan = 'pro' THEN mostrar_marca_agua ELSE true END`).
- [x] Componente `MarcaAgua.tsx` integrado en carta digital (`app/mesa/[token]/page.tsx`) y seguimiento de comanda (`SeguimientoView.tsx`).
- [x] Inyección de variables `--mesa-accent` y `--mesa-font` en `BrandHeader.tsx` y `globals.css`.
- [x] Controles en `AparienciaTab` de `ConfiguracionSection.tsx` con preview interactivo y bloqueo hacia `UpgradeModal`.
- [x] Validar que al cambiar a Pro se apliquen inmediatamente los estilos avanzados.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/025_personalizacion_pro_tenants.sql`
- `repos/api/internal/tenant/model.go` y `store.go`
- `repos/api/internal/mesa/model.go` y `store.go`
- `repos/web/components/menu/MarcaAgua.tsx`
- `repos/web/components/menu/BrandHeader.tsx`
- `repos/web/components/menu/SeguimientoView.tsx`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/dashboard/ConfiguracionSection.tsx`
- `repos/web/components/dashboard/UpgradeModal.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Depende de US-68 y US-69.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-71-personalizacion-pro
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
