# Desarrollo local Mesa Click

Este repo quedó preparado para levantar el sistema local con Docker y scripts npm desde la raíz.
Docker es el camino principal; PostgreSQL portable queda solo como fallback explícito con `npm run dev:portable`.

## Primera vez o después de resetear la base

```powershell
npm run setup
```

El setup hace lo siguiente:

- Detecta tu IP Wi-Fi para generar QR accesibles desde celular.
- Levanta PostgreSQL, API y frontend con Docker Compose.
- Corre migraciones al iniciar la API.
- Siembra una cuenta y datos demo locales.

## Uso diario

```powershell
npm run dev
```

Esto levanta:

- PostgreSQL Docker en `localhost:5432`
- API Docker en `http://localhost:8080`
- Frontend Docker en `http://localhost:3000`
- Frontend accesible desde el celular usando la IP Wi-Fi de tu PC, por ejemplo `http://192.168.x.x:3000`

Dejá la terminal abierta mientras trabajás. Cortás todo con `Ctrl+C`.

Para que los QR funcionen desde un celular, conectá el celular a la misma red Wi-Fi que la PC y usá los QR generados mientras `npm run dev` está corriendo. El script detecta tu IP local y configura el build Docker con esa URL, no con `localhost`.

## Acceso local al dashboard

Usuario local:

```text
admin@mesaclick.local
```

Entrá a `http://localhost:3000/login`, pedí el magic link con ese email y la pantalla debería mostrar el link de desarrollo porque `APP_ENV=development` y no hay SMTP configurado.

También podés pedir el link desde consola si el sistema está levantado:

```powershell
npm run login:dev
```

Si PowerShell bloquea `npm` por política de ejecución, usá el equivalente:

```powershell
npm.cmd run dev
```

## URLs útiles

```text
Frontend:  http://localhost:3000
Dashboard: http://localhost:3000/dashboard
API:       http://localhost:8080/health
Mesa demo: http://localhost:3000/mesa/mesa-demo-1
```

La consola de `npm run dev` también muestra la URL para celular, por ejemplo:

```text
Celular: http://192.168.7.122:3000
Mesa demo: http://192.168.7.122:3000/mesa/mesa-demo-1
```

Si el celular sigue sin cargar, Windows probablemente bloqueó Node.js o Go en el firewall. Permití acceso en redes privadas cuando Windows muestre el aviso.

También podés crear las reglas una sola vez desde PowerShell ejecutado como Administrador:

```powershell
npm.cmd run firewall:local
```

## Base de datos local

Con Docker:

```powershell
npm run setup
npm run dev
```

Para detener los contenedores:

```powershell
npm run docker:down
```

## Reparar Docker Desktop

Si Docker Desktop falla con `unable to start`, `E_ACCESSDENIED`, `npipe` o `com.docker.service`, abrí PowerShell como Administrador y ejecutá:

```powershell
cd C:\Users\juanii\Documents\GitHub\mesa-click
npm.cmd run docker:repair
```

Después cerrá sesión de Windows y volvé a entrar si el script agregó tu usuario al grupo `docker-users`.

## Fallback portable

Si necesitás trabajar sin Docker por una urgencia, todavía existe el fallback:

```powershell
npm run dev:portable
```

PostgreSQL portable queda instalado en:

```text
.local/postgres
```

Los datos locales quedan en:

```text
.local/postgres-data
```

Para levantar solo la base:

```powershell
npm run db:up
```

Para detener solo la base:

```powershell
npm run db:down
```
