"use client";
import { useCallback, useReducer, useState, useEffect, useRef, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ArticuloPublico, CategoriaPublica, MesaPublica } from "@/lib/api";
import CategoriaNav from "@/components/menu/CategoriaNav";
import ItemCard from "@/components/menu/ItemCard";
import CartDrawer from "@/components/menu/CartDrawer";
import SeguimientoView from "@/components/menu/SeguimientoView";
import BrandHeader, { buildMesaTheme } from "@/components/menu/BrandHeader";
import type { MesaBranding } from "@/components/menu/BrandHeader";

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  nota: string;
};

export type EstadoPedido = 'recibido' | 'preparando' | 'listo' | 'cerrado';
type Vista = 'carta' | 'carrito' | 'seguimiento';

export type PedidoSesion = {
  id: string;
  items: CartItem[];
  estado: EstadoPedido;
};

type State = {
  items: CartItem[];
  pedidos: PedidoSesion[];
  vista: Vista;
  estadoPedido: EstadoPedido;
  cuentaSolicitada: boolean;
  pedidoId: string | null;
};

type Action =
  | { type: 'ADD_ITEM'; payload: { id: string; nombre: string; precio: number } }
  | { type: 'SET_CANTIDAD'; payload: { id: string; cantidad: number } }
  | { type: 'SET_NOTA'; payload: { id: string; nota: string } }
  | { type: 'SET_VISTA'; payload: Vista }
  | { type: 'HYDRATE'; payload: State }
  | { type: 'CONFIRMAR_PEDIDO'; payload: { pedidoId: string; items: CartItem[] } }
  | { type: 'SET_ESTADO_PEDIDO'; payload: { pedidoId: string; estado: EstadoPedido } }
  | { type: 'PEDIR_CUENTA' }
  | { type: 'RESET_SESSION' };

const INITIAL_STATE: State = {
  items: [],
  pedidos: [],
  vista: 'carta',
  estadoPedido: 'recibido',
  cuentaSolicitada: false,
  pedidoId: null,
};

const SESSION_VERSION = 2;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find(i => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, cantidad: i.cantidad + 1 } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, cantidad: 1, nota: '' }],
      };
    }
    case 'SET_CANTIDAD':
      if (action.payload.cantidad <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, cantidad: action.payload.cantidad } : i
        ),
      };
    case 'SET_NOTA':
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, nota: action.payload.nota } : i
        ),
      };
    case 'SET_VISTA':
      return { ...state, vista: action.payload };
    case 'HYDRATE':
      return action.payload;
    case 'CONFIRMAR_PEDIDO':
      return {
        ...state,
        items: [],
        pedidos: [
          ...state.pedidos,
          { id: action.payload.pedidoId, items: action.payload.items, estado: 'recibido' },
        ],
        vista: 'seguimiento',
        estadoPedido: 'recibido',
        pedidoId: action.payload.pedidoId,
      };
    case 'SET_ESTADO_PEDIDO':
      return {
        ...state,
        pedidos: state.pedidos.map(pedido =>
          pedido.id === action.payload.pedidoId
            ? { ...pedido, estado: action.payload.estado }
            : pedido,
        ),
        estadoPedido:
          state.pedidoId === action.payload.pedidoId ? action.payload.estado : state.estadoPedido,
      };
    case 'PEDIR_CUENTA':
      return { ...state, cuentaSolicitada: true };
    case 'RESET_SESSION':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVista(value: unknown): value is Vista {
  return value === 'carta' || value === 'carrito' || value === 'seguimiento';
}

function isEstadoPedido(value: unknown): value is EstadoPedido {
  return value === 'recibido' || value === 'preparando' || value === 'listo' || value === 'cerrado';
}

function parseCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.nombre !== 'string' ||
      typeof candidate.precio !== 'number' ||
      !Number.isFinite(candidate.precio) ||
      typeof candidate.cantidad !== 'number' ||
      !Number.isInteger(candidate.cantidad) ||
      candidate.cantidad <= 0 ||
      typeof candidate.nota !== 'string'
    ) {
      return [];
    }

    return [{
      id: candidate.id,
      nombre: candidate.nombre,
      precio: candidate.precio,
      cantidad: candidate.cantidad,
      nota: candidate.nota,
    }];
  });
}

function parsePedidoSessions(value: unknown): PedidoSesion[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !candidate.id.trim()) return [];
    const items = parseCartItems(candidate.items);
    const estado = isEstadoPedido(candidate.estado) ? candidate.estado : 'recibido';
    if (items.length === 0) return [];

    return [{ id: candidate.id, items, estado }];
  });
}

function getSessionKey(token: string) {
  return `mesa_click_session_${token}`;
}

function readStoredSession(raw: string): State | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || (parsed.version !== 1 && parsed.version !== SESSION_VERSION)) return null;

    const pedidoId = typeof parsed.pedidoId === 'string' && parsed.pedidoId.trim() ? parsed.pedidoId : null;
    const estadoPedido = isEstadoPedido(parsed.estadoPedido) ? parsed.estadoPedido : 'recibido';
    const items = parseCartItems(parsed.items);
    const pedidosGuardados = parsePedidoSessions(parsed.pedidos);
    const pedidoItemsAnteriores = parseCartItems(parsed.pedidoItems);
    const pedidos = pedidosGuardados.length > 0
      ? pedidosGuardados
      : pedidoId && pedidoItemsAnteriores.length > 0
        ? [{ id: pedidoId, items: pedidoItemsAnteriores, estado: estadoPedido }]
        : pedidoId && items.length > 0
          ? [{ id: pedidoId, items, estado: estadoPedido }]
          : [];
    const ultimoPedido = pedidos[pedidos.length - 1];
    const vista = isVista(parsed.vista) ? parsed.vista : 'carta';

    return {
      items,
      pedidos,
      // Una sesión con pedidos y sin carrito vuelve al resumen para mostrar el total acumulado.
      vista: pedidos.length > 0 && items.length === 0 ? 'seguimiento' : vista,
      estadoPedido: ultimoPedido?.estado ?? estadoPedido,
      cuentaSolicitada: parsed.cuentaSolicitada === true,
      pedidoId: ultimoPedido?.id ?? pedidoId,
    };
  } catch {
    return null;
  }
}

interface MenuCategoryView {
  id: string;
  nombre: string;
  items: Array<{
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    disponible: boolean;
  }>;
}

export default function MesaPage() {
  const params = useParams();
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [mesa, setMesa] = useState<MesaPublica | null>(null);
  const [menu, setMenu] = useState<MenuCategoryView[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('');
  const [loading, setLoading] = useState(() => Boolean(token));
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const skipNextPersistRef = useRef(false);
  const hydratedTokenRef = useRef<string | null>(null);

  // Hidratar antes de persistir evita sobrescribir una sesión existente con el estado inicial.
  useEffect(() => {
    if (!token) return;

    // Evita que el efecto de persistencia sobrescriba la sesión antes de hidratarla.
    skipNextPersistRef.current = true;
    dispatch({ type: 'RESET_SESSION' });

    try {
      const key = getSessionKey(token);
      const rawSession = window.localStorage.getItem(key);
      if (rawSession) {
        const restored = readStoredSession(rawSession);
        if (restored) {
          dispatch({ type: 'HYDRATE', payload: restored });
        } else {
          window.localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('No se pudo restaurar la sesión de la mesa:', error);
    }

    hydratedTokenRef.current = token;
  }, [token]);

  useEffect(() => {
    if (!token || !mesa || mesa.estado === 'inactiva') return;

    const actualizarEstadoMesa = async () => {
      try {
        const mesaActualizada = await api.obtenerMesaPorQR(token);
        setMesa(mesaActualizada);
      } catch (error) {
        console.warn('No se pudo actualizar el estado de la mesa:', error);
      }
    };

    const intervalId = window.setInterval(() => {
      void actualizarEstadoMesa();
    }, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void actualizarEstadoMesa();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mesa, token]);

  useEffect(() => {
    if (!token || hydratedTokenRef.current !== token) return;
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(
        getSessionKey(token),
        JSON.stringify({ version: SESSION_VERSION, ...state }),
      );
    } catch (error) {
      console.warn('No se pudo guardar la sesión de la mesa:', error);
    }
  }, [state, token]);

  // 1. Cargar datos de mesa y carta (US-42 + branding US-53)
  useEffect(() => {
    let isMounted = true;
    if (!token) {
      return () => {
        isMounted = false;
      };
    }
    const currentToken = token;

    async function cargarDatos() {
      try {
        setLoading(true);
        const mesaApi = await api.obtenerMesaPorQR(currentToken);
        if (!isMounted) return;
        setMesa(mesaApi);

        // Cargar carta de la sucursal
        try {
          const cartaResp = await api.obtenerCartaPublica(mesaApi.sucursal_id);
          if (cartaResp && cartaResp.categorias && cartaResp.categorias.length > 0) {
            const formateadas: MenuCategoryView[] = cartaResp.categorias.map((c: CategoriaPublica) => ({
              id: c.id,
              nombre: c.nombre,
              items: (c.articulos || []).map((a: ArticuloPublico) => ({
                id: a.id,
                nombre: a.nombre,
                descripcion: a.descripcion,
                precio: a.precio,
                disponible: a.activo !== false,
              })),
            }));

            if (isMounted) {
              setMenu(formateadas);
              setCategoriaActiva(formateadas[0]?.id || '');
            }
            return;
          }
        } catch (err) {
          console.error("Error cargando carta pública:", err);
        }

        if (isMounted) {
          setMenu([]);
        }
      } catch (error) {
        console.error("Error cargando mesa por QR:", error);
        if (isMounted) setMesa(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const limpiarSesionMesa = useCallback(() => {
    if (token) {
      try {
        window.localStorage.removeItem(getSessionKey(token));
      } catch (error) {
        console.warn('No se pudo limpiar la sesión de la mesa:', error);
      }
    }
    skipNextPersistRef.current = true;
    dispatch({ type: 'RESET_SESSION' });
  }, [token]);

  useEffect(() => {
    if (mesa?.estado === 'inactiva') {
      limpiarSesionMesa();
    }
  }, [limpiarSesionMesa, mesa?.estado]);

  // 2. Mantener un canal SSE por cada pedido abierto de la mesa.
  useEffect(() => {
    const eventSources = state.pedidos
      .filter(pedido => pedido.estado !== 'cerrado')
      .map(pedido => {
        const eventSource = new EventSource(api.obtenerEventosPedidoUrl(pedido.id));
        eventSource.addEventListener('pedido_actualizado', (event: MessageEvent<string>) => {
          try {
            const payload: unknown = JSON.parse(event.data);
            if (!isRecord(payload) || !isEstadoPedido(payload.estado)) return;
            dispatch({
              type: 'SET_ESTADO_PEDIDO',
              payload: { pedidoId: pedido.id, estado: payload.estado },
            });
          } catch (error) {
            console.warn('Error parseando evento SSE de pedido:', error);
          }
        });

        eventSource.onerror = () => {
          // EventSource reintenta la conexión automáticamente.
        };
        return eventSource;
      });

    return () => {
      eventSources.forEach(eventSource => eventSource.close());
    };
  }, [state.pedidos]);

  useEffect(() => {
    if (state.pedidos.length > 0 && state.pedidos.every(pedido => pedido.estado === 'cerrado')) {
      limpiarSesionMesa();
    }
  }, [limpiarSesionMesa, state.pedidos]);

  // 3. Confirmar y enviar pedido a la API real (US-43)
  const handleConfirmarPedido = async () => {
    if (!mesa || state.items.length === 0) return;
    setEnviandoPedido(true);
    const itemsEnviados = state.items;

    try {
      const resp = await api.crearPedido({
        mesa_id: mesa.id,
        items: itemsEnviados.map(item => ({
          articulo_id: item.id,
          cantidad: item.cantidad,
          notas: item.nota,
        })),
      });

      if (!resp.id) throw new Error('La API no devolvió el identificador del pedido.');
      dispatch({ type: 'CONFIRMAR_PEDIDO', payload: { pedidoId: resp.id, items: itemsEnviados } });
    } catch (err) {
      console.error("No se pudo enviar el pedido a la API:", err);
      try {
        if (token) {
          const mesaActualizada = await api.obtenerMesaPorQR(token);
          if (mesaActualizada.estado === 'inactiva') {
            setMesa(mesaActualizada);
            alert("La mesa fue cerrada y ya no acepta nuevos pedidos.");
            return;
          }
        }
      } catch {
        // Mantener el mensaje genérico si no se puede confirmar el estado de la mesa.
      }
      alert("Error al enviar el pedido. Por favor intenta nuevamente.");
    } finally {
      setEnviandoPedido(false);
    }
  };

  if (loading) {
    return (
      <div className="mesa-background flex min-h-screen flex-col items-center justify-center font-inter">
        <span className="material-symbols-outlined mesa-primary animate-spin text-36">
          progress_activity
        </span>
        <p className="mesa-muted mt-12 text-13">Cargando menú de la mesa...</p>
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="mesa-background flex min-h-screen flex-col items-center justify-center p-24 text-center font-inter">
        <span className="material-symbols-outlined mesa-subtle-text text-48">table_restaurant</span>
        <h2 className="mesa-text mt-12 text-16 font-medium">Mesa no encontrada</h2>
        <p className="mesa-muted mt-4 max-w-xs text-13">
          El código QR escaneado no coincide con ninguna mesa activa.
        </p>
      </div>
    );
  }

  const branding: MesaBranding = mesa;
  const theme = buildMesaTheme(branding);
  const themeStyle = theme.style as CSSProperties;
  const mesaCerrada = mesa.estado === 'inactiva';
  const totalItems = state.items.reduce((n, i) => n + i.cantidad, 0);
  const totalPrecio = state.items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const itemsPedido = state.pedidos.flatMap(pedido => pedido.items);
  const totalItemsPedido = itemsPedido.reduce((n, i) => n + i.cantidad, 0);
  const totalPrecioPedido = itemsPedido.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const estadoPedidoActual = state.pedidos.some(pedido => pedido.estado === 'recibido')
    ? 'recibido'
    : state.pedidos.some(pedido => pedido.estado === 'preparando')
      ? 'preparando'
      : state.pedidos.length > 0
        ? 'listo'
        : state.estadoPedido;
  const todosLosPedidosListos = state.pedidos.length > 0 && state.pedidos.every(pedido => pedido.estado === 'listo');
  const categoriaSeleccionada = menu.find(c => c.id === categoriaActiva) || menu[0];
  const categoriaItems = categoriaSeleccionada?.items ?? [];

  if (mesaCerrada) {
    return (
      <div className="mesa-page min-h-screen font-inter" data-estilo-visual={theme.visualStyle} style={themeStyle}>
        <BrandHeader branding={branding} mesa={mesa.numero} title="Mesa cerrada" />
        <main className="mx-auto flex min-h-[calc(100vh-68px)] max-w-lg items-center px-16 py-24">
          <div className="mesa-surface mesa-border w-full rounded-lg border p-24 text-center shadow-2xs">
            <span className="material-symbols-outlined mesa-primary text-40">check_circle</span>
            <h2 className="mesa-text mt-12 text-18 font-semibold">Esta mesa está cerrada</h2>
            <p className="mesa-muted mt-8 text-13 leading-relaxed">
              Ya no se pueden realizar nuevos pedidos en esta mesa. Consultá al personal del local si necesitás ayuda.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (state.vista === 'seguimiento') {
    return (
      <div className="mesa-page" data-estilo-visual={theme.visualStyle} style={themeStyle}>
        <SeguimientoView
          branding={branding}
          items={itemsPedido.length > 0 ? itemsPedido : state.items}
          estadoPedido={estadoPedidoActual}
          todosListos={todosLosPedidosListos}
          cuentaSolicitada={state.cuentaSolicitada}
          mesa={mesa.numero}
          onAgregarMas={() => dispatch({ type: 'SET_VISTA', payload: 'carta' })}
          onPedirCuenta={() => dispatch({ type: 'PEDIR_CUENTA' })}
        />
      </div>
    );
  }

  if (state.vista === 'carrito') {
    return (
      <div className="mesa-page" data-estilo-visual={theme.visualStyle} style={themeStyle}>
        <CartDrawer
          branding={branding}
          items={state.items}
          totalPrecio={totalPrecio}
          enviando={enviandoPedido}
          onSetCantidad={(id, cantidad) => dispatch({ type: 'SET_CANTIDAD', payload: { id, cantidad } })}
          onSetNota={(id, nota) => dispatch({ type: 'SET_NOTA', payload: { id, nota } })}
          onVolver={() => dispatch({ type: 'SET_VISTA', payload: 'carta' })}
          onConfirmar={handleConfirmarPedido}
        />
      </div>
    );
  }

  return (
    <div className="mesa-page min-h-screen pb-80 font-inter" data-estilo-visual={theme.visualStyle} style={themeStyle}>
      <BrandHeader branding={branding} mesa={mesa.numero} />

      <div className="max-w-lg mx-auto">
        <CategoriaNav
          categorias={menu}
          activa={categoriaActiva}
          onSelect={setCategoriaActiva}
        />
        <div className="space-y-12 px-16 pt-12">
          {categoriaItems.filter(i => i.disponible).map(item => (
            <ItemCard
              key={item.id}
              item={item}
              cantidad={state.items.find(i => i.id === item.id)?.cantidad ?? 0}
              onAgregar={() =>
                dispatch({ type: 'ADD_ITEM', payload: { id: item.id, nombre: item.nombre, precio: item.precio } })
              }
            />
          ))}

          {categoriaItems.length === 0 && (
            <div className="mesa-subtle-text py-40 text-center text-13">
              No hay artículos disponibles en esta categoría.
            </div>
          )}
        </div>
      </div>

      {(totalItems > 0 || state.pedidos.length > 0) && (
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 p-16">
          <div className="pointer-events-auto mx-auto max-w-lg">
            <button
              onClick={() => dispatch({
                type: 'SET_VISTA',
                payload: totalItems > 0 ? 'carrito' : 'seguimiento',
              })}
              disabled={enviandoPedido}
              className="mesa-primary-bg flex min-h-64 w-full items-center rounded-xl px-20 py-12 font-medium shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-10">
                <span className="text-16" aria-hidden="true">🛒</span>
                <div className="min-w-0 text-left leading-tight">
                  <span className="block truncate text-14 font-semibold">
                    {totalItems > 0 ? 'Ver carrito' : 'Ver mi pedido'}
                  </span>
                  <span className="mt-2 block truncate text-11 opacity-80">
                    {totalItems > 0
                      ? `Pedido actual: ${totalItems} ${totalItems === 1 ? 'ítem' : 'ítems'}`
                      : `Total: ${totalItemsPedido} ítems`}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-8 text-right">
                  <span className="text-14 font-mono font-semibold">
                    ${totalItems > 0 ? totalPrecio.toLocaleString() : totalPrecioPedido.toLocaleString()}
                  </span>
                  <span className="text-18" aria-hidden="true">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
