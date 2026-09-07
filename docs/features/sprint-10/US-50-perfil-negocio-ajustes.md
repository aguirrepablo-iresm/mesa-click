# US-50: Gestión de Perfil de Negocio, Ajustes y Datos Fiscales

> **Sprint**: Sprint 10 (31/08 – 06/09/2026)  
> **Épica**: Configuración Avanzada de Cuenta  
> **Tipo**: `Frontend`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Equipo Mesa CLICK  
> **Rama de trabajo**: `feat/US-50-perfil-negocio`  

---

## 1. Descripción de la Historia

**Como** admin de negocio, quiero gestionar el perfil completo de mi comercio (logo, portada, datos de contacto, enlace de Google Reviews y datos fiscales) desde una pantalla de Ajustes para mantener actualizada la identidad y facturación de mi comercio.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Pestaña de 'Datos del negocio' con edición de nombre, rubro, email de contacto, WhatsApp y descripción.
- [x] Selector y subida de logo de la marca con previsualización interactiva en maqueta de celular.
- [x] Campos dedicados para datos fiscales (Razón Social, CUIT/CUIL, Condición frente al IVA).
- [x] Configuración de enlace / Place ID para el Smart Google Reviews Funnel.

---

## 3. Checklist de Tareas Técnicas

- [x] Diseñar formulario en NegocioTab dentro de `ConfiguracionSection.tsx`.
- [x] Integrar selector de logo con preview en tiempo real.
- [x] Conectar llamada al API cliente `api.actualizarMiTenant`.
- [x] Eliminar avisos de 'pendiente backend'.

---

## 4. Archivos Clave Involucrados

- `repos/web/components/dashboard/ConfiguracionSection.tsx`
- `repos/web/lib/api.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Complementada por US-51 (backend).
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-50-perfil-negocio
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
