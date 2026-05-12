# Mesa CLICK - Menú Digital y Gestión de Pedidos

Mesa CLICK es una plataforma integral para el sector gastronómico que permite digitalizar menús y gestionar pedidos en tiempo real mediante códigos QR en las mesas.

## 🚀 Estructura del Proyecto

El repositorio está organizado como un **monorepo**:

```text
mesa-click/
├── docs/               # Documentación de producto, flujos y diseño
│   ├── flows/          # Detalle de los flujos de usuario (Admin, Cliente)
│   └── product/        # Roadmap, User Stories y Presentación
├── repos/              # Código fuente de las aplicaciones
│   └── web/            # Aplicación Frontend (Next.js)
├── AGENTS.md           # Reglas y roles para agentes de IA
└── GEMINI.md           # Contexto y mandatos del proyecto
```

## 🛠️ Requisitos Previos (Windows)

Para correr el proyecto localmente, necesitas tener instalado:

1.  **Node.js**: Versión **20.x** o superior.
    *   Descárgalo en [nodejs.org](https://nodejs.org/).
2.  **Git**: Para clonar el repositorio.
3.  **Terminal**: Se recomienda usar **PowerShell** o **Windows Terminal**.

## 💻 Instalación y Ejecución (Web)

Sigue estos pasos para levantar el entorno de desarrollo del frontend:

### 1. Clonar el repositorio
```powershell
git clone <url-del-repo>
cd mesa-click
```

### 2. Instalar dependencias
Navega a la carpeta del proyecto web e instala los paquetes necesarios:
```powershell
cd repos/web
npm install
```

### 3. Correr en modo desarrollo
Inicia el servidor de desarrollo de Next.js:
```powershell
npm run dev
```

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000).

## 📖 Documentación Útil

*   **Roadmap y Backlog:** Ver `docs/product/mesa-click-presentacion.html`.
*   **Flujo de Onboarding:** Ver `docs/flows/happy-path-admin-negocio.md`.
*   **Guía de Diseño (Maqueta):** Ver `docs/flows/maqueta/v0/admin_onboarding/mesa_click/DESIGN.md`.

## 🤖 Roles del Equipo

Para entender cómo contribuir, revisa el archivo `AGENTS.md` en la raíz, donde se definen los estándares para:
*   **Backend:** Go, PostgreSQL, slog.
*   **Frontend:** Next.js, React, Tailwind CSS.
*   **Integración:** Contratos de API y flujos end-to-end.
