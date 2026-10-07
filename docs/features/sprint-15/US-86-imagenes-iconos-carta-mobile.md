# US-86: Imágenes de Productos, Íconos de Categoría y Carta Mobile Visual

> **Sprint**: Sprint 15 (05/10 – 11/10/2026)  
> **Épica**: Experiencia de Carta Digital  
> **Tipo**: `Fullstack / Integración`  
> **Estado**: ✅ **Resuelta**  
> **Asignado a**: Mateo Silvestrin / Codex  
> **Rama de trabajo**: `feat/US-86-87-carta-visual`

---

## 1. Historia

**Como** administrador de un negocio gastronómico,  
**quiero** agregar fotografías a mis productos y elegir un ícono representativo para cada categoría,  
**para** que la carta móvil sea más clara, atractiva y fácil de recorrer.

## 2. Criterios de aceptación

- [x] La gestión de carta permite seleccionar imágenes PNG o JPG al crear un artículo y reemplazarlas luego desde su miniatura.
- [x] Las imágenes se validan, recortan y comprimen antes de enviarse para mantener una relación visual uniforme.
- [x] Los productos sin foto conservan una tarjeta completa y utilizan el ícono de su categoría como fallback.
- [x] La configuración de categorías ofrece 15 íconos gastronómicos predeterminados.
- [x] La selección de íconos es exclusiva de Plan Pro y se valida tanto en frontend como en backend.
- [x] La carta pública muestra buscador, categorías táctiles con íconos, fotografías y acciones de agregado claramente diferenciadas.
- [x] Se mantienen disponibilidad, franjas horarias, variantes, carrito y pedidos colaborativos existentes.

## 3. Implementación

- Migración `029_carta_visual_imagenes_iconos_colores.sql` para `categorias.icono`.
- Validación segura de imágenes rasterizadas; SVG no se admite como foto de producto.
- Catálogo cerrado de íconos Material Symbols para evitar valores arbitrarios.
- Endpoint Pro `PATCH /carta/categorias/{id}/icono`.
- Actualización de `foto_url` mediante el endpoint de artículos existente.
- Rediseño responsive de `ItemCard`, `CategoriaNav` y `/mesa/[token]`.

