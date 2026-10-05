# US-85: Inicio de Sesión con Google para Administración

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Seguridad y Acceso al Panel  
> **Tipo**: `Fullstack / Integración`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Mateo Silvestrin / Codex  
> **Rama de trabajo**: `feat/US-85-login-google`

---

## 1. Historia

**Como** administrador o encargado registrado en Mesa CLICK,  
**quiero** iniciar sesión con mi cuenta de Google,  
**para** acceder al panel de forma inmediata sin depender de recibir un enlace por correo.

El magic link se conserva temporalmente como alternativa durante la validación en QA.

## 2. Criterios de aceptación

- [x] El login principal muestra el botón oficial **Continuar con Google**.
- [x] El backend valida firma, audiencia, emisor y vencimiento del ID token de Google.
- [x] Solo acceden correos que ya correspondan a un usuario de Mesa CLICK.
- [x] Si el correo no existe, se informa claramente que la cuenta no está registrada.
- [x] La identidad estable de Google (`sub`) se vincula al usuario en el primer acceso.
- [x] El backend emite el JWT interno actual, sin usar el token de Google como sesión de Mesa CLICK.
- [x] El magic link queda disponible como alternativa durante QA.
- [x] El Client ID se configura mediante variables de entorno y no queda escrito en el código fuente.

## 3. Tareas técnicas

### Backend Go

- [x] Migración para `usuarios.google_sub`, con índice único parcial.
- [x] Verificación server-side del ID token mediante las claves públicas JWKS de Google.
- [x] Endpoint `POST /auth/google`.
- [x] Asociación segura por `sub`, con vinculación inicial por correo verificado.
- [x] Pruebas unitarias del flujo exitoso, cuenta inexistente y token inválido.

### Frontend Next.js

- [x] Cargar Google Identity Services solamente en `/login`.
- [x] Renderizar el botón oficial de Google como acción principal.
- [x] Enviar `credential` al backend y guardar el JWT interno existente.
- [x] Mantener el formulario de magic link como acceso alternativo.
- [x] Documentar `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y su inyección en Docker.

## 4. Configuración

- Frontend: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Backend: `GOOGLE_CLIENT_ID`
- Orígenes autorizados: `http://localhost:3000` y el dominio público del frontend.
- No se requiere API key ni Client Secret para este flujo.

## 5. Validación

- [x] `go test ./...`
- [x] ESLint sobre los archivos modificados del login y cliente API.
- [x] `npm run build`
- [x] Prueba visual en escritorio y móvil.

> La prueba funcional completa con Google queda condicionada a que el Client ID
> autorice el origen del entorno y a configurar las variables en Render.

> El lint completo del frontend conserva dos errores preexistentes fuera del
> alcance de esta US, en `app/mesa/[token]/page.tsx` y
> `components/dashboard/StockModal.tsx`.
