// repos/web/lib/api.ts
//
// Cliente HTTP centralizado para interactuar con la API REST de Mesa CLICK (Go).
// Provee métodos tipados para autenticación, tenant/onboarding, carta, mesas, sucursales y equipo.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const TOKEN_STORAGE_KEY = 'mc_token';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getApiErrorMessage(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null) {
    const payload = data as Record<string, unknown>;
    if (typeof payload.error === 'string') return payload.error;
    if (typeof payload.mensaje === 'string') return payload.mensaje;
  }
  return fallback;
}

export function getErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error && error.message ? error.message : fallback;
  return toUserMessage(message, fallback);
}

function toUserMessage(message: string, fallback: string) {
  const normalized = message.trim().toLowerCase();

  if (!normalized) return fallback;
  if (normalized === 'failed to fetch' || normalized.includes('networkerror')) {
    return 'No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.';
  }
  if (normalized.includes('slug') || normalized.includes('nombre de url')) {
    return 'Ese nombre en URL ya está en uso. Probá con otro.';
  }
  if (
    normalized.includes('correo de acceso ya') ||
    normalized.includes('email ya') ||
    normalized.includes('email conflict') ||
    normalized.includes('correo ya')
  ) {
    return 'Ese correo de acceso ya está registrado. Iniciá sesión o usá otro correo.';
  }
  if (normalized === 'body inválido' || normalized === 'body invalido') {
    return 'No pudimos leer los datos enviados. Revisá el formulario e intentá nuevamente.';
  }
  if (normalized === 'email requerido') {
    return 'Ingresá un correo electrónico.';
  }
  if (normalized === 'error interno' || normalized.startsWith('error http 500')) {
    return 'Ocurrió un problema en el servidor. Intentá nuevamente en unos minutos.';
  }
  if (normalized.startsWith('error http 401') || normalized.includes('no autorizado')) {
    return 'Tu sesión no está activa. Volvé a iniciar sesión.';
  }
  if (normalized.startsWith('error http 403')) {
    return 'No tenés permisos para realizar esta acción.';
  }

  return message;
}

function parseJsonField(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function guardarSesion(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function cerrarSesion() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function estaAutenticado(): boolean {
  return !!obtenerToken();
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = obtenerToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return null as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data: unknown = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = getApiErrorMessage(data, `Error HTTP ${response.status}`);
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

// --- TIPOS ---

export interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingInput {
  nombre: string;
  nombre_fantasia?: string;
  rubro?: string;
  slug: string;
  email_admin: string;
  nombre_admin: string;
  sucursal_nombre?: string;
  email_sucursal?: string;
  direccion?: string;
  telefono?: string;
  whatsapp?: string;
  horarios?: unknown;
}

export interface Sucursal {
  id: string;
  tenant_id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  horarios?: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  sucursal_id: string;
  nombre: string;
  created_at: string;
}

export interface CategoriaAPI {
  id: string;
  tenant_id: string;
  nombre: string;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArticuloAPI {
  id: string;
  tenant_id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto_url?: string;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  variantes?: Array<{ id: string; nombre: string; precio: number }>;
}

export interface MesaAPI {
  id: string;
  tenant_id: string;
  sucursal_id: string;
  sector_id?: string;
  numero: number;
  capacidad: number;
  qr_token: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsuarioAPI {
  id: string;
  tenant_id: string;
  sucursal_id?: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'encargado' | 'mozo';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MesaPublica {
  id: string;
  numero: number;
  sucursal_id: string;
  tenant_id: string;
}

export interface ArticuloPublico {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  foto_url?: string;
  activo: boolean;
}

export interface CategoriaPublica {
  id: string;
  nombre: string;
  orden: number;
  articulos: ArticuloPublico[];
}

export interface CartaPublicaResponse {
  categorias: CategoriaPublica[];
}

export interface PedidoItemAPI {
  id: string;
  pedido_id: string;
  articulo_id: string;
  nombre_articulo?: string;
  cantidad: number;
  precio_unitario: number;
  notas?: string;
}

export interface PedidoAPI {
  id: string;
  mesa_id: string;
  sucursal_id: string;
  estado: 'recibido' | 'preparando' | 'listo' | 'cerrado';
  items?: PedidoItemAPI[];
  created_at: string;
  updated_at: string;
}

export interface NuevoPedidoInput {
  mesa_id: string;
  items: Array<{
    articulo_id: string;
    cantidad: number;
    notas?: string;
  }>;
}

// --- API METHODS ---

export const api = {
  // Base URLs
  getBaseUrl: () => API_BASE_URL,

  // 1. Auth (US-38)
  // El backend busca al usuario por email, así que lo mandamos normalizado
  // (igual que como lo guarda el onboarding) para que siempre matchee.
  // `magic_link_dev` solo viene en entornos sin proveedor de email configurado.
  solicitarMagicLink: async (email: string) => {
    return apiFetch<{ mensaje: string; magic_link_dev?: string }>('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  },

  verificarToken: async (token: string) => {
    const res = await apiFetch<{ token: string }>(`/auth/verify?token=${encodeURIComponent(token)}`);
    if (res.token) {
      guardarSesion(res.token);
    }
    return res;
  },

  // 2. Tenant / Onboarding (US-39)
  crearTenant: async (data: OnboardingInput) => {
    return apiFetch<Tenant>('/tenants', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        email_admin: data.email_admin.trim().toLowerCase(),
        horarios: parseJsonField(data.horarios),
      }),
    });
  },

  obtenerMiTenant: async () => {
    return apiFetch<Tenant>('/tenants/me');
  },

  // 3. Sucursales & Sectores
  listarSucursales: async () => {
    return apiFetch<Sucursal[]>('/sucursales');
  },

  crearSucursal: async (data: Partial<Sucursal>) => {
    return apiFetch<Sucursal>('/sucursales', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listarSectores: async (sucursalId: string) => {
    return apiFetch<Sector[]>(`/sucursales/${sucursalId}/sectores`);
  },

  crearSector: async (sucursalId: string, nombre: string) => {
    return apiFetch<Sector>(`/sucursales/${sucursalId}/sectores`, {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  },

  // 4. Carta (US-40)
  listarCategorias: async () => {
    return apiFetch<CategoriaAPI[]>('/carta/categorias');
  },

  crearCategoria: async (nombre: string, orden: number = 0) => {
    return apiFetch<CategoriaAPI>('/carta/categorias', {
      method: 'POST',
      body: JSON.stringify({ nombre, orden }),
    });
  },

  eliminarCategoria: async (id: string) => {
    return apiFetch<void>(`/carta/categorias/${id}`, {
      method: 'DELETE',
    });
  },

  listarArticulos: async () => {
    return apiFetch<ArticuloAPI[]>('/carta/articulos');
  },

  crearArticulo: async (data: {
    categoria_id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    foto_url?: string;
    activo?: boolean;
    orden?: number;
  }) => {
    return apiFetch<ArticuloAPI>('/carta/articulos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizarArticulo: async (id: string, data: Partial<ArticuloAPI>) => {
    return apiFetch<ArticuloAPI>(`/carta/articulos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  eliminarArticulo: async (id: string) => {
    return apiFetch<void>(`/carta/articulos/${id}`, {
      method: 'DELETE',
    });
  },

  // 5. Mesas & QR (US-40 & US-41)
  listarMesas: async () => {
    return apiFetch<MesaAPI[]>('/mesas');
  },

  crearMesa: async (data: {
    sucursal_id: string;
    sector_id?: string;
    numero: number;
    capacidad: number;
  }) => {
    return apiFetch<MesaAPI>('/mesas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizarMesa: async (id: string, data: Partial<MesaAPI>) => {
    return apiFetch<MesaAPI>(`/mesas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  eliminarMesa: async (id: string) => {
    return apiFetch<void>(`/mesas/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Equipo / Usuarios (US-40)
  listarUsuarios: async () => {
    return apiFetch<UsuarioAPI[]>('/usuarios');
  },

  invitarUsuario: async (data: {
    nombre: string;
    email: string;
    rol: 'admin' | 'encargado' | 'mozo';
    sucursal_id?: string;
  }) => {
    return apiFetch<{ usuario: UsuarioAPI; magic_link?: string; url_invitacion?: string }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  eliminarUsuario: async (id: string) => {
    return apiFetch<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  // 7. Flujo Público Comensal (US-42, US-43, US-44)
  obtenerMesaPorQR: async (qrToken: string) => {
    return apiFetch<MesaPublica>(`/publica/mesas/${encodeURIComponent(qrToken)}`);
  },

  obtenerCartaPublica: async (sucursalId: string) => {
    return apiFetch<CartaPublicaResponse>(`/publica/sucursales/${encodeURIComponent(sucursalId)}/carta`);
  },

  crearPedido: async (data: NuevoPedidoInput) => {
    return apiFetch<PedidoAPI>('/pedidos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 8. Recepcionista & SSE (US-44, US-45)
  listarPedidosActivos: async (sucursalId: string) => {
    return apiFetch<PedidoAPI[]>(`/pedidos?sucursal_id=${encodeURIComponent(sucursalId)}`);
  },

  cambiarEstadoPedido: async (pedidoId: string, estado: 'recibido' | 'preparando' | 'listo' | 'cerrado') => {
    return apiFetch<PedidoAPI>(`/pedidos/${encodeURIComponent(pedidoId)}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  obtenerEventosPedidoUrl: (pedidoId: string) => {
    return `${API_BASE_URL}/pedidos/${encodeURIComponent(pedidoId)}/eventos`;
  },

  obtenerEventosSucursalUrl: (sucursalId: string) => {
    const token = obtenerToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_BASE_URL}/sucursales/${encodeURIComponent(sucursalId)}/eventos${tokenQuery}`;
  },
};
