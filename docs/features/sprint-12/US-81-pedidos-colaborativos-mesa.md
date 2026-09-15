# US-81: Pedidos Colaborativos en Mesa con Identificación de Comensal y División de Cuenta

> **Sprint**: Sprint 12 (14/09 – 20/09/2026)  
> **Épica**: Mobile-First Comensal  
> **Tipo**: `Integración` (Fullstack: Frontend Comensal + Dashboard + Backend)  
> **Estado**: ⚡ **En Curso**
>
> **Asignado a**: Mateo Silvestrin
>
> **Rama de trabajo**: `feat/US-81-pedidos-colaborativos-mesa`  

---

## 1. Descripción de la Historia

**Como** comensal que comparte mesa con amigos, familiares o compañeros de trabajo,  
**quiero** ingresar mi nombre al escanear el QR, agregar ítems identificados con mi persona y ver en tiempo real lo que van pidiendo los demás integrantes de la mesa,  
**para** disfrutar de una experiencia grupal colaborativa, saber quién pidió cada plato tanto nosotros como el mozo/recepcionista, y poder elegir al final entre abonar la cuenta total unificada o separada por persona.

---

## 2. Criterios de Aceptación (Definition of Done)

### CA-1: Identificación de Comensal & Persistencia en Cookie
- Al ingresar a la URL de la mesa (`/mesa/[token]`), si no existe una identificación previa para esa mesa, se muestra un modal o diálogo bloqueante amigable solicitando el nombre o alias (ej. "Pablo", "Sofi").
- La identidad anónima (`comensal_id` UUID + nombre visible) se guarda en una cookie local (`mesa_click_comensal_${mesaId}`), vinculada a la versión vigente de la cuenta.
- Al recargar la página o volver a escanear el QR desde el mismo teléfono, el comensal no debe volver a ingresar su nombre.
- Se proporciona una opción visible y discreta en la cabecera para modificar el nombre ("Comensal: Pablo · Cambiar") en caso de error tipográfico.

### CA-2: Carrito y Pedido Colaborativo Multi-usuario en Tiempo Real
- Varios comensales pueden escanear el mismo código QR en simultáneo y ordenar desde sus respectivos dispositivos.
- Cada ítem agregado y confirmado en el pedido de la mesa viaja etiquetado con el `comensal_id` anónimo y el `comensal_nombre` visible correspondientes.
- A través del canal de tiempo real (SSE), todos los comensales sentados en la misma mesa visualizan la comanda grupal actualizada al instante con los ítems que van sumando sus acompañantes.

### CA-3: Trazabilidad Visual en Comensal y Dashboard de Mozo / Recepcionista
- **Vista Comensal**: En la lista de pedidos activos de la mesa, cada plato/bebida muestra un badge o avatar con el nombre de quién lo pidió (ej. `Pablo: 1x Hamburguesa Especial`, `Sofi: 1x Cerveza IPA`).
- **Dashboard de Salón / Recepcionista**: En la comanda de la mesa en `/dashboard`, el personal de sala ve el desglose de ítems con el nombre de cada comensal, facilitando a los mozos saber a quién entregar cada plato o copa al momento de servir.

### CA-4: Cuenta Flexible: Total Unificada vs. Dividida por Comensal
- En la sección "Pedir Cuenta" / "Ver Cuenta" de la mesa se ofrecen dos modos de visualización claros:
  1. **Cuenta Total (Consolidada)**: Suma global de todos los consumos de la mesa para abonar todo junto.
  2. **Dividir por Comensal (Desglose Individual)**: Desglosa el subtotal y detalle exacto de lo consumido por cada persona (`Pablo: $15.000`, `Sofi: $12.500`, etc.) facilitando el pago individual sin cálculos manuales.
  3. *(Opcional / Complementario)*: Calculadora de división equitativa en partes iguales (Split 1/N).
- En el modal de cobro del Dashboard de Recepción/Mozo, el personal puede consultar el desglose por comensal si el grupo solicita tickets o cobro por separado.

---

## 3. Checklist de Tareas Técnicas

### 🔹 Backend (`repos/api` - Go)
- [x] **Migración DB**: Agregar `comensal_id UUID` y `comensal_nombre VARCHAR(100)` a `pedido_items`, y asociar los pedidos a la versión vigente de la cuenta.
- [x] **Modelos Go**:
  - [x] Actualizar struct `PedidoItem` con `ComensalID` y `ComensalNombre`.
  - [x] Actualizar `NuevoItemInput` para recibir la identidad desde el frontend comensal.
- [x] **Store & Repositorio**:
  - Ajustar `InsertItem` y querys `SELECT` en `internal/pedido/store.go` para persistir y recuperar `comensal_nombre`.
- [x] **SSE / Tiempo Real**:
  - Asegurar que el evento emitido a través del canal SSE de pedidos incluya el `comensal_nombre` en cada ítem para sincronizar a todos los clientes conectados a la mesa.
- [x] **Lógica de Cuenta**:
  - Retornar los consumos de la cuenta vigente y facilitar la agregación por `comensal_id`, sin mezclar nombres iguales.
- [x] **Tests**:
  - Tests unitarios en `internal/pedido/service_test.go` verificando la correcta asignación y persistencia del comensal por ítem.

### 🔹 Frontend Comensal (`repos/web` - Next.js)
- [x] **Modal de Bienvenida / Nombre**:
  - Diseñar componente `ModalNombreComensal.tsx` con input táctil y botón de confirmación rápida ("Comenzar a pedir").
- [x] **Gestión de Cookies de Sesión**:
  - Implementar helpers de identidad de comensal mediante cookies para persistir la sesión por mesa y `cuenta_version`.
- [x] **Integración en Carrito**:
  - Enviar el nombre del comensal activo en el payload de `api.crearPedido` para cada línea de producto.
- [x] **Vista Grupal Colaborativa**:
  - Mostrar en la vista de seguimiento `/mesa/[token]` los ítems agrupados o etiquetados por comensal con actualización reactiva por SSE.
- [x] **Selector de Cuenta (Unificada / Dividida)**:
  - Componente de desglose de cuenta con tabs/toggle: "Cuenta de la Mesa" vs. "Por Persona" calculando subtotales por identidad anónima.

### 🔹 Frontend Dashboard Recepcionista (`repos/web/app/dashboard`)
- [x] **Visualización en Comanda**:
  - Añadir etiqueta visual (chip/badge) con el nombre del comensal al lado de cada ítem en las tarjetas de pedidos activos.
- [x] **Soporte de Cobro Separado**:
  - Permitir al recepcionista visualizar el subtotal de cada comensal al momento de marcar el pedido/mesa como cobrado.

---

## 4. Archivos Clave Involucrados

- `repos/api/migrations/016_add_comensal_pedidos_colaborativos.sql`
- `repos/api/internal/pedido/model.go`
- `repos/api/internal/pedido/store.go`
- `repos/api/internal/pedido/service.go`
- `repos/api/internal/pedido/service_test.go`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/comensal/ModalNombreComensal.tsx`
- `repos/web/components/menu/SeguimientoView.tsx`
- `repos/web/components/dashboard/RecepcionistaSection.tsx`
- `repos/web/lib/api.ts`
- `repos/web/lib/comensal.ts`
- `repos/web/lib/desgloseCuenta.ts`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Se complementa con **US-56** (Navegación mobile y carrito bottom-sheet) y aprovecha el canal SSE implementado en Fase 2/3.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-81-pedidos-colaborativos-mesa
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
