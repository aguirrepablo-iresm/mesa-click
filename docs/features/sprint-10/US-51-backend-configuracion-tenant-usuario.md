# US-51: Endpoints para Configuración de Negocio, Branding y Roles de Usuario

> **Sprint**: Sprint 10 (31/08 – 06/09/2026)  
> **Épica**: Configuración Avanzada de Cuenta  
> **Tipo**: `Backend`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Equipo Mesa CLICK  
> **Rama de trabajo**: `feat/US-51-configuracion-backend`  

---

## 1. Descripción de la Historia

**Como** sistema, expongo endpoints seguros (`PATCH /tenants/me`, `PATCH /usuarios/{id}`) para persistir metadatos del comercio, logo, Place ID de Google, configuración tributaria y actualización de roles del equipo.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Migración en PostgreSQL con columnas: `email_contacto`, `whatsapp`, `logo_url`, `color_primario`, `estilo_visual`, `datos_fiscales` (JSONB) y `google_review_url`.
- [x] Constraint de roles de usuario ampliado para admitir `cocina`.
- [x] Endpoint `PATCH /tenants/me` validando formato HEX y rubro.
- [x] Endpoint `PATCH /usuarios/{id}` para actualizar rol y nombre de miembros del equipo.
- [x] 100% de tests unitarios y de integración pasando en Go.

---

## 3. Checklist de Tareas Técnicas

- [x] Crear migración `014_alter_tenants_settings.sql`.
- [x] Actualizar modelos, stores y servicios de Tenant y Usuario.
- [x] Registrar rutas y handlers HTTP con logs estructurados `slog`.
- [x] Actualizar tests unitarios en `tenant/service_test.go` y `usuario/service_test.go`.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/014_alter_tenants_settings.sql`
- `repos/api/internal/tenant/model.go`
- `repos/api/internal/tenant/store.go`
- `repos/api/internal/tenant/service.go`
- `repos/api/internal/tenant/handler.go`
- `repos/api/internal/usuario/store.go`
- `repos/api/internal/usuario/service.go`
- `repos/api/internal/usuario/handler.go`
- `repos/api/rutas.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Ninguna. Habilita persistencia para US-50.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-51-configuracion-backend
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
