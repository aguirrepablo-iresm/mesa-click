# US-82: Pago de Cuenta con Mercado Pago (Sandbox Checkout Pro)

> **Sprint**: Sprint 13 (21/09 – 27/09/2026)  
> **Épica**: Monetización & Pagos Digitales  
> **Tipo**: `Integración`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Pablo Aguirre & Antigravity  
> **Rama de trabajo**: `feat/US-82-pago-mercadopago`  

---

## 1. Descripción de la Historia

**Como** comensal en la mesa,  
**quiero** tener la opción de pagar el total de mi cuenta digitalmente a través de Mercado Pago en entorno Sandbox,  
**para** abonar de forma rápida y segura desde mi celular, reduciendo los tiempos de espera y notificando al personal del local en tiempo real.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] **Creación de preferencia backend**: Endpoint público `POST /publica/mesas/{qr_token}/pago/mercadopago` que calcula el total de los pedidos activos de la cuenta actual de la mesa y crea la preferencia en Mercado Pago Developers API devolviendo `preference_id`, `init_point` y `sandbox_init_point`.
- [x] **Acción en la interfaz del comensal**: En `SeguimientoView.tsx`, se muestra la opción "Pagar con Mercado Pago" (logo oficial o botón estilizado) permitiendo al comensal abrir el checkout.
- [x] **Retorno y confirmación de pago**: Al completar el pago en Sandbox, el comensal es redirigido a `/mesa/[token]?pago=exitoso` con banner de éxito, confirmación de estado y actualización automática vía Server-Sent Events (SSE).
- [x] **Webhook IPN / Endpoint de confirmación**: Endpoint `POST /publica/pago/mercadopago/webhook` y `POST /publica/mesas/{qr_token}/pago/mercadopago/confirmar` para verificar pagos aprobados, registrar el comprobante y cerrar la cuenta de la mesa.
- [x] **Persistencia y auditoría**: Tabla `pagos` en PostgreSQL con referencia a `mesa_id`, `cuenta_version`, `monto`, `estado` y metadata de Mercado Pago.
- [x] **Configuración Multi-Tenant e Independiente por Sucursal**: Cada negocio puede definir sus credenciales globales por defecto (`mp_access_token`, `mp_public_key`, `mp_activo`), y cada sucursal física puede heredar, sobreescribir con su propia cuenta de Mercado Pago o deshabilitar los cobros digitales para sus mesas.
- [x] **Visibilidad Condicional en el Comensal**: El botón de "Pagar con Mercado Pago" se expone en la mesa únicamente cuando la sucursal/negocio tiene la integración activa y configurada.

---

## 3. Checklist de Tareas Técnicas

- [x] Migración `019_create_pagos.sql` para registro de transacciones de pago.
- [x] Migración `020_add_mercadopago_to_tenants_and_sucursales.sql` agregando soporte de credenciales en `tenants` y `sucursales`.
- [x] Paquete `internal/mercadopago` en Go con cliente HTTP oficial para la API de Mercado Pago y resolución dinámica de credenciales por mesa.
- [x] Endpoints públicos en Go para creación de preferencias, webhook y confirmación.
- [x] Actualización de métodos en `repos/web/lib/api.ts` (`crearPreferenciaPagoMP`, `confirmarPagoMP`, actualización de tipos).
- [x] Pestañas de configuración en Dashboard (`ConfiguracionSection.tsx`) para Negocio (default) y Sucursales (herencia / cuenta propia / inhabilitar).
- [x] Componente / botón de pago condicional en `SeguimientoView.tsx` y `app/mesa/[token]/page.tsx`.
- [x] Pruebas unitarias de Go y validación de build en frontend.

---

## 4. Archivos Clave Involucrados

- `repos/api/internal/mercadopago/` (cliente y handlers de Mercado Pago)
- `repos/api/migrations/019_create_pagos.sql`
- `repos/api/rutas.go`
- `repos/web/components/menu/SeguimientoView.tsx`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/lib/api.ts`

---

## 5. Estrategia Git y Reglas

1. Rama: `feat/US-82-pago-mercadopago` creada desde `qa`.
2. Validaciones obligatorias:
   - Backend: `cd repos/api && go test ./...`
   - Frontend: `cd repos/web && npm run build`
3. Merge hacia `qa` al finalizar.
