# US-77: Auditorías de Lighthouse y Accesibilidad WCAG (>90)

> **Sprint**: Sprint 19 (02/11 – 08/11/2026)  
> **Épica**: QA E2E, Load Testing, Polish Final & Presentación  
> **Tipo**: `Frontend`  
> **Estado**: 📋 **Pendiente**  
> **Asignado a**: Por asignar  
> **Rama de trabajo**: `feat/US-77-lighthouse-accesibilidad`  

---

## 1. Descripción de la Historia

**Como** usuario, la aplicación pasa auditorías de Lighthouse y accesibilidad con puntuaciones superiores a 90 en todas las vistas clave.

---

## 2. Criterios de Aceptación (Definition of Done)

- [ ] Score de Lighthouse > 90 en Rendimiento, Accesibilidad, Mejores Prácticas y SEO tanto en comensal (`/mesa/[token]`) como en dashboard (`/dashboard`).
- [ ] Core Web Vitals en rango verde (LCP < 2.5s, CLS < 0.1, FID/INP < 100ms).
- [ ] Navegación completa por teclado accesible y etiquetas ARIA presentes.
- [ ] Optimización de bundle JavaScript y compresión de imágenes WebP/SVG.

---

## 3. Checklist de Tareas Técnicas

- [ ] Correr auditorías automáticas de Lighthouse en Next.js.
- [ ] Optimizar imágenes, fuentes y lazy loading de componentes.
- [ ] Corregir observaciones de contraste y roles ARIA.
- [ ] Adjuntar capturas de score 90+ al informe final.

---

## 4. Archivos Clave Involucrados

- `repos/web/app/*`
- `repos/web/components/*`

---

## 5. Notas, Dependencias y Flujo de Trabajo

- **Dependencias**: Polish final de toda la interfaz web.
- **Estrategia Git**:
  1. Crear rama siempre a partir de `qa`:  
     ```bash
     git checkout qa && git pull
     git checkout -b feat/US-77-lighthouse-accesibilidad
     ```
  2. Implementar cambios siguiendo las reglas del proyecto ([AGENTS.md](../../AGENTS.md)).
  3. Validar builds antes de mergear:
     - Backend: `cd repos/api && go test ./...`
     - Frontend: `cd repos/web && npm run build`
  4. Abrir PR o mergear a `qa` y marcar este archivo como `✅ Resuelta`.
