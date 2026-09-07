# US-53: Rediseño UI/UX Base, Sistema Accesible y Experiencia Mobile Comensal

> **Sprint**: Sprint 11 (07/09 – 13/09/2026)  
> **Épica**: Rediseño UI/UX Base & Onboarding Guiado  
> **Tipo**: `Frontend / Fullstack`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-53-rediseno-ui-base`  

---

## 1. Descripción de la Historia

**Como** usuario y administrador, la interfaz de administración adopta un nuevo sistema de diseño más limpio, accesible y con mejor contraste para operar con agilidad y confort visual.  
**Como** comensal y administrador de local gastronómico, la vista mobile de la mesa (`/mesa/[token]`) debe:
1. **Adoptar la identidad y diseño configurados por el negocio**: reflejar en el encabezado y componentes el logo de la marca, nombre comercial, color primario y estilo visual definidos en la configuración del comercio (US-50/US-51).
2. **Persistir la sesión de la mesa en el navegador**: evitar que al recargar o actualizar la página (`F5`, pull-to-refresh o cierre accidental de pestaña) la mesa vuelva a cero, conservando de forma transparente los ítems del carrito en curso, notas, pedido activo (`pedidoId`) y vista de seguimiento en tiempo real.

---

## 2. Criterios de Aceptación (Definition of Done)

### UI/UX Base y Accesibilidad
- [ ] Verificación de contraste tipográfico y elementos de acción según WCAG 2.1 AA.
- [ ] Normalización de escala de espaciados, bordes redondeados y sombras en Tailwind.
- [ ] Componentes base homogeneizados (Botones con feedback táctil de 44px min, Modales accesibles, Inputs consistentes).
- [ ] Compatibilidad y fluidez responsive en resoluciones de 320px a 1440px (móviles, tablets y escritorio).

### Rediseño Mobile Comensal & Branding del Negocio
- [ ] La vista pública mobile de comensal (`/mesa/[token]`) adopta el diseño configurado por el usuario/negocio en los ajustes del tenant (US-50/US-51):
  - Encabezado con visualización clara y responsive del **logo del negocio** (o fallback elegante con el nombre del comercio si no tiene logo).
  - Número de mesa visible y badge de estado de conexión/en vivo.
  - Aplicación consistente de acentos visuales y estilo de marca respetando la legibilidad.

### Persistencia de Sesión de la Mesa (Mobile / Navegador)
- [ ] La sesión de la mesa no se reinicia a cero al actualizar o recargar el navegador:
  - **Carrito persistente**: Los ítems agregados a la comanda, cantidades y notas de preparación se conservan en almacenamiento local (`localStorage` asociado al token de la mesa).
  - **Pedido activo y seguimiento continuo**: Si el comensal ya confirmó un pedido (`pedidoId`), al recargar se debe restaurar automáticamente la vista de seguimiento (`SeguimientoView`) con el estado actual del pedido (`recibido`, `preparando`, `listo`).
  - **Reconexión automática a SSE**: Al restaurar un pedido activo tras recargar la página, se reanuda la conexión a eventos Server-Sent Events (`/pedidos/[id]/eventos`) para no perder actualizaciones de cocina en tiempo real.
  - **Cierre de sesión limpio**: El carrito local se vacía al enviar el pedido y la sesión de la mesa se limpia de manera ordenada cuando la cuenta es cerrada o se inicia una nueva comanda.

---

## 3. Checklist de Tareas Técnicas

### Accesibilidad y Tokens Base
- [ ] Auditar paleta de color y contraste en dashboard y componentes comunes.
- [ ] Refactorizar componentes UI recurrentes (cards, inputs, badges de estado).
- [ ] Asegurar tap targets táctiles mínimos de 44x44px en todos los botones y acciones principales.

### Branding en Vista Mobile Comensal
- [ ] Enriquecer el endpoint público de mesa en Go (`GET /publica/mesas/{qr_token}`) para devolver los metadatos de identidad del tenant (`nombre`, `logo_url`, `color_primario`, `estilo_visual`).
- [ ] Actualizar tipos `MesaPublica` en `repos/web/lib/api.ts` para recibir y tipar las propiedades de branding.
- [ ] Rediseñar la cabecera mobile y layout en `repos/web/app/mesa/[token]/page.tsx` para incorporar el logo de la marca y la estética del negocio.

### Persistencia de Estado de Mesa
- [ ] Diseñar clave de almacenamiento aislada por token (`mesa_click_session_${token}`).
- [ ] Sincronizar el estado del `useReducer` en `app/mesa/[token]/page.tsx` con `localStorage` (ítems del carrito, vista activa, `pedidoId`, `estadoPedido`).
- [ ] En el montaje (`useEffect`), hidratar el estado previo desde `localStorage` si existe una sesión válida para ese token.
- [ ] Validar reconexión del `EventSource` SSE al hidratar un `pedidoId` existente.
- [ ] Agregar mecanismo de reseteo / nueva sesión al pedir y cerrar cuenta.

---

## 4. Archivos Clave Involucrados

- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/menu/*` (`CartDrawer.tsx`, `SeguimientoView.tsx`, `ItemCard.tsx`, `CategoriaNav.tsx`)
- `repos/web/components/dashboard/*`
- `repos/web/lib/api.ts`
- `repos/web/app/globals.css`
- `repos/web/tailwind.config.ts`
- `repos/api/internal/mesa/model.go`, `store.go`, `handler.go` (datos de branding en `MesaPublica`)

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Se integra con la configuración de perfil y branding desarrollada en **US-50** y **US-51** (Sprint 10). Sirve como base visual e interactiva para las historias de **US-56** (Navegación mobile por categorías y carrito drawer) y **US-57** (Personalización de platos y variantes).
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

