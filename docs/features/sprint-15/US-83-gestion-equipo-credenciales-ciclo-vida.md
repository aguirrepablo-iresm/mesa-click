# US-83: Gestión de Equipo de Trabajo con Credenciales (Usuario y Clave) y Control de Ciclo de Vida

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Seguridad, Gestión de Personal & Multi-Tenancy  
> **Tipo**: `Fullstack / Integración`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-83-gestion-equipo-credenciales`  

---

## 1. Descripción de la Historia

**Como** administrador o encargado de un local gastronómico,  
**quiero** dar de alta a los integrantes de mi equipo de trabajo (mozos, cocineros, encargados) asignándoles un nombre de usuario y contraseña con autogeneración de claves, y disponer de herramientas para blanquear contraseñas, bloquear accesos temporales, archivar o eliminar cuentas,  
**para** gestionar al personal operativo de manera ágil sin requerir que utilicen emails personales con magic links, permitiendo rotación de turnos segura y control total del acceso por sucursal.

---

## 2. Criterios de Aceptación (Definition of Done)

### CA-1: Alta de Usuario de Equipo con Credenciales
- En la sección **Configuración > Equipo** del Dashboard, se incluye un formulario de alta de miembro con los campos:
  - **Nombre completo** (ej: "Juan Pérez").
  - **Nombre de usuario / Alias** (alfanumérico único dentro del tenant, ej: `mozo_juan`, `cocina1`, `barra`).
  - **Email** (opcional para el personal operativo, obligatorio solo para administradores).
  - **Rol operativo**: `encargado`, `mozo`, `cocina`.
  - **Sucursal asignada**: selector entre las sucursales del tenant.
  - **Contraseña**:
    - Botón **"Autogenerar clave segura"** que produce una contraseña legible de 8 a 10 caracteres (combinando letras y números).
    - Campo visible/ocultable para escribir una contraseña manual si se prefiere.
    - Botón **"Copiar usuario y clave"** al portapapeles para facilitar la entrega al empleado.

### CA-2: Seguridad y Hash de Contraseñas
- Las contraseñas se almacenan en la base de datos exclusivamente como hash criptográfico seguro mediante **`bcrypt`** (cost factor >= 10).
- La API nunca devuelve la contraseña en texto plano en las respuestas JSON de listado o detalle de usuario.

### CA-3: Blanqueo y Reseteo de Contraseña
- En el menú de acciones de cada usuario en la tabla de equipo, se incluye la acción **"Blanquear / Resetear clave"**.
- Permite al administrador generar una nueva clave temporal autogenerada o tipear una nueva contraseña.
- Al resetear la clave, se invalidan de inmediato las sesiones previas activas del usuario.

### CA-4: Bloqueo y Suspensión Temporal de Acceso
- Cada usuario cuenta con un estado operativo:
  - `activo`: Puede iniciar sesión con normalidad.
  - `bloqueado`: Acceso suspendido temporalmente (el login rechaza sus credenciales con mensaje explícito). No pierde su historial de comandas o pedidos atendidos.
- La tabla permite alternar el estado (bloquear/desbloquear) con un solo clic y feedback visual inmediato.

### CA-5: Archivado y Eliminación de Cuentas (Soft Delete)
- Opción de **"Archivar usuario"**: el usuario deja de figurar en el personal disponible para turnos y se bloquea su acceso, preservando integridad referencial con pedidos y comandas históricas.
- Opción de **"Eliminar usuario"**: soft delete (`deleted_at IS NOT NULL`) con diálogo de confirmación de seguridad.

### CA-6: Listado de Personal y Visualización de Estados
- Tabla interactiva con columnas:
  - Nombre y usuario (`@mozo_juan`).
  - Rol asignado (con chip distintivo).
  - Sucursal de trabajo.
  - Estado (`Activo` en verde, `Bloqueado` en ámbar, `Archivado` en gris).
  - Menú de acciones: Copiar usuario, Resetear clave, Bloquear/Desbloquear, Editar, Archivar/Eliminar.

---

## 3. Checklist de Tareas Técnicas

### 🔹 Backend (`repos/api` - Go)
- [ ] **Migración DB (`024_add_user_credentials_and_status.sql`)**:
  - [ ] Agregar columnas a la tabla `usuarios`:
    - `username VARCHAR(50) NULL` (con constraint único compuesto `UNIQUE (tenant_id, username)`).
    - `password_hash VARCHAR(255) NULL`.
    - `estado VARCHAR(20) NOT NULL DEFAULT 'activo'` (valores: `activo`, `bloqueado`, `archivado`).
    - `deleted_at TIMESTAMPTZ NULL`.
- [ ] **Modelos & Structs (`internal/usuario/model.go`)**:
  - [ ] Actualizar struct `Usuario` con `Username`, `Estado` y omitir `PasswordHash` en JSON.
  - [ ] Struct `CrearUsuarioStaffInput` con `Username`, `Password`, `Nombre`, `Rol`, `SucursalID`.
  - [ ] Struct `ResetPasswordInput` con `NuevaPassword`.
  - [ ] Struct `CambiarEstadoUsuarioInput` con `Estado` (`activo`, `bloqueado`, `archivado`).
- [ ] **Servicio & Repositorio (`internal/usuario/`)**:
  - [ ] Implementar hashing seguro con `golang.org/x/crypto/bcrypt`.
  - [ ] Método `CrearStaff(ctx, tenantID, input)` con validación de username único por tenant.
  - [ ] Método `ResetearPassword(ctx, usuarioID, tenantID, nuevaPassword)`.
  - [ ] Método `CambiarEstado(ctx, usuarioID, tenantID, nuevoEstado)`.
  - [ ] Método `Eliminar(ctx, usuarioID, tenantID)` (soft delete).
- [ ] **Handlers HTTP**:
  - [ ] `POST /usuarios/staff` (creación de staff con credenciales).
  - [ ] `PATCH /usuarios/{id}/password` (blanqueo de contraseña).
  - [ ] `PATCH /usuarios/{id}/estado` (bloqueo/desbloqueo).
  - [ ] `DELETE /usuarios/{id}` (archivado/baja).
- [ ] **Tests unitarios e integración**:
  - [ ] Validar que no se permitan usernames duplicados dentro del mismo tenant pero sí en tenants diferentes.
  - [ ] Validar que un usuario `bloqueado` no pueda autenticarse.

### 🔹 Frontend (`repos/web` - Next.js)
- [ ] **Cliente API (`lib/api.ts`)**:
  - [ ] Tipos: `UsuarioAPI` actualizado con `username`, `estado`.
  - [ ] Métodos: `api.crearUsuarioStaff`, `api.resetearPasswordUsuario`, `api.cambiarEstadoUsuario`, `api.eliminarUsuario`.
- [ ] **Componentes de Administración de Equipo (`components/dashboard/EquipoSection.tsx` o dentro de `ConfiguracionSection.tsx`)**:
  - [ ] Modal de Alta con botón "Autogenerar clave" (utilidad generadora de passwords legibles tipo `Panda72!`).
  - [ ] Botón de copiar datos de acceso al portapapeles con toast de confirmación.
  - [ ] Modal de blanqueo de clave con autogeneración instantánea.
  - [ ] Tabla con badges de estado y dropdown de acciones contextuales.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/024_add_user_credentials_and_status.sql`
- `repos/api/internal/usuario/model.go`
- `repos/api/internal/usuario/store.go`
- `repos/api/internal/usuario/service.go`
- `repos/api/internal/usuario/handler.go`
- `repos/api/internal/usuario/service_test.go`
- `repos/web/lib/api.ts`
- `repos/web/components/dashboard/ConfiguracionSection.tsx`
- `repos/web/components/dashboard/EquipoModal.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Habilita directamente la **US-84** (Portal de Login Único por Negocio).
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-83-gestion-equipo-credenciales
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
