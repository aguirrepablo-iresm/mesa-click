package carta

import (
	"context"
	"fmt"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
)

// Store define las operaciones de persistencia del módulo carta.
type Store interface {
	ListarCategorias(ctx context.Context, tenantID string) ([]Categoria, error)
	CrearCategoria(ctx context.Context, tenantID string, input CategoriaInput) (*Categoria, error)
	EliminarCategoria(ctx context.Context, id, tenantID string) error
	ListarArticulos(ctx context.Context, tenantID string) ([]Articulo, error)
	CrearArticulo(ctx context.Context, tenantID string, input ArticuloInput) (*Articulo, error)
	ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error)
	EliminarArticulo(ctx context.Context, id, tenantID string) error
	ObtenerCartaPublica(ctx context.Context, sucursalID string) (*CartaPublica, error)
}

type pgStore struct{}

func NuevoStore() Store { return &pgStore{} }

func (s *pgStore) ListarCategorias(ctx context.Context, tenantID string) ([]Categoria, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, tenant_id, nombre, orden FROM categorias WHERE tenant_id = $1 ORDER BY orden`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var cats []Categoria
	for rows.Next() {
		var c Categoria
		if err := rows.Scan(&c.ID, &c.TenantID, &c.Nombre, &c.Orden); err != nil {
			return nil, err
		}
		cats = append(cats, c)
	}
	return cats, nil
}

func (s *pgStore) CrearCategoria(ctx context.Context, tenantID string, input CategoriaInput) (*Categoria, error) {
	c := &Categoria{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO categorias (tenant_id, nombre, orden) VALUES ($1, $2, $3)
		 RETURNING id, tenant_id, nombre, orden`,
		tenantID, input.Nombre, input.Orden,
	).Scan(&c.ID, &c.TenantID, &c.Nombre, &c.Orden)
	return c, err
}

func (s *pgStore) EliminarCategoria(ctx context.Context, id, tenantID string) error {
	tag, err := db.Pool.Exec(ctx,
		`DELETE FROM categorias WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *pgStore) ListarArticulos(ctx context.Context, tenantID string) ([]Articulo, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo
		 FROM articulos WHERE tenant_id = $1 ORDER BY nombre`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var arts []Articulo
	for rows.Next() {
		var a Articulo
		if err := rows.Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo); err != nil {
			return nil, err
		}
		arts = append(arts, a)
	}
	return arts, nil
}

func (s *pgStore) CrearArticulo(ctx context.Context, tenantID string, input ArticuloInput) (*Articulo, error) {
	a := &Articulo{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO articulos (tenant_id, categoria_id, nombre, descripcion, precio, foto_url, activo)
		 VALUES ($1, $2, $3, $4, $5, $6, true)
		 RETURNING id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo`,
		tenantID, input.CategoriaID, input.Nombre, input.Descripcion, input.Precio, input.FotoURL,
	).Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo)
	return a, err
}

func (s *pgStore) ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error) {
	a := &Articulo{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE articulos SET
		   nombre  = COALESCE($3, nombre),
		   precio  = COALESCE($4, precio),
		   activo  = COALESCE($5, activo)
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo`,
		id, tenantID, u.Nombre, u.Precio, u.Activo,
	).Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrNotFound, err)
	}
	return a, nil
}

func (s *pgStore) EliminarArticulo(ctx context.Context, id, tenantID string) error {
	tag, err := db.Pool.Exec(ctx,
		`DELETE FROM articulos WHERE id = $1 AND tenant_id = $2`, id, tenantID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *pgStore) ObtenerCartaPublica(ctx context.Context, sucursalID string) (*CartaPublica, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT c.id, c.nombre, c.orden,
		        a.id, a.categoria_id, a.nombre, COALESCE(a.descripcion,''), a.precio, COALESCE(a.foto_url,'')
		 FROM categorias c
		 JOIN articulos a ON a.categoria_id = c.id
		 WHERE a.tenant_id = (SELECT tenant_id FROM sucursales WHERE id = $1)
		   AND a.activo = true
		 ORDER BY c.orden, a.nombre`,
		sucursalID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	catMap := map[string]*CategoriaConArticulos{}
	var orden []string

	for rows.Next() {
		var (
			catID, catNombre string
			catOrden         int
			art              Articulo
		)
		if err := rows.Scan(&catID, &catNombre, &catOrden,
			&art.ID, &art.CategoriaID, &art.Nombre, &art.Descripcion, &art.Precio, &art.FotoURL); err != nil {
			return nil, err
		}
		art.Activo = true
		if _, ok := catMap[catID]; !ok {
			catMap[catID] = &CategoriaConArticulos{
				Categoria: Categoria{ID: catID, Nombre: catNombre, Orden: catOrden},
			}
			orden = append(orden, catID)
		}
		catMap[catID].Articulos = append(catMap[catID].Articulos, art)
	}

	resultado := &CartaPublica{}
	for _, id := range orden {
		resultado.Categorias = append(resultado.Categorias, *catMap[id])
	}
	return resultado, nil
}
