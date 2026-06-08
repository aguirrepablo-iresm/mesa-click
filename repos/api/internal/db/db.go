// internal/db/db.go
//
// Este paquete maneja la conexión a PostgreSQL.
// El resto del backend importa este paquete para hablar con la base de datos.

package db

import (
	"context"
	"fmt"
	"log/slog"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool es el pool de conexiones a la base de datos.
// Un pool mantiene varias conexiones abiertas y las reutiliza,
// en lugar de abrir y cerrar una conexión por cada request.
var Pool *pgxpool.Pool

// Conectar abre la conexión a PostgreSQL usando la variable DATABASE_URL.
// Se llama una sola vez al iniciar el servidor.
func Conectar() error {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		return fmt.Errorf("DATABASE_URL no está configurada")
	}

	pool, err := pgxpool.New(context.Background(), url)
	if err != nil {
		return fmt.Errorf("no se pudo crear el pool de conexiones: %w", err)
	}

	// Verificamos que la conexión funcione de verdad
	if err := pool.Ping(context.Background()); err != nil {
		return fmt.Errorf("no se pudo conectar a la base de datos: %w", err)
	}

	Pool = pool
	slog.Info("conexión a PostgreSQL establecida")
	return nil
}

// Cerrar cierra todas las conexiones del pool.
// Se llama cuando el servidor se apaga.
func Cerrar() {
	if Pool != nil {
		Pool.Close()
		slog.Info("conexión a PostgreSQL cerrada")
	}
}
