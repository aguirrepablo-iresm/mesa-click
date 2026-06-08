# Mesa CLICK — Contexto para Gemini CLI

> **LEER PRIMERO `AGENTS.md`**: Ese archivo es la fuente de verdad del proyecto, contiene el estado del sprint, las reglas de negocio y el stack técnico. `GEMINI.md` solo contiene mandatos operativos específicos para este CLI.

---

## Mandatos operativos (Gemini CLI)

### 1. Validación y Errores
- **Backend (Go)**: Siempre usar `slog` para logs estructurados. Los errores inesperados deben reportarse con `c.Error(err)` si el middleware de Sentry está activo.
- **Frontend (Next.js)**: Respetar TypeScript estricto. No usar `any`.

### 2. Uso de herramientas
- Antes de proponer cambios, usar `grep_search` para entender cómo se implementaron patrones similares en otros servicios.
- Para tareas complejas, usar `enter_plan_mode` para validar la estrategia antes de ejecutar.
- Siempre ejecutar los tests (si existen) después de una modificación usando `run_shell_command`.

### 3. Documentación
- Si detectas una discrepancia entre el código y los happy paths (`docs/flows/`), notificarlo al usuario antes de proceder.
- Mantener actualizado `memory/MEMORY.md` con notas sobre la infraestructura local o decisiones técnicas tomadas durante la sesión que no deban persistirse en git.

---

## Referencias rápidas

- **Sprint actual**: Sprint 4 (Servicios core + Auth)
- **Backend**: `repos/api/`
- **Frontend**: `repos/web/`
- **Diseño técnico**: `docs/product/arquitectura-back.md`
