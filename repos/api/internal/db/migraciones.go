// internal/db/migraciones.go
//
// Lee los archivos de la carpeta migrations/ en orden numérico
// y los ejecuta contra la base de datos.
// Si una migración ya fue ejecutada, la saltea.

package db

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// EjecutarMigraciones corre todos los archivos .sql de la carpeta migrations/.
func EjecutarMigraciones(carpeta string) error {
	// Primero creamos la tabla que registra qué migraciones ya corrieron
	err := crearTablaMigraciones()
	if err != nil {
		return fmt.Errorf("error creando tabla de migraciones: %w", err)
	}

	// Leemos todos los archivos .sql de la carpeta
	archivos, err := filepath.Glob(filepath.Join(carpeta, "*.sql"))
	if err != nil {
		return fmt.Errorf("error leyendo carpeta de migraciones: %w", err)
	}

	// Los ordenamos por nombre (así respetamos el orden 001, 002, 003...)
	sort.Strings(archivos)

	for _, archivo := range archivos {
		nombre := filepath.Base(archivo)

		// Verificamos si esta migración ya fue ejecutada
		yaEjecutada, err := migracionYaEjecutada(nombre)
		if err != nil {
			return err
		}
		if yaEjecutada {
			slog.Info("migración ya ejecutada, se saltea", "archivo", nombre)
			continue
		}

		// Leemos el contenido del archivo SQL
		contenido, err := os.ReadFile(archivo)
		if err != nil {
			return fmt.Errorf("error leyendo %s: %w", nombre, err)
		}

		// Ejecutamos el SQL
		_, err = Pool.Exec(context.Background(), string(contenido))
		if err != nil {
			return fmt.Errorf("error ejecutando migración %s: %w", nombre, err)
		}

		// Registramos que esta migración ya corrió
		err = registrarMigracion(nombre)
		if err != nil {
			return err
		}

		slog.Info("migración ejecutada", "archivo", nombre)
	}

	return nil
}

// crearTablaMigraciones crea la tabla que lleva el registro de migraciones.
// Si ya existe, no hace nada.
func crearTablaMigraciones() error {
	sql := `
		CREATE TABLE IF NOT EXISTS _migraciones (
			nombre     TEXT        PRIMARY KEY,
			ejecutada_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`
	_, err := Pool.Exec(context.Background(), strings.TrimSpace(sql))
	return err
}

// migracionYaEjecutada devuelve true si esa migración ya está registrada.
func migracionYaEjecutada(nombre string) (bool, error) {
	var existe bool
	err := Pool.QueryRow(
		context.Background(),
		"SELECT EXISTS(SELECT 1 FROM _migraciones WHERE nombre = $1)",
		nombre,
	).Scan(&existe)
	return existe, err
}

// registrarMigracion guarda el nombre de la migración en la tabla de registro.
func registrarMigracion(nombre string) error {
	_, err := Pool.Exec(
		context.Background(),
		"INSERT INTO _migraciones (nombre) VALUES ($1)",
		nombre,
	)
	return err
}
