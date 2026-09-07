# US-71: Personalización Exclusiva Pro y Retiro de Marca de Agua

> **Sprint**: Sprint 16 (12/10 – 18/10/2026)  
> **Épica**: Modelo Freemium (Free vs Pro) & Control de Suscripciones  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-71-personalizacion-pro`  

---

## 1. Descripción de la Historia

**Como** admin en plan Pro, puedo ocultar la marca de agua de Mesa CLICK y personalizar la paleta de colores extendida de mi carta digital.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] En plan Free, se muestra el badge al pie de la carta pública: 'Digitalizado con Mesa CLICK'.
- [ ] En plan Pro, el toggle 'Mostrar marca de agua' en Apariencia permite desactivarlo.
- [ ] Paleta cromática extendida (color de fondo, acentos y fuentes) disponible solo en Pro; en Free se muestra con candado de upgrade.

---

## 3. Checklist de Tareas Técnicas

- [ ] Añadir lógica condicional en la carta pública del comensal según el plan del tenant.
- [ ] Añadir controles avanzados en `AparienciaTab` bloqueados para usuarios Free.
- [ ] Validar que al cambiar a Pro se apliquen inmediatamente los estilos avanzados.

---

## 4. Archivos Clave Involucrados

- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/dashboard/ConfiguracionSection.tsx`

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
