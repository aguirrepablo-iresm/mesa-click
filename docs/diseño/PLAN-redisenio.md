# Plan — Rediseño UI (monocromático) + Configuración de cuenta

> Estilo de referencia: `docs/diseño/` (DESIGN.md, tokens.json, screenshots).
> Prototipos: `docs/diseño/preview/home-login.html`, `logo-mesas.html`.
> Mockups Configuración: `docs/diseño/preview/config-vista-*.png`.

**Rama:** `feat/US-53-redisenio-ui` (creada desde `qa`).
**US cubiertas:** US-53 (sistema de diseño) + US-50 / US-51 / US-52 (Configuración avanzada de cuenta) del Sprint 10.
**Decisiones tomadas:**
- Alcance: sistema visual completo (afecta landing, login, onboarding, dashboard, comensal).
- Color: **monocromático puro**. Verde `#1ad379` reservado a estados de éxito / confirmación.
- Logo: **concepto E** ("mesa cenital") — `components/brand/Logo.tsx`.

---

## Convención de tokens

`app/globals.css` conserva los **nombres** de token y cambia los valores:

| Token | Antes | Ahora | Uso |
|---|---|---|---|
| `plain-green` | `#1ad379` | `#0a0a0a` | **acción primaria (tinta)** |
| `plain-green-muted` | `#17b267` | `#262626` | hover primaria |
| `success` *(nuevo)* | — | `#1ad379` | éxito / confirmación (único color) |
| `success-muted` *(nuevo)* | — | `#17b267` | hover éxito |
| `ash-graphite` | `#0a2414` | `#0a0a0a` | texto principal |
| `deep-forest` | `#283a2e` | `#333333` | texto secundario |
| `sage-green` | `#607166` | `#595959` | texto atenuado |
| `stone` *(nuevo)* | — | `#808080` | texto terciario / helper |
| `concrete` *(nuevo)* | — | `#d9d9d9` | bordes / divisores / inputs |
| `vanilla-cream` | `#f9f6f1` | `#eeeeee` | superficie |
| `ghost-fog` | `#f3fbe9` | `#f4f4f4` | relleno sutil |
| `font-display` *(nuevo)* | — | `Anton` | titulares grandes (`.display`) |

Botones primarios: `rounded-full`, `bg-plain-green text-canvas-white`.
Radios: `--radius-md` / `--radius-lg` = 8px.

---

## Fases y estado

### Fase A — Fundaciones + Landing + Login  ⏳ EN CURSO
- [x] `app/globals.css` — @theme monocromático, `.display`, reset de inputs
- [x] `app/layout.tsx` — fuente Anton + favicon (logo E)
- [x] `components/brand/Logo.tsx` — marca + `Wordmark`
- [x] `components/landing/LandingHeader.tsx`
- [x] `components/landing/LandingHero.tsx` — display + mockup de teléfono
- [ ] `components/landing/LandingFeatures.tsx` — banda negra, 3 pasos, íconos line-art
- [ ] `components/landing/LandingPricing.tsx` — tarjetas mono (Pro = invertida)
- [ ] `components/landing/LandingFAQ.tsx` — **nuevo**, acordeón `<details>`
- [ ] `components/landing/LandingFooter.tsx`
- [ ] `app/page.tsx` — insertar `<LandingFAQ />`
- [ ] `app/login/page.tsx` — layout split; "enlace enviado" en `success`
- [ ] `app/auth/verify/page.tsx` — estados mono; éxito en `success`
- [ ] `npm run build` verde → **checkpoint de revisión**

### Fase B — Onboarding + Dashboard  ✅
- [x] `components/onboarding/*` + `app/onboarding/page.tsx` — logo, progreso mono, pills negras (`text-canvas-white`), pantalla "negocio creado" con `success`
- [x] `app/dashboard/page.tsx` + `components/dashboard/*` — logo en cabecera/drawer, item de nav activo **invertido** (negro/blanco), acciones primarias a negro, badge "Listo" + punto SSE conectado en `success`
- [ ] **Comensal (`app/mesa/[token]`, `components/menu/*`) — NO se toca en Fase B.** Usa su propio sistema de color (`slate-*` / `green-*` de Tailwind), independiente de los tokens del admin. Su rework va con el **Mobile-First Comensal del Sprint 11** (US-56/57), no con este reskin.

### Fase C — Sección Configuración (nueva)  ✅
Vive como sección del dashboard (`ConfiguracionSection`), no como ruta aparte:
el mockup muestra el shell del dashboard + sub-pestañas.
- [x] `components/dashboard/ConfiguracionSection.tsx` — cabecera "Configuración", selector de sucursal, 4 sub-pestañas
- [x] **Negocio** — nombre (prefill del tenant), rubro, email admin, WhatsApp, link público base (derivado del slug), descripción + card "Estado del plan / Upgrade" (mock). Guardado **local** + banner "pendiente US-51"
- [x] **Apariencia** — nombre visible, subir logo (preview local), color principal (`input[type=color]`), estilo Claro/Oscuro + **vista previa en vivo** del menú. Guardado local + banner
- [x] **Equipo de trabajo** — reusa `EquipoSection` (list/invitar/eliminar contra la API real) + panel "Roles disponibles"
- [x] **Sucursales** — lista + form (nombre, WhatsApp, email, días abiertos, horario apertura/cierre, 2º turno). Guarda con `api.actualizarSucursal` (`PATCH /sucursales/{id}`, nuevo wrapper en `lib/api.ts`), horarios serializados al mismo JSON que usa el onboarding. "Crear sucursal PRO" = card gated/mock
- [x] Dashboard: se quita el tab "Equipo" del sidebar (pasa a Configuración) y el NavItem ⚙️ "Configuración" queda funcional; item de nav activo invertido

### Fase D — Cierre
- [x] `npm run build` verde (todas las rutas)
- [x] Revisión visual con `npm run dev` (ajustes: header, tamaños display, planes centrados)
- [x] PR a `qa` → https://github.com/aguirrepablo-iresm/mesa-click/pull/2

Rama `feat/US-53-redisenio-ui` · 6 commits (`75bf24a` → `fcc16ef` + este del plan).

---

## Backend pendiente (US-51 / US-52 · `repos/api`, Go)

La UI de Configuración se construye contra la API donde exista; donde falta, guarda con estado local + aviso "pendiente de backend".

| Necesita | Estado hoy |
|---|---|
| `PATCH /tenants/me` — metadatos del negocio + datos fiscales | ❌ no existe (`GET /tenants/me` sí) |
| Branding del menú (nombre visible, color, estilo) + **subir logo** (storage) | ❌ no existe |
| `PATCH /usuarios/{id}` — cambiar rol de un miembro | ❌ no existe (`GET/POST/DELETE /usuarios` sí). Equipo no edita rol inline. |
| Que `PATCH /sucursales/{id}` **persista** `horarios` (días + turnos) | ⚠️ el front ya lo envía (`api.actualizarSucursal`, mismo JSON que el onboarding); falta confirmar que el handler Go lo guarde |
| Cuotas por plan (Free/Pro) para gating de "Crear sucursal PRO" | ⏳ Sprint 16 |

---

## Fuera de alcance / no se toca

- Comportamiento, llamadas a API, textos funcionales, estructura de rutas, tests.
- Integración de pago, KDS, métricas (sprints posteriores).
