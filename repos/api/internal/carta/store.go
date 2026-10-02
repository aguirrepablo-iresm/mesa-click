package carta

import (
	"context"
	"errors"
	"strings"

	"github.com/aguirrepablo-iresm/mesa-click/api/internal/db"
	"github.com/jackc/pgx/v5"
)

// Store define las operaciones de persistencia del módulo carta.
type Store interface {
	ListarCategorias(ctx context.Context, tenantID string) ([]Categoria, error)
	CrearCategoria(ctx context.Context, tenantID string, input CategoriaInput) (*Categoria, error)
	EliminarCategoria(ctx context.Context, id, tenantID string) error
	// BuscarOCrearCategoria retorna el ID de la categoría con ese nombre para ese tenant,
	// creándola si no existe. Usado en importaciones masivas.
	BuscarOCrearCategoria(ctx context.Context, tenantID, nombre string) (string, error)
	ListarArticulos(ctx context.Context, tenantID string) ([]Articulo, error)
	CrearArticulo(ctx context.Context, tenantID string, input ArticuloInput) (*Articulo, error)
	ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error)
	ActualizarDisponibilidad(ctx context.Context, id, tenantID string, disponible bool) (*Articulo, error)
	ReponerTodos(ctx context.Context, tenantID string) (int, error)
	AjustarPrecios(ctx context.Context, tenantID string, input AjustePreciosInput) (*AjustePreciosResultado, error)
	EliminarArticulo(ctx context.Context, id, tenantID string) error
	ObtenerCartaPublica(ctx context.Context, sucursalID string) (*CartaPublica, error)

	ListarVariantes(ctx context.Context, articuloID, tenantID string) ([]Variante, error)
	CrearVariante(ctx context.Context, articuloID, tenantID string, input CrearVarianteInput) (*Variante, error)
	ActualizarVariante(ctx context.Context, id, tenantID string, input ActualizarVarianteInput) (*Variante, error)
	EliminarVariante(ctx context.Context, id, tenantID string) error
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
	if err := rows.Err(); err != nil {
		return nil, err
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

// BuscarOCrearCategoria devuelve el ID de la categoría con ese nombre para el tenant dado.
// Si no existe la crea. La resolución de "nombre ya existente" usa ILIKE para ser
// insensible a mayúsculas/minúsculas y así evitar duplicados visuales.
func (s *pgStore) BuscarOCrearCategoria(ctx context.Context, tenantID, nombre string) (string, error) {
	var id string

	// Intentar encontrar primero (case-insensitive)
	err := db.Pool.QueryRow(ctx,
		`SELECT id FROM categorias WHERE tenant_id = $1 AND nombre ILIKE $2 LIMIT 1`,
		tenantID, strings.TrimSpace(nombre),
	).Scan(&id)
	if err == nil {
		return id, nil
	}

	// Si no existe, crearla. El orden (orden) se calcula como MAX(orden)+1.
	err = db.Pool.QueryRow(ctx,
		`INSERT INTO categorias (tenant_id, nombre, orden)
		 VALUES ($1, $2, COALESCE((SELECT MAX(orden)+1 FROM categorias WHERE tenant_id = $1), 1))
		 ON CONFLICT DO NOTHING
		 RETURNING id`,
		tenantID, strings.TrimSpace(nombre),
	).Scan(&id)
	if err != nil {
		// Puede ocurrir si dos goroutines insertan la misma categoría en paralelo;
		// en ese caso, la segunda obtiene conflict y retornamos la existente.
		err2 := db.Pool.QueryRow(ctx,
			`SELECT id FROM categorias WHERE tenant_id = $1 AND nombre ILIKE $2 LIMIT 1`,
			tenantID, strings.TrimSpace(nombre),
		).Scan(&id)
		if err2 != nil {
			return "", err2
		}
	}
	return id, nil
}

func (s *pgStore) ListarArticulos(ctx context.Context, tenantID string) ([]Articulo, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo, disponible, reponer_diariamente
		 FROM articulos WHERE tenant_id = $1 ORDER BY nombre`, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var arts []Articulo
	for rows.Next() {
		var a Articulo
		if err := rows.Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo, &a.Disponible, &a.ReponerDiariamente); err != nil {
			return nil, err
		}
		arts = append(arts, a)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	artPtrs := make([]*Articulo, len(arts))
	for i := range arts {
		artPtrs[i] = &arts[i]
	}
	if err := s.cargarVariantesPunteros(ctx, artPtrs); err != nil {
		return nil, err
	}
	return arts, nil
}

func (s *pgStore) CrearArticulo(ctx context.Context, tenantID string, input ArticuloInput) (*Articulo, error) {
	a := &Articulo{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO articulos (tenant_id, categoria_id, nombre, descripcion, precio, foto_url, activo, disponible, reponer_diariamente)
		 VALUES ($1, $2, $3, $4, $5, $6, true, true, true)
		 RETURNING id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo, disponible, reponer_diariamente`,
		tenantID, input.CategoriaID, input.Nombre, input.Descripcion, input.Precio, input.FotoURL,
	).Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo, &a.Disponible, &a.ReponerDiariamente)
	return a, err
}

func (s *pgStore) ActualizarArticulo(ctx context.Context, id, tenantID string, u ArticuloUpdate) (*Articulo, error) {
	a := &Articulo{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE articulos SET
		   nombre              = COALESCE($3, nombre),
		   precio              = COALESCE($4, precio),
		   activo              = COALESCE($5, activo),
		   disponible          = COALESCE($6, disponible),
		   reponer_diariamente = COALESCE($7, reponer_diariamente)
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo, disponible, reponer_diariamente`,
		id, tenantID, u.Nombre, u.Precio, u.Activo, u.Disponible, u.ReponerDiariamente,
	).Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo, &a.Disponible, &a.ReponerDiariamente)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return a, nil
}

func (s *pgStore) ActualizarDisponibilidad(ctx context.Context, id, tenantID string, disponible bool) (*Articulo, error) {
	a := &Articulo{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE articulos SET disponible = $3
		 WHERE id = $1 AND tenant_id = $2
		 RETURNING id, tenant_id, categoria_id, nombre, COALESCE(descripcion,''), precio, COALESCE(foto_url,''), activo, disponible, reponer_diariamente`,
		id, tenantID, disponible,
	).Scan(&a.ID, &a.TenantID, &a.CategoriaID, &a.Nombre, &a.Descripcion, &a.Precio, &a.FotoURL, &a.Activo, &a.Disponible, &a.ReponerDiariamente)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return a, nil
}

func (s *pgStore) ReponerTodos(ctx context.Context, tenantID string) (int, error) {
	tag, err := db.Pool.Exec(ctx,
		`UPDATE articulos
		 SET disponible = true
		 WHERE tenant_id = $1 AND reponer_diariamente = true AND disponible = false`,
		tenantID,
	)
	if err != nil {
		return 0, err
	}
	return int(tag.RowsAffected()), nil
}

func (s *pgStore) AjustarPrecios(ctx context.Context, tenantID string, input AjustePreciosInput) (*AjustePreciosResultado, error) {
	resultado := &AjustePreciosResultado{}
	err := db.Pool.QueryRow(ctx,
		`WITH precios_actualizados AS (
			UPDATE articulos
			SET precio = CASE $4
				WHEN '10' THEN ROUND((precio * (1 + $3::numeric / 100)) / 10) * 10
				WHEN '100' THEN ROUND((precio * (1 + $3::numeric / 100)) / 100) * 100
				ELSE ROUND(precio * (1 + $3::numeric / 100), 2)
			END
			WHERE tenant_id = $1
			  AND ($2 = '' OR categoria_id::text = $2)
			RETURNING id
		)
		SELECT COUNT(*) FROM precios_actualizados`,
		tenantID, input.CategoriaID, input.Porcentaje, input.Redondeo,
	).Scan(&resultado.Actualizados)
	if err != nil {
		return nil, err
	}
	return resultado, nil
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
		        a.id, a.categoria_id, a.nombre, COALESCE(a.descripcion,''), a.precio, COALESCE(a.foto_url,''), a.disponible
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
			&art.ID, &art.CategoriaID, &art.Nombre, &art.Descripcion, &art.Precio, &art.FotoURL, &art.Disponible); err != nil {
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

	if err := rows.Err(); err != nil {
		return nil, err
	}

	var allArts []*Articulo
	for _, cat := range catMap {
		for i := range cat.Articulos {
			allArts = append(allArts, &cat.Articulos[i])
		}
	}
	if err := s.cargarVariantesPunteros(ctx, allArts); err != nil {
		return nil, err
	}

	resultado := &CartaPublica{}
	for _, id := range orden {
		resultado.Categorias = append(resultado.Categorias, *catMap[id])
	}
	return resultado, nil
}

func (s *pgStore) cargarVariantesPunteros(ctx context.Context, articulos []*Articulo) error {
	if len(articulos) == 0 {
		return nil
	}
	ids := make([]string, len(articulos))
	artMap := make(map[string]*Articulo, len(articulos))
	for i, a := range articulos {
		ids[i] = a.ID
		artMap[a.ID] = a
	}

	rows, err := db.Pool.Query(ctx,
		`SELECT id, articulo_id, nombre, precio_adicional, grupo, seleccion_unica, orden
		 FROM variantes
		 WHERE articulo_id = ANY($1)
		 ORDER BY grupo NULLS LAST, orden, nombre`,
		ids,
	)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var v Variante
		if err := rows.Scan(&v.ID, &v.ArticuloID, &v.Nombre, &v.PrecioAdicional, &v.Grupo, &v.SeleccionUnica, &v.Orden); err != nil {
			return err
		}
		if a, ok := artMap[v.ArticuloID]; ok {
			a.Variantes = append(a.Variantes, v)
		}
	}
	return rows.Err()
}

func (s *pgStore) ListarVariantes(ctx context.Context, articuloID, tenantID string) ([]Variante, error) {
	rows, err := db.Pool.Query(ctx,
		`SELECT v.id, v.articulo_id, v.nombre, v.precio_adicional, v.grupo, v.seleccion_unica, v.orden
		 FROM variantes v
		 JOIN articulos a ON a.id = v.articulo_id
		 WHERE v.articulo_id = $1 AND a.tenant_id = $2
		 ORDER BY v.grupo NULLS LAST, v.orden, v.nombre`,
		articuloID, tenantID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	variantes := make([]Variante, 0)
	for rows.Next() {
		var v Variante
		if err := rows.Scan(&v.ID, &v.ArticuloID, &v.Nombre, &v.PrecioAdicional, &v.Grupo, &v.SeleccionUnica, &v.Orden); err != nil {
			return nil, err
		}
		variantes = append(variantes, v)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return variantes, nil
}

func (s *pgStore) CrearVariante(ctx context.Context, articuloID, tenantID string, input CrearVarianteInput) (*Variante, error) {
	v := &Variante{}
	err := db.Pool.QueryRow(ctx,
		`INSERT INTO variantes (articulo_id, nombre, precio_adicional, grupo, seleccion_unica, orden)
		 SELECT $1, $2, $3, $4, $5, $6
		 WHERE EXISTS (SELECT 1 FROM articulos WHERE id = $1 AND tenant_id = $7)
		 RETURNING id, articulo_id, nombre, precio_adicional, grupo, seleccion_unica, orden`,
		articuloID, input.Nombre, input.PrecioAdicional, input.Grupo, input.SeleccionUnica, input.Orden, tenantID,
	).Scan(&v.ID, &v.ArticuloID, &v.Nombre, &v.PrecioAdicional, &v.Grupo, &v.SeleccionUnica, &v.Orden)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return v, nil
}

func (s *pgStore) ActualizarVariante(ctx context.Context, id, tenantID string, input ActualizarVarianteInput) (*Variante, error) {
	v := &Variante{}
	err := db.Pool.QueryRow(ctx,
		`UPDATE variantes v
		 SET nombre = COALESCE($3, v.nombre),
		     precio_adicional = COALESCE($4, v.precio_adicional),
		     grupo = COALESCE($5, v.grupo),
		     seleccion_unica = COALESCE($6, v.seleccion_unica),
		     orden = COALESCE($7, v.orden)
		 FROM articulos a
		 WHERE v.id = $1 AND v.articulo_id = a.id AND a.tenant_id = $2
		 RETURNING v.id, v.articulo_id, v.nombre, v.precio_adicional, v.grupo, v.seleccion_unica, v.orden`,
		id, tenantID, input.Nombre, input.PrecioAdicional, input.Grupo, input.SeleccionUnica, input.Orden,
	).Scan(&v.ID, &v.ArticuloID, &v.Nombre, &v.PrecioAdicional, &v.Grupo, &v.SeleccionUnica, &v.Orden)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return v, nil
}

func (s *pgStore) EliminarVariante(ctx context.Context, id, tenantID string) error {
	tag, err := db.Pool.Exec(ctx,
		`DELETE FROM variantes v
		 USING articulos a
		 WHERE v.id = $1 AND v.articulo_id = a.id AND a.tenant_id = $2`,
		id, tenantID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
