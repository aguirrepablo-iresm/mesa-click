package main_test

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"testing"
	"time"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/mesa"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/pedido"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/sucursal"
	"github.com/aguirrepablo-iresm/mesa-click/api/internal/tenant"
	"github.com/joho/godotenv"
)

func TestIntegracion_FlujoCompletoPedido(t *testing.T) {
	// Intentar cargar .env local si existe
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		t.Skip("DATABASE_URL no configurada, saltando test de integración")
	}

	err := db.Conectar()
	if err != nil {
		t.Skipf("no se pudo conectar a la base de datos (PostgreSQL probablemente apagado): %v. Saltando test de integración.", err)
		return
	}
	defer db.Cerrar()

	// Ejecutar migraciones por seguridad
	err = db.EjecutarMigraciones("migrations")
	if err != nil {
		t.Fatalf("error corriendo migraciones: %v", err)
	}

	ctx := context.Background()

	// Inicializar los stores y services reales de la app
	tenantStore := tenant.NuevoStore()
	tenantSvc := tenant.NuevoService(tenantStore)

	sucStore := sucursal.NuevoStore()
	sucSvc := sucursal.NuevoService(sucStore)

	mesaStore := mesa.NuevoStore()
	mesaSvc := mesa.NuevoService(mesaStore)

	pedidoStore := pedido.NuevoStore()
	pedidoSvc := pedido.NuevoService(pedidoStore)

	// Generar datos aleatorios para evitar conflictos
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	suffix := rng.Intn(100000)
	slug := fmt.Sprintf("test-bar-%d", suffix)
	email := fmt.Sprintf("admin-%d@test.com", suffix)

	// A. CREAR TENANT (Registro / Onboarding)
	t.Log("Creando tenant de prueba...")
	createdTenant, err := tenantSvc.Crear(ctx, tenant.OnboardingInput{
		Nombre:      "Test Bar Integracion",
		Slug:        slug,
		EmailAdmin:  email,
		NombreAdmin: "Admin Integracion",
	})
	if err != nil {
		t.Fatalf("error creando tenant: %v", err)
	}
	// Limpieza al terminar
	defer func() {
		t.Log("Limpiando datos del tenant de prueba...")
		// Al eliminar el tenant en cascada, PostgreSQL elimina usuarios, sucursales, sectores, mesas y pedidos.
		_, _ = db.Pool.Exec(ctx, "DELETE FROM tenants WHERE id = $1", createdTenant.ID)
	}()

	// B. OBTENER SUCURSAL DEFAULT
	t.Log("Obteniendo sucursales del tenant...")
	sucursales, err := sucSvc.Listar(ctx, createdTenant.ID)
	if err != nil {
		t.Fatalf("error listando sucursales: %v", err)
	}
	if len(sucursales) == 0 {
		t.Fatal("no se creó la sucursal predeterminada al crear el tenant")
	}
	sucursalDefault := sucursales[0]

	// C. CREAR SECTOR
	t.Log("Creando sector de prueba...")
	sector, err := sucSvc.CrearSector(ctx, sucursalDefault.ID, createdTenant.ID, sucursal.SectorInput{
		Nombre: "Terraza",
	})
	if err != nil {
		t.Fatalf("error creando sector: %v", err)
	}

	// D. CREAR MESA
	t.Log("Creando mesa de prueba...")
	createdMesa, err := mesaSvc.Crear(ctx, createdTenant.ID, mesa.MesaInput{
		SucursalID: sucursalDefault.ID,
		Numero:     15,
		Capacidad:  4,
	})
	if err != nil {
		t.Fatalf("error creando mesa: %v", err)
	}

	// Asignar el sector a la mesa (usando UPDATE directo en BD para validar integración)
	_, err = db.Pool.Exec(ctx, "UPDATE mesas SET sector_id = $1 WHERE id = $2", sector.ID, createdMesa.ID)
	if err != nil {
		t.Fatalf("error asignando sector a mesa: %v", err)
	}

	// E. CREAR PEDIDO (Simula la acción del cliente comensal)
	t.Log("Creando pedido desde el cliente...")
	itemsInput := []pedido.NuevoItemInput{
		{
			ArticuloID: "00000000-0000-0000-0000-000000000000", // No tenemos artículos reales insertados, pero el servicio de pedidos acepta cualquier UUID para testing
			Cantidad:   2,
			Notas:      "sin cebolla",
		},
	}
	createdPedido, err := pedidoSvc.Crear(ctx, pedido.NuevoPedidoInput{
		MesaID: createdMesa.ID,
		Items:  itemsInput,
	})
	if err != nil {
		t.Fatalf("error creando pedido: %v", err)
	}

	if createdPedido.MesaID != createdMesa.ID {
		t.Errorf("mesa del pedido incorrecta: got %q, want %q", createdPedido.MesaID, createdMesa.ID)
	}
	if createdPedido.Estado != "recibido" {
		t.Errorf("estado inicial del pedido incorrecto: got %q, want %q", createdPedido.Estado, "recibido")
	}

	// F. CAMBIAR ESTADO DEL PEDIDO (Simula la acción del recepcionista / mozo)
	t.Log("Cambiando estado del pedido a 'preparando'...")
	updatedPedido, err := pedidoSvc.CambiarEstado(ctx, createdPedido.ID, "preparando", createdTenant.ID)
	if err != nil {
		t.Fatalf("error actualizando estado del pedido: %v", err)
	}
	if updatedPedido.Estado != "preparando" {
		t.Errorf("estado final incorrecto: got %q, want %q", updatedPedido.Estado, "preparando")
	}

	// G. LISTAR PEDIDOS ACTIVOS DE LA SUCURSAL
	t.Log("Verificando listado de pedidos activos de la sucursal...")
	pedidosActivos, err := pedidoSvc.ListarActivos(ctx, sucursalDefault.ID, createdTenant.ID)
	if err != nil {
		t.Fatalf("error listando pedidos activos: %v", err)
	}

	encontrado := false
	for _, p := range pedidosActivos {
		if p.ID == createdPedido.ID {
			encontrado = true
			if p.Estado != "preparando" {
				t.Errorf("el pedido en el listado de activos tiene estado incorrecto: got %q, want %q", p.Estado, "preparando")
			}
			break
		}
	}
	if !encontrado {
		t.Errorf("el pedido creado %s no se encontró en la lista de activos de la sucursal", createdPedido.ID)
	}
}
