BEGIN;

WITH tenant_upsert AS (
  INSERT INTO tenants (
    nombre,
    nombre_fantasia,
    rubro,
    slug,
    descripcion,
    email_contacto,
    whatsapp,
    logo_url,
    color_primario,
    estilo_visual,
    datos_fiscales,
    google_review_url
  ) VALUES (
    'Mesa Click Demo SRL',
    'Mesa Click Demo',
    'restaurante',
    'mesa-click-demo',
    'Cuenta local de desarrollo para trabajar el dashboard sin depender de correo real.',
    'admin@mesaclick.local',
    '+5493510000000',
    NULL,
    '#155e75',
    'claro',
    '{}'::jsonb,
    NULL
  )
  ON CONFLICT (slug) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    nombre_fantasia = EXCLUDED.nombre_fantasia,
    rubro = EXCLUDED.rubro,
    descripcion = EXCLUDED.descripcion,
    email_contacto = EXCLUDED.email_contacto,
    whatsapp = EXCLUDED.whatsapp,
    color_primario = EXCLUDED.color_primario,
    estilo_visual = EXCLUDED.estilo_visual
  RETURNING id
), tenant_ref AS (
  SELECT id FROM tenant_upsert
  UNION ALL
  SELECT id FROM tenants WHERE slug = 'mesa-click-demo'
  LIMIT 1
), admin_upsert AS (
  INSERT INTO usuarios (tenant_id, email, nombre, rol)
  SELECT id, 'admin@mesaclick.local', 'Admin Local', 'admin'
  FROM tenant_ref
  ON CONFLICT (email) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol
  RETURNING tenant_id
), sucursal_upsert AS (
  INSERT INTO sucursales (id, tenant_id, nombre, whatsapp, email, telefono, horarios)
  SELECT
    '10000000-0000-0000-0000-000000000001'::uuid,
    id,
    'Sucursal Centro',
    '+5493510000000',
    'admin@mesaclick.local',
    '3510000000',
    '{"lunes":"09:00-23:00","martes":"09:00-23:00","miercoles":"09:00-23:00","jueves":"09:00-23:00","viernes":"09:00-01:00","sabado":"10:00-01:00","domingo":"10:00-23:00"}'::jsonb
  FROM tenant_ref
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    nombre = EXCLUDED.nombre,
    whatsapp = EXCLUDED.whatsapp,
    email = EXCLUDED.email,
    telefono = EXCLUDED.telefono,
    horarios = EXCLUDED.horarios
  RETURNING id, tenant_id
), sector_upsert AS (
  INSERT INTO sectores (id, sucursal_id, nombre)
  SELECT '20000000-0000-0000-0000-000000000001'::uuid, id, 'Salón principal'
  FROM sucursal_upsert
  ON CONFLICT (id) DO UPDATE SET
    sucursal_id = EXCLUDED.sucursal_id,
    nombre = EXCLUDED.nombre
  RETURNING id, sucursal_id
), mesas_seed AS (
  INSERT INTO mesas (sucursal_id, sector_id, numero, capacidad, qr_token, estado)
  SELECT s.sucursal_id, s.id, v.numero, v.capacidad, v.qr_token, 'activa'
  FROM sector_upsert s
  CROSS JOIN (VALUES
    (1, 4, 'mesa-demo-1'),
    (2, 2, 'mesa-demo-2'),
    (3, 6, 'mesa-demo-3'),
    (4, 4, 'mesa-demo-4')
  ) AS v(numero, capacidad, qr_token)
  ON CONFLICT (sucursal_id, numero) DO UPDATE SET
    sector_id = EXCLUDED.sector_id,
    capacidad = EXCLUDED.capacidad,
    qr_token = EXCLUDED.qr_token,
    estado = 'activa'
  RETURNING id
), categorias_seed AS (
  INSERT INTO categorias (id, tenant_id, nombre, orden)
  SELECT v.id::uuid, t.id, v.nombre, v.orden
  FROM tenant_ref t
  CROSS JOIN (VALUES
    ('30000000-0000-0000-0000-000000000001', 'Entradas', 10),
    ('30000000-0000-0000-0000-000000000002', 'Principales', 20),
    ('30000000-0000-0000-0000-000000000003', 'Bebidas', 30)
  ) AS v(id, nombre, orden)
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    nombre = EXCLUDED.nombre,
    orden = EXCLUDED.orden
  RETURNING id, tenant_id, nombre
)
INSERT INTO articulos (id, tenant_id, categoria_id, nombre, descripcion, precio, foto_url, activo)
SELECT v.id::uuid, c.tenant_id, c.id, v.nombre, v.descripcion, v.precio, NULL, TRUE
FROM categorias_seed c
JOIN (VALUES
  ('40000000-0000-0000-0000-000000000001', 'Entradas', 'Papas rústicas', 'Papas con alioli y verdeo.', 4200.00),
  ('40000000-0000-0000-0000-000000000002', 'Entradas', 'Empanadas criollas', 'Unidad horneada con carne cortada a cuchillo.', 1200.00),
  ('40000000-0000-0000-0000-000000000003', 'Principales', 'Burger Mesa Click', 'Medallón smash, cheddar, panceta y salsa de la casa.', 7800.00),
  ('40000000-0000-0000-0000-000000000004', 'Principales', 'Milanesa napolitana', 'Con papas fritas y ensalada simple.', 9200.00),
  ('40000000-0000-0000-0000-000000000005', 'Bebidas', 'Limonada', 'Jarra individual con menta y jengibre.', 2600.00),
  ('40000000-0000-0000-0000-000000000006', 'Bebidas', 'Agua sin gas', 'Botella 500 ml.', 1500.00)
) AS v(id, categoria, nombre, descripcion, precio) ON v.categoria = c.nombre
ON CONFLICT (id) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  categoria_id = EXCLUDED.categoria_id,
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  activo = EXCLUDED.activo;

COMMIT;
