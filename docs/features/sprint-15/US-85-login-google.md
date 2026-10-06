# US-85: Inicio de Sesión con Google y Contraseña para Administración

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Seguridad y Acceso al Panel  
> **Tipo**: `Fullstack / Integración`  
> **Estado**: ⚡ **En Curso**
> **Asignado a**: Mateo Silvestrin / Codex  
> **Rama de trabajo**: `feat/US-85-password-login`

---

## 1. Historia

**Como** administrador o encargado registrado en Mesa CLICK,  
**quiero** iniciar sesión con mi cuenta de Google o con mi correo y contraseña de Mesa CLICK,
**para** acceder al panel de forma inmediata sin depender de recibir un enlace por correo.

El magic link deja de ofrecerse en el inicio de sesión administrativo. Su infraestructura se conserva únicamente para las invitaciones del equipo hasta que esa historia defina su reemplazo.

## 2. Criterios de aceptación

- [x] El login muestra correo y contraseña como acceso principal y el botón oficial **Continuar con Google** como alternativa.
- [x] El backend valida firma, audiencia, emisor y vencimiento del ID token de Google.
- [x] Solo acceden correos que ya correspondan a un usuario de Mesa CLICK.
- [x] Si el correo no existe, se informa claramente que la cuenta no está registrada.
- [x] La identidad estable de Google (`sub`) se vincula al usuario en el primer acceso.
- [x] El backend emite el JWT interno actual, sin usar el token de Google como sesión de Mesa CLICK.
- [x] El magic link no se ofrece en `/login` y permanece acotado a invitaciones del equipo.
- [x] Las contraseñas de Mesa CLICK se almacenan exclusivamente como hash bcrypt y nunca en texto plano.
- [x] Un correo inexistente y una contraseña incorrecta devuelven el mismo error para evitar enumeración de cuentas.
- [x] El Client ID se configura mediante variables de entorno y no queda escrito en el código fuente.
- [ ] La página principal pública identifica a Mesa CLICK, explica su funcionalidad y enlaza la documentación legal.
- [ ] La aplicación dispone de páginas públicas de **Política de Privacidad** y **Términos del Servicio**, accesibles sin iniciar sesión.
- [ ] La configuración de marca de Google OAuth incluye logo, página principal y enlaces legales vigentes.
- [ ] El dominio público utilizado por OAuth está autorizado y su propiedad queda verificada.
- [ ] La aplicación OAuth está publicada fuera del modo de prueba y permite el acceso de un usuario externo que ya esté registrado en Mesa CLICK.

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
- [x] Incorporar el formulario de correo y contraseña y retirar el formulario de magic link.
- [x] Incorporar creación y confirmación de contraseña en el onboarding del administrador.
- [x] Documentar `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y su inyección en Docker.

### Publicación y cumplimiento OAuth

- [ ] Crear las rutas públicas `/privacidad` y `/terminos`, respetando la identidad visual de Mesa CLICK.
- [ ] Informar en la Política de Privacidad cómo se accede, utiliza, almacena y comparte la información recibida desde Google.
- [ ] Incorporar en la página principal enlaces visibles a la Política de Privacidad y a los Términos del Servicio.
- [ ] Preparar un logotipo cuadrado apto para la pantalla de consentimiento de Google OAuth.
- [ ] Completar la sección **Información de la marca** de Google Auth Platform con URLs públicas reales.
- [ ] Registrar y verificar el dominio autorizado mediante Google Search Console cuando corresponda.
- [ ] Publicar la aplicación OAuth y validar el inicio de sesión con una cuenta ajena a la lista de usuarios de prueba.

## 4. Configuración

- Frontend: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Backend: `GOOGLE_CLIENT_ID`
- Orígenes autorizados: `http://localhost:3000` y el dominio público del frontend.
- No se requiere API key ni Client Secret para este flujo.
- Las URLs de página principal, privacidad y términos deben ser públicas, usar HTTPS y pertenecer al dominio autorizado.
- No se deben registrar en Google Cloud rutas legales hasta que existan en el despliegue público.

## 5. Validación

- [x] `go test ./...`
- [x] ESLint sobre los archivos modificados del login y cliente API.
- [x] `npm run build`
- [x] Prueba visual en escritorio y móvil.
- [ ] Verificación de marca y publicación de Google OAuth para usuarios externos.

> La prueba funcional completa con Google queda condicionada a que el Client ID
> autorice el origen del entorno y a configurar las variables en Render.

> El inicio de sesión con Google ya fue validado en modo de prueba. La US vuelve
> a estado **En Curso** hasta completar las páginas legales, verificar la marca y
> publicar OAuth para usuarios externos.

> El lint completo del frontend conserva dos errores preexistentes fuera del
> alcance de esta US, en `app/mesa/[token]/page.tsx` y
> `components/dashboard/StockModal.tsx`.
