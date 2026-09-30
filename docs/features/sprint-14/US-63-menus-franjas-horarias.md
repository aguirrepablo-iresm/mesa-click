# US-63: Menús por Franja Horaria y Resolución Dinámica de Carta

> **Sprint**: Sprint 14 (28/09 – 04/10/2026)  
> **Épica**: Disponibilidad de Ítems (86) & Menús por Franja Horaria  
> **Tipo**: `Integración`  
> **Estado**: ✅ **Resuelta**
> **Asignado a**: Mateo Silvestrin
> **Rama de trabajo**: `feat/US-63-franjas-horarias`  

---

## 1. Descripción de la Historia

**Como** admin, puedo asignar categorías o ítems a franjas horarias (desayuno, mediodía, merienda, noche) y la carta del comensal se resuelve combinando hora actual, disponibilidad y apertura.

---

## 2. Criterios de Aceptación (Definition of Done)

- [x] Configuración de franjas horarias (hora inicio y fin) asociables a categorías o platos.
- [x] La consulta pública de la carta filtra automáticamente aquellos productos fuera de la franja horaria en curso.
- [x] Indicador amigable para el comensal indicando a partir de qué hora estará disponible una categoría no activa.
- [x] Los administradores pueden previsualizar la carta simulando cualquier franja horaria.

---

## 3. Checklist de Tareas Técnicas

- [x] Modelado de franjas horarias en categorías en backend.
- [x] Lógica de resolución horaria en `ObtenerCartaPublica` según zona horaria local.
- [x] Interfaz de configuración en dashboard.
- [x] Banner informativo en carta del comensal.

---

## 4. Archivos Clave Involucrados

- `repos/api/internal/carta/model.go`
- `repos/api/internal/carta/service.go`
- `repos/web/app/mesa/[token]/page.tsx`
- `repos/web/components/dashboard/CartaSection.tsx`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Alineada con US-52 y US-61.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-63-franjas-horarias
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
