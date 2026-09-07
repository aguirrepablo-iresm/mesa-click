# US-58: Procesamiento Atómico de Carga Masiva de Catálogo por CSV/Excel

> **Sprint**: Sprint 13 (21/09 – 27/09/2026)  
> **Épica**: Carga Masiva CSV/Excel & Ajuste de Precios  
> **Tipo**: `Backend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-58-backend-carga-masiva`  

---

## 1. Descripción de la Historia

**Como** sistema, proceso la carga masiva de categorías y productos a partir de un archivo CSV/Excel en una sola transacción atómica, garantizando consistencia de datos.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Endpoint `POST /carta/importar` que recibe archivo CSV o XLSX vía multipart/form-data.
- [ ] Validación de campos obligatorios: categoría, nombre del producto, precio, descripción opcional.
- [ ] Transacción de base de datos completa: si hay un error irrecuperable se hace rollback total.
- [ ] Retorno de reporte JSON con conteo de registros creados, actualizados y lista de filas con advertencias o errores.

---

## 3. Checklist de Tareas Técnicas

- [ ] Implementar parser de CSV y XLSX en Go.
- [ ] Lógica de resolución de categorías (crear si no existe, asociar si ya existe).
- [ ] Test unitario con archivos válidos, inválidos y casos de borde.
- [ ] Medir performance para archivos de hasta 500 artículos.

---

## 4. Archivos Clave Involucrados

- `repos/api/internal/carta/import.go`
- `repos/api/internal/carta/handler.go`
- `repos/api/rutas.go`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Habilita US-59.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-58-backend-carga-masiva
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
