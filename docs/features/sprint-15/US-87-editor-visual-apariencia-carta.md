# US-87: Editor Visual Pro de Apariencia de la Carta

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Personalización y Marca  
> **Tipo**: `Fullstack / Frontend`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Mateo Silvestrin / Codex  
> **Rama de trabajo**: `feat/US-86-87-carta-visual`

---

## 1. Historia

**Como** administrador con Plan Pro,  
**quiero** identificar y personalizar las zonas principales de mi carta mediante una vista previa en vivo,  
**para** entender qué modifica cada color antes de publicarlo.

## 2. Criterios de aceptación

- [x] El teléfono de previsualización queda centrado dentro de un lienzo amplio y responsive.
- [x] Indicadores visuales discretos relacionan nombre/logo, categorías, botones de agregado y color principal con la vista previa.
- [x] Los colores de categorías y acciones se configuran de forma independiente con selector visual y valor hexadecimal.
- [x] Nombre visible, logo, modo claro/oscuro, tipografía y marca de agua continúan disponibles.
- [x] Cada cambio se refleja de inmediato en la previsualización.
- [x] Las opciones cromáticas avanzadas requieren Plan Pro en frontend y backend.
- [x] La carta pública recibe únicamente personalización avanzada de un plan Pro vigente.

## 3. Implementación

- Campos `color_categoria` y `color_accion` en tenant.
- Validación `#RRGGBB` y control de plan efectivo antes de guardar.
- Propagación segura a la consulta pública de mesa.
- Variables CSS `--mesa-category` y `--mesa-action` con contraste calculado.
- Editor renovado en `Configuración > Apariencia`.

