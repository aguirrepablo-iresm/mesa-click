# Mesa CLICK — API (Backend)

Servicio backend desarrollado en **Go** para la gestión de pedidos, carta digital y administración de negocios gastronómicos.

## Estado del desarrollo: Fase 2

Estamos actualmente en el **Sprint 4 ● (Servicios core + Auth)**. El backend utiliza una arquitectura basada en servicios internos y comunicación en tiempo real mediante SSE.

## Stack Tecnológico

- **Lenguaje:** Go 1.22+
- **Base de Datos:** PostgreSQL 16+
- **Driver DB:** `pgx/v5`
- **Logging:** `slog` (estándar)
- **Ruteo:** `net/http` (Mux estándar de Go 1.22)
- **Migraciones:** Sistema propio basado en SQL puro (idempotente)

## Estructura del Repositorio

```
repos/api/
├── main.go            ← Entry point: carga env, conecta DB y corre migraciones
├── rutas.go           ← Definición centralizada de endpoints
├── internal/
│   ├── db/            ← Gestión del pool de conexiones y lógica de migraciones
│   ├── auth/          ← (Sprint 4) Lógica de Magic Link y JWT
│   ├── tenant/        ← (Sprint 4) CRUD de negocios
│   ├── sucursal/      ← (Sprint 4) CRUD de sucursales y sectores
│   ├── mesa/          ← (Sprint 4) CRUD de mesas y generación de QR tokens
│   ├── carta/         ← (Sprint 4) CRUD de categorías, artículos y variantes
│   └── pedido/        ← (Sprint 5) Gestión de pedidos y estados
├── migrations/        ← Archivos .sql numerados (001 → 012)
├── .env.example       ← Plantilla de configuración
└── Dockerfile         ← Imagen para despliegue y desarrollo local
```

## Guía de Inicio Rápido

### 1. Requisitos
- Go instalado.
- Instancia de PostgreSQL activa.

### 2. Configuración
Copia el archivo de ejemplo y configura tus credenciales:
```bash
cp .env.example .env
```

### 3. Ejecución
```bash
go run .
```
El servidor correrá automáticamente las migraciones pendientes al iniciar.

## Endpoints de Verificación

- **Health Check:** `GET /health`
  Retorna el estado del servidor y la base de datos.

## Convenciones de Desarrollo

1. **Logs:** Usar `slog.Info`, `slog.Error`, etc. con atributos para logging estructurado.
2. **Errores:** Seguir el patrón de retorno de errores estándar de Go. En handlers, usar `http.Error` o responder con JSON estructurado.
3. **Migraciones:** No modificar archivos `.sql` existentes en `migrations/`. Si se requiere un cambio en el esquema, crear un nuevo archivo numerado.
4. **Contexto:** Respetar los tiempos de expiración y el manejo de contextos en las queries a la base de datos.

---
Mesa CLICK — Práctica Profesionalizante I.
