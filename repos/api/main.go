// cmd/server/main.go
//
// Punto de entrada del servidor Mesa CLICK.
// Cuando corrés "go run ./cmd/server" esto es lo primero que ejecuta Go.
//
// Responsabilidades:
//   1. Cargar variables de entorno (.env)
//   2. Conectar a la base de datos
//   3. Ejecutar migraciones pendientes
//   4. Registrar las rutas de la API
//   5. Arrancar el servidor HTTP

package main

import (
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
)

func main() {
	// --- 1. Cargar variables de entorno ---
	// godotenv lee el archivo .env y carga las variables.
	// En producción no habrá .env (las variables vienen del servidor),
	// por eso no fallamos si el archivo no existe.
	if err := godotenv.Load(); err != nil {
		slog.Info(".env no encontrado, usando variables del sistema")
	}

	// --- 2. Conectar a la base de datos ---
	if err := db.Conectar(); err != nil {
		slog.Error("error conectando a la base de datos", "error", err)
		os.Exit(1)
	}
	defer db.Cerrar()

	// --- 3. Ejecutar migraciones ---
	if err := db.EjecutarMigraciones("migrations"); err != nil {
		slog.Error("error ejecutando migraciones", "error", err)
		os.Exit(1)
	}

	// --- 4. Registrar rutas ---
	mux := http.NewServeMux()
	registrarRutas(mux)

	// --- 5. Arrancar el servidor ---
	puerto := os.Getenv("PORT")
	if puerto == "" {
		puerto = "8080"
	}

	servidor := &http.Server{
		Addr:    ":" + puerto,
		Handler: mux,
	}

	// Escuchamos señales del sistema operativo para apagado limpio.
	// Cuando apretás Ctrl+C, el servidor cierra las conexiones antes de salir.
	go func() {
		señales := make(chan os.Signal, 1)
		signal.Notify(señales, syscall.SIGINT, syscall.SIGTERM)
		<-señales
		slog.Info("apagando el servidor...")
		servidor.Close()
	}()

	slog.Info("servidor escuchando", "puerto", puerto)
	if err := servidor.ListenAndServe(); err != http.ErrServerClosed {
		slog.Error("error en el servidor", "error", err)
		os.Exit(1)
	}
}
