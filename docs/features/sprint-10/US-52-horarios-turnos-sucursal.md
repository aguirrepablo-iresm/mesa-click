# US-52: Configuración de Horarios y Turnos de Atención por Sucursal

> **Sprint**: Sprint 10 (31/08 – 06/09/2026)  
> **Épica**: Configuración Avanzada de Cuenta  
> **Tipo**: `Integración`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Equipo Mesa CLICK  
> **Rama de trabajo**: `feat/US-52-horarios-sucursal`  

---

## 1. Descripción de la Historia

**Como** admin, puedo configurar horarios y turnos de atención por sucursal con apertura/cierre para organizar la atención al público.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Pestaña 'Sucursales' con selector de días abiertos (Lunes a Domingo).
- [x] Configuración de turnos (hora apertura y hora cierre).
- [x] Serialización y persistencia de horarios en backend mediante `PATCH /sucursales/{id}`.

---

## 3. Checklist de Tareas Técnicas

- [x] Componente `SucursalesTab` con parseHorarios y serializeHorarios.
- [x] Conexión con `api.actualizarSucursal`.
- [x] Feedback visual de guardado exitoso y manejo de errores.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/ConfiguracionSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Base para la resolución de carta pública por franja horaria (US-63).
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-52-horarios-sucursal
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
