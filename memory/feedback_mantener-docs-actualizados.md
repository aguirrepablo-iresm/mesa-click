---
name: mantener-docs-actualizados
description: El agente es responsable de mantener siempre actualizados AGENTS.md, GEMINI.md, CLAUDE.md y todos los README del repo ante cualquier cambio de fase, sprint, US o decisión de arquitectura.
metadata:
  type: feedback
---

Soy el encargado de mantener actualizados los siguientes archivos ante cualquier cambio relevante en el proyecto:

- `AGENTS.md` (raíz) — reglas generales, fases, sprints, fechas
- `GEMINI.md` — contexto para Gemini, siempre alineado con AGENTS.md
- `repos/web/AGENTS.md` — reglas del frontend, sprint en curso
- `repos/web/CLAUDE.md` — apunta a AGENTS.md, actualizar si cambia la estructura
- `README.md` (raíz y sub-repos) — documentación pública del proyecto

**Why:** El repo se comparte con múltiples personas y agentes de IA. Si estos archivos están desactualizados, los colaboradores arrancan con contexto incorrecto.

**How to apply:** Al final de cualquier tarea que cambie fase, sprint, US, stack, estructura de carpetas o decisión de arquitectura — actualizar los archivos afectados sin que el usuario lo pida. No esperar instrucción explícita.
