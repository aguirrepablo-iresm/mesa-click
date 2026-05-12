# Mesa CLICK - Project Context

## Project Overview
**Mesa CLICK** is a comprehensive platform designed for the hospitality industry (restaurants, cafes, fast food, etc.) to digitize their menus and manage table orders in real-time. The system aims to streamline the ordering process by allowing customers to scan QR codes at their tables, view digital menus, and place orders directly from their mobile devices.

### Key Features
- **Multi-tenant Architecture:** Support for multiple businesses.
- **Branch Management:** Configuration of sucursales with specific details (hours, contact, etc.).
- **Table & Sector Management:** Organization of tables and chairs within different sectors of a branch.
- **Digital Menu:** Dynamic menu management with categories, subcategories, products, and variants.
- **QR Code Generation:** Automatic generation of unique QR codes per table.
- **Real-time Orders:** A dashboard for the business to receive and manage orders as they change states (Received -> Preparing -> Ready -> Closed).
- **Authentication:** Magic link based authentication for business admins and staff.

## Project Structure & Documentation
The project is currently in the **Planning/Sprint 0** phase.

### Key Files
- `docs/product/mesa-click-presentacion.html`: The central presentation of the project, including:
    - **Roadmap:** 8 planned sprints.
    - **User Stories:** Detailed backlog for each sprint.
    - **Roles:** Defined roles for Backend (Back), Frontend (Front), and Integration (Int) developers.
- `docs/flows/happy-path-admin-negocio.md`: Detailed breakdown of the business onboarding and configuration flow.
- `docs/flows/happy-path-cliente.md`: (Placeholder) Planned flow for the customer experience.

## Monorepo Repositories
- `repos/web`: Next.js frontend application.

## Roadmap & Sprints
1. **Sprint 0:** Stack definition, architecture, and environment setup (Monorepo, Docker, CI/CD).
2. **Sprint 1a & 1b:** Business configuration (Tenants/Branches) and Auth (Magic Link).
3. **Sprint 2:** Digital menu, table management, and QR generation.
4. **Sprint 3:** Real-time order management and status tracking.
5. **Sprint 4:** Post-order customer actions (add items, request bill).
6. **Sprint 5:** Basic reports and metrics.
7. **Sprint 6:** QA, polishing, and production deployment.

## Development Guidelines (Planned)
- **Architecture:** Monorepo structure is planned for managing both Backend and Frontend.
- **Communication:** Real-time updates for order status using WebSockets or similar technology.
- **Conventions:** API structures and branch naming conventions to be defined in Sprint 0.
- **Roles:**
    - **Back:** API development, database modeling, infrastructure.
    - **Front:** UI/UX implementation, state management, client-side logic.
    - **Int:** Bridging Back and Front, defining shared conventions, and ensuring full-flow integration.

## Usage
This repository serves as the source of truth for the project's planning and requirements. When implementing new features, refer to the user stories in `docs/product/mesa-click-presentacion.html` and the flows in `docs/flows/happy-path-*.md` files.
