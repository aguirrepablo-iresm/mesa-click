"use client";
import { useCallback, useReducer, useState, useEffect, useRef, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { ArticuloPublico, CategoriaPublica, MesaPublica, PedidoAPI, VariantePublica } from "@/lib/api";
import {
  clearComensalIdentity,
  createComensalIdentity,
  getComensalIdentity,
  saveComensalIdentity,
  type ComensalIdentity,
} from "@/lib/comensal";
import ModalNombreComensal from "@/components/comensal/ModalNombreComensal";
import ModalPersonalizacion from "@/components/menu/ModalPersonalizacion";
import CategoriaNav from "@/components/menu/CategoriaNav";
import ItemCard from "@/components/menu/ItemCard";
import CartBottomSheet from "@/components/menu/CartBottomSheet";
import SeguimientoView from "@/components/menu/SeguimientoView";
import BrandHeader, { buildMesaTheme } from "@/components/menu/BrandHeader";
import type { MesaBranding } from "@/components/menu/BrandHeader";

export type CartItem = {
  id: string;
  articuloId: string;
  nombre: string;
  precio: number;
  precioBase?: number;
  cantidad: number;
  nota: string;
  variantes?: VariantePublica[];
  comensalId?: string;
  comensalNombre?: string;
};

export type EstadoPedido = 'recibido' | 'preparando' | 'listo' | 'cerrado';
type Vista = 'carta' | 'seguimiento';

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
  cuentaVersion: number;
  pedidoId: string | null;
};

type Action =
  | {
      type: 'ADD_ITEM';
      payload: {
        id?: string;
        articuloId: string;
        nombre: string;
        precio: number;
        precioBase?: number;
        cantidad?: number;
        nota?: string;
        variantes?: VariantePublica[];
      };
    }
  | { type: 'SET_CANTIDAD'; payload: { id: string; cantidad: number } }
  | { type: 'SET_NOTA'; payload: { id: string; nota: string } }
  | { type: 'SET_VISTA'; payload: Vista }
  | { type: 'HYDRATE'; payload: State }
  | { type: 'CONFIRMAR_PEDIDO'; payload: { pedidoId: string; items: CartItem[] } }
  | { type: 'SET_PEDIDOS'; payload: PedidoSesion[] }
  | { type: 'UPSERT_PEDIDO'; payload: PedidoSesion }
  | { type: 'SET_ESTADO_PEDIDO'; payload: { pedidoId: string; estado: EstadoPedido } }
  | { type: 'SYNC_CUENTA'; payload: { cuentaSolicitada: boolean; cuentaVersion: number } }
  | { type: 'RESET_SESSION' };

const INITIAL_STATE: State = {
  items: [],
  pedidos: [],
  vista: 'carta',
  estadoPedido: 'recibido',
  cuentaSolicitada: false,
  cuentaVersion: 1,
  pedidoId: null,
};

const SESSION_VERSION = 3;

function generarLineKey(articuloId: string, variantes?: VariantePublica[], nota?: string): string {
  const vKeys = (variantes ?? []).map(v => v.id).sort().join('-');
  const n = (nota ?? '').trim();
  return `${articuloId}_${vKeys}_${n}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM': {
      const lineKey = action.payload.id || generarLineKey(action.payload.articuloId, action.payload.variantes, action.payload.nota);
      const exists = state.items.find(i => i.id === lineKey);
      const cantidadToAdd = action.payload.cantidad && action.payload.cantidad > 0 ? action.payload.cantidad : 1;
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === lineKey ? { ...i, cantidad: i.cantidad + cantidadToAdd } : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: lineKey,
            articuloId: action.payload.articuloId,
            nombre: action.payload.nombre,
            precio: action.payload.precio,
            precioBase: action.payload.precioBase ?? action.payload.precio,
            cantidad: cantidadToAdd,
            nota: action.payload.nota ?? '',
            variantes: action.payload.variantes,
          },
        ],
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
          ...state.pedidos.filter(pedido => pedido.id !== action.payload.pedidoId),
          { id: action.payload.pedidoId, items: action.payload.items, estado: 'recibido' },
        ],
        vista: 'seguimiento',
        estadoPedido: 'recibido',
        pedidoId: action.payload.pedidoId,
      };
    case 'SET_PEDIDOS': {
      const ultimoPedido = action.payload[action.payload.length - 1];
      return {
        ...state,
        pedidos: action.payload,
        pedidoId: ultimoPedido?.id ?? null,
        estadoPedido: ultimoPedido?.estado ?? state.estadoPedido,
      };
    }
    case 'UPSERT_PEDIDO':
      return {
        ...state,
        pedidos: [
          ...state.pedidos.filter(pedido => pedido.id !== action.payload.id),
          action.payload,
        ],
        pedidoId: action.payload.id,
        estadoPedido: action.payload.estado,
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
    case 'SYNC_CUENTA': {
      const cuentaCambio = state.cuentaVersion !== action.payload.cuentaVersion;
      const tieneSesionAnterior = state.items.length > 0 || state.pedidos.length > 0 || state.cuentaSolicitada;
      if (cuentaCambio && tieneSesionAnterior) {
        return { ...INITIAL_STATE, cuentaVersion: action.payload.cuentaVersion };
      }
      return {
        ...state,
        cuentaSolicitada: action.payload.cuentaSolicitada,
        cuentaVersion: action.payload.cuentaVersion,
        vista: action.payload.cuentaSolicitada ? 'seguimiento' : state.vista,
      };
    }
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
  return value === 'carta' || value === 'seguimiento';
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

    const articuloId = typeof candidate.articuloId === 'string' && candidate.articuloId.trim()
      ? candidate.articuloId
      : candidate.id;

    const comensalId = typeof candidate.comensalId === 'string' && candidate.comensalId.trim()
      ? candidate.comensalId
      : undefined;
    const comensalNombre = typeof candidate.comensalNombre === 'string' && candidate.comensalNombre.trim()
      ? candidate.comensalNombre.trim()
      : undefined;

    let variantes: VariantePublica[] | undefined;
    if (Array.isArray(candidate.variantes)) {
      variantes = candidate.variantes.flatMap(v => {
        if (!isRecord(v) || typeof v.id !== 'string' || typeof v.nombre !== 'string') return [];
        return [{
          id: v.id,
          articulo_id: typeof v.articulo_id === 'string' ? v.articulo_id : articuloId,
          nombre: v.nombre,
          precio_adicional: typeof v.precio_adicional === 'number' ? v.precio_adicional : 0,
          grupo: typeof v.grupo === 'string' ? v.grupo : undefined,
          seleccion_unica: Boolean(v.seleccion_unica),
          orden: typeof v.orden === 'number' ? v.orden : 0,
        }];
      });
    }

    return [{
      id: candidate.id,
      articuloId,
      nombre: candidate.nombre,
      precio: candidate.precio,
      precioBase: typeof candidate.precioBase === 'number' ? candidate.precioBase : undefined,
      cantidad: candidate.cantidad,
      nota: candidate.nota,
      variantes,
      comensalId,
      comensalNombre,
    }];
  });
}

function pedidoApiToSession(pedido: PedidoAPI): PedidoSesion {
  return {
    id: pedido.id,
    estado: pedido.estado,
    items: (pedido.items ?? []).map(item => ({
      id: item.id || item.articulo_id,
      articuloId: item.articulo_id,
      nombre: item.nombre_articulo?.trim() || 'Producto sin nombre',
      precio: item.precio_unitario,
      cantidad: item.cantidad,
      nota: item.notas?.trim() || '',
      comensalId: item.comensal_id,
      comensalNombre: item.comensal_nombre?.trim() || undefined,
      variantes: item.variantes?.map(v => ({
        id: v.variante_id,
        articulo_id: item.articulo_id,
        nombre: v.nombre,
        precio_adicional: v.precio_adicional,
        seleccion_unica: false,
        orden: 0,
      })),
    })),
  };
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
    if (!isRecord(parsed) || (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== SESSION_VERSION)) return null;

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
    const rawVista = parsed.vista;
    const vista: Vista = rawVista === 'carrito' ? 'carta' : (isVista(rawVista) ? rawVista : 'carta');
    const cuentaVersion = typeof parsed.cuentaVersion === 'number' && Number.isInteger(parsed.cuentaVersion) && parsed.cuentaVersion > 0
      ? parsed.cuentaVersion
      : 1;

    return {
      items,
      pedidos,
      // Una sesión con pedidos y sin carrito vuelve al resumen para mostrar el total acumulado.
      vista: pedidos.length > 0 && items.length === 0 ? 'seguimiento' : vista,
      estadoPedido: ultimoPedido?.estado ?? estadoPedido,
      cuentaSolicitada: parsed.cuentaSolicitada === true,
      cuentaVersion,
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
    variantes?: VariantePublica[];
  }>;
}

export default function MesaPage() {
  const params = useParams();
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  const [mesa, setMesa] = useState<MesaPublica | null>(null);
  const [menu, setMenu] = useState<MenuCategoryView[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [itemParaPersonalizar, setItemParaPersonalizar] = useState<{
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    variantes?: VariantePublica[];
  } | null>(null);
  const [loading, setLoading] = useState(() => Boolean(token));
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  const [comensal, setComensal] = useState<ComensalIdentity | null>(null);
  const [identidadLista, setIdentidadLista] = useState(false);
  const [editandoComensal, setEditandoComensal] = useState(false);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const skipNextPersistRef = useRef(false);
  const hydratedTokenRef = useRef<string | null>(null);

  const isManualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef<number | null>(null);
  const intersectingCategoriesRef = useRef<Map<string, boolean>>(new Map());

  const scrollNavButtonIntoView = useCallback((catId: string) => {
    const navBtn = document.getElementById(`nav-cat-${catId}`);
    if (!navBtn) return;
    const parent = navBtn.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      const btnRect = navBtn.getBoundingClientRect();
      const isOutside = btnRect.left < parentRect.left + 24 || btnRect.right > parentRect.right - 24;
      if (isOutside) {
        navBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, []);

  const handleSeleccionarCategoria = useCallback((catId: string) => {
    setCategoriaActiva(catId);
    isManualScrollRef.current = true;
    if (manualScrollTimeoutRef.current) {
      window.clearTimeout(manualScrollTimeoutRef.current);
    }

    const target = document.getElementById(`categoria-${catId}`);
    if (target) {
      const STICKY_HEADER_OFFSET = 136; // BrandHeader (68px) + CategoriaNav (68px)
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - STICKY_HEADER_OFFSET;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }

    scrollNavButtonIntoView(catId);

    manualScrollTimeoutRef.current = window.setTimeout(() => {
      isManualScrollRef.current = false;
    }, 900);
  }, [scrollNavButtonIntoView]);

  // Si el usuario toca la pantalla o hace scroll manual mientras se desplaza suavemente,
  // cancelamos el bloqueo para que la barra sticky responda a su gesto de inmediato.
  useEffect(() => {
    const handleUserInterrupt = () => {
      if (isManualScrollRef.current) {
        isManualScrollRef.current = false;
        if (manualScrollTimeoutRef.current) {
          window.clearTimeout(manualScrollTimeoutRef.current);
          manualScrollTimeoutRef.current = null;
        }
      }
    };

    window.addEventListener('touchstart', handleUserInterrupt, { passive: true });
    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleUserInterrupt);
      window.removeEventListener('wheel', handleUserInterrupt);
      if (manualScrollTimeoutRef.current) {
        window.clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  // Scroll-spy: resalta automáticamente la categoría visible según el scroll vertical
  useEffect(() => {
    if (menu.length === 0) return;

    const STICKY_HEADER_OFFSET = 136;

    const updateActiveCategory = () => {
      if (isManualScrollRef.current || menu.length === 0) return;

      // 1. Al inicio de la página, fijar primera categoría
      if (window.scrollY < 60) {
        const firstCatId = menu[0].id;
        setCategoriaActiva(current => {
          if (current !== firstCatId) {
            scrollNavButtonIntoView(firstCatId);
            return firstCatId;
          }
          return current;
        });
        return;
      }

      // 2. Al llegar al final de la página, fijar última categoría
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
      if (isAtBottom) {
        const lastCatId = menu[menu.length - 1].id;
        setCategoriaActiva(current => {
          if (current !== lastCatId) {
            scrollNavButtonIntoView(lastCatId);
            return lastCatId;
          }
          return current;
        });
        return;
      }

      // 3. Buscar la categoría que intersecta y cuya sección cubre la línea de cabecera
      let candidateId = '';
      for (const cat of menu) {
        const el = document.getElementById(`categoria-${cat.id}`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= STICKY_HEADER_OFFSET + 40 && rect.bottom > STICKY_HEADER_OFFSET) {
          candidateId = cat.id;
          break;
        }
      }

      // Fallback a categorías con intersección activa
      if (!candidateId) {
        for (const cat of menu) {
          if (intersectingCategoriesRef.current.get(cat.id)) {
            candidateId = cat.id;
            break;
          }
        }
      }

      if (candidateId) {
        setCategoriaActiva(current => {
          if (current !== candidateId) {
            scrollNavButtonIntoView(candidateId);
            return candidateId;
          }
          return current;
        });
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const catId = entry.target.id.replace('categoria-', '');
          intersectingCategoriesRef.current.set(catId, entry.isIntersecting);
        }
        updateActiveCategory();
      },
      {
        rootMargin: '-136px 0px -40% 0px',
        threshold: [0, 0.2, 0.5],
      }
    );

    menu.forEach(cat => {
      const el = document.getElementById(`categoria-${cat.id}`);
      if (el) observer.observe(el);
    });

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveCategory();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menu, scrollNavButtonIntoView]);

  const sincronizarPedidosMesa = useCallback(async () => {
    if (!token) return;
    try {
      const pedidosApi = await api.listarPedidosMesa(token);
      dispatch({
        type: 'SET_PEDIDOS',
        payload: (pedidosApi ?? []).map(pedidoApiToSession),
      });
    } catch (error) {
      console.warn('No se pudo sincronizar la cuenta de la mesa:', error);
    }
  }, [token]);
  const mesaId = mesa?.id;
  const mesaEstado = mesa?.estado;

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
    if (!token || !mesaId || mesaEstado === 'inactiva') return;

    const actualizarEstadoMesa = async () => {
      try {
        const mesaActualizada = await api.obtenerMesaPorQR(token);
        setMesa(mesaActualizada);
        const identidad = mesaActualizada.estado === 'inactiva'
          ? null
          : getComensalIdentity(mesaActualizada.id, mesaActualizada.cuenta_version);
        if (mesaActualizada.estado === 'inactiva') {
          clearComensalIdentity(mesaActualizada.id);
        }
        setComensal(identidad);
        if (!identidad) setEditandoComensal(false);
        setIdentidadLista(true);
        dispatch({
          type: 'SYNC_CUENTA',
          payload: {
            cuentaSolicitada: mesaActualizada.cuenta_solicitada,
            cuentaVersion: mesaActualizada.cuenta_version,
          },
        });

        await sincronizarPedidosMesa();
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
  }, [mesaEstado, mesaId, sincronizarPedidosMesa, token]);

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
        const identidad = mesaApi.estado === 'inactiva'
          ? null
          : getComensalIdentity(mesaApi.id, mesaApi.cuenta_version);
        if (mesaApi.estado === 'inactiva') {
          clearComensalIdentity(mesaApi.id);
        }
        setComensal(identidad);
        setEditandoComensal(false);
        setIdentidadLista(true);
        dispatch({
          type: 'SYNC_CUENTA',
          payload: {
            cuentaSolicitada: mesaApi.cuenta_solicitada,
            cuentaVersion: mesaApi.cuenta_version,
          },
        });

        await sincronizarPedidosMesa();

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
                variantes: a.variantes,
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
  }, [sincronizarPedidosMesa, token]);

  // 2. Un único canal SSE compartido permite ver los pedidos de toda la mesa.
  useEffect(() => {
    if (!mesaId || !token) return;

    const eventSource = new EventSource(api.obtenerEventosMesaUrl(mesaId));
    eventSource.onopen = () => {
      // SSE no conserva historial: al conectar o reconectar recuperamos el snapshot actual.
      void sincronizarPedidosMesa();
    };

    eventSource.addEventListener('pedido_creado', (event: MessageEvent<string>) => {
      try {
        const payload: unknown = JSON.parse(event.data);
        if (!isRecord(payload) || typeof payload.id !== 'string' || !isEstadoPedido(payload.estado)) return;
        dispatch({ type: 'UPSERT_PEDIDO', payload: pedidoApiToSession(payload as unknown as PedidoAPI) });
      } catch (error) {
        console.warn('Error parseando pedido_creado de mesa:', error);
      }
    });

    eventSource.addEventListener('pedido_actualizado', (event: MessageEvent<string>) => {
      try {
        const payload: unknown = JSON.parse(event.data);
        if (!isRecord(payload) || typeof payload.id !== 'string' || !isEstadoPedido(payload.estado)) return;
        dispatch({
          type: 'SET_ESTADO_PEDIDO',
          payload: { pedidoId: payload.id, estado: payload.estado },
        });
      } catch (error) {
        console.warn('Error parseando pedido_actualizado de mesa:', error);
      }
    });

    const sincronizarCuentaDesdeEvento = (event: MessageEvent<string>) => {
      try {
        const payload: unknown = JSON.parse(event.data);
        if (
          !isRecord(payload)
          || typeof payload.cuenta_solicitada !== 'boolean'
          || typeof payload.cuenta_version !== 'number'
        ) return;

        setMesa(actual => actual ? {
          ...actual,
          cuenta_solicitada: payload.cuenta_solicitada as boolean,
          cuenta_version: payload.cuenta_version as number,
        } : actual);
        if (mesaId) {
          const identidad = getComensalIdentity(mesaId, payload.cuenta_version);
          setComensal(identidad);
          setEditandoComensal(false);
          setIdentidadLista(true);
        }
        dispatch({
          type: 'SYNC_CUENTA',
          payload: {
            cuentaSolicitada: payload.cuenta_solicitada,
            cuentaVersion: payload.cuenta_version,
          },
        });
      } catch (error) {
        console.warn('Error parseando evento de cuenta de mesa:', error);
      }
    };

    eventSource.addEventListener('cuenta_solicitada', sincronizarCuentaDesdeEvento);
    eventSource.addEventListener('cuenta_cerrada', sincronizarCuentaDesdeEvento);
    eventSource.onerror = () => {
      // EventSource reintenta automáticamente y onopen recupera el snapshot.
    };

    return () => {
      eventSource.close();
    };
  }, [mesaId, sincronizarPedidosMesa, token]);

  const handleIntentarAgregarItem = (item: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    variantes?: VariantePublica[];
  }) => {
    if (item.variantes && item.variantes.length > 0) {
      setItemParaPersonalizar(item);
    } else {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          articuloId: item.id,
          nombre: item.nombre,
          precio: item.precio,
          precioBase: item.precio,
        },
      });
    }
  };

  const handleConfirmarPersonalizacion = (
    cantidad: number,
    variantesSeleccionadas: VariantePublica[],
    nota: string,
  ) => {
    if (!itemParaPersonalizar) return;
    const precioBase = itemParaPersonalizar.precio;
    const recargos = variantesSeleccionadas.reduce((acc, v) => acc + (v.precio_adicional || 0), 0);
    const precioUnitario = precioBase + recargos;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        articuloId: itemParaPersonalizar.id,
        nombre: itemParaPersonalizar.nombre,
        precio: precioUnitario,
        precioBase,
        cantidad,
        nota,
        variantes: variantesSeleccionadas,
      },
    });
    setItemParaPersonalizar(null);
  };

  // 3. Confirmar y enviar pedido a la API real (US-43)
  const handleConfirmarPedido = async () => {
    if (!mesa || state.items.length === 0 || state.cuentaSolicitada) return;
    if (!comensal) {
      setEditandoComensal(false);
      return;
    }
    setEnviandoPedido(true);
    const itemsEnviados = state.items.map(item => ({
      ...item,
      comensalId: comensal.id,
      comensalNombre: comensal.nombre,
    }));

    try {
      const resp = await api.crearPedido({
        mesa_id: mesa.id,
        items: itemsEnviados.map(item => ({
          articulo_id: item.articuloId,
          cantidad: item.cantidad,
          notas: item.nota,
          comensal_id: comensal.id,
          comensal_nombre: comensal.nombre,
          variantes: item.variantes?.map(v => v.id) ?? [],
        })),
      });

      if (!resp.id) throw new Error('La API no devolvió el identificador del pedido.');
      dispatch({ type: 'CONFIRMAR_PEDIDO', payload: { pedidoId: resp.id, items: itemsEnviados } });
      setCarritoAbierto(false);
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

  const handlePedirCuenta = async () => {
    if (!token || !mesa || state.cuentaSolicitada) return;

    try {
      const mesaActualizada = await api.solicitarCuenta(token);
      setMesa(mesaActualizada);
      dispatch({
        type: 'SYNC_CUENTA',
        payload: {
          cuentaSolicitada: mesaActualizada.cuenta_solicitada,
          cuentaVersion: mesaActualizada.cuenta_version,
        },
      });
    } catch (error) {
      console.error('No se pudo solicitar la cuenta:', error);
      alert('No se pudo solicitar la cuenta. Por favor intenta nuevamente.');
      throw error;
    }
  };

  const handleGuardarComensal = (nombre: string) => {
    if (!mesa || state.cuentaSolicitada) return;
    const identidad = comensal
      ? { ...comensal, nombre: nombre.trim(), cuentaVersion: mesa.cuenta_version }
      : createComensalIdentity(nombre, mesa.cuenta_version);
    saveComensalIdentity(identidad, mesa.id);
    setComensal(identidad);
    setEditandoComensal(false);
    setIdentidadLista(true);
  };

  const handleContinuarSinAlias = () => {
    if (!mesa || state.cuentaSolicitada) return;
    const identidad = createComensalIdentity("", mesa.cuenta_version);
    saveComensalIdentity(identidad, mesa.id);
    setComensal(identidad);
    setEditandoComensal(false);
    setIdentidadLista(true);
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
  const todosLosPedidosListos = state.pedidos.length > 0
    && state.pedidos.every(pedido => pedido.estado === 'listo' || pedido.estado === 'cerrado');
  const modalNombreComensal = identidadLista && !state.cuentaSolicitada && (!comensal || editandoComensal) ? (
    <ModalNombreComensal
      nombreInicial={comensal?.nombre}
      editando={editandoComensal && Boolean(comensal)}
      onConfirmar={handleGuardarComensal}
      onCancelar={comensal ? () => setEditandoComensal(false) : undefined}
      onContinuarSinAlias={!comensal ? handleContinuarSinAlias : undefined}
    />
  ) : null;

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
          comensalId={comensal?.id}
          comensalNombre={comensal?.nombre}
          onCambiarComensal={state.cuentaSolicitada ? undefined : () => setEditandoComensal(true)}
          onAgregarMas={() => dispatch({ type: 'SET_VISTA', payload: 'carta' })}
          onPedirCuenta={handlePedirCuenta}
        />
        {modalNombreComensal}
      </div>
    );
  }

  return (
    <div className="mesa-page min-h-screen pb-80 font-inter" data-estilo-visual={theme.visualStyle} style={themeStyle}>
      <BrandHeader
        branding={branding}
        mesa={mesa.numero}
        comensalNombre={comensal?.nombre}
        onCambiarComensal={state.cuentaSolicitada ? undefined : () => setEditandoComensal(true)}
      />

      <div className="max-w-lg mx-auto">
        <CategoriaNav
          categorias={menu}
          activa={categoriaActiva || menu[0]?.id || ''}
          onSelect={handleSeleccionarCategoria}
        />
        <div className="space-y-28 px-16 pt-16 pb-40">
          {menu.map(cat => {
            const itemsDisponibles = cat.items.filter(i => i.disponible);
            return (
              <section
                key={cat.id}
                id={`categoria-${cat.id}`}
                className="scroll-mt-[140px] space-y-12"
              >
                <div className="border-b mesa-border pb-6">
                  <h2 className="mesa-text text-16 font-semibold tracking-tight">{cat.nombre}</h2>
                </div>
                <div className="space-y-12">
                  {itemsDisponibles.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      cantidad={state.items.filter(i => i.articuloId === item.id).reduce((sum, i) => sum + i.cantidad, 0)}
                      onAgregar={() => handleIntentarAgregarItem(item)}
                    />
                  ))}
                  {itemsDisponibles.length === 0 && (
                    <div className="mesa-subtle-text py-16 text-center text-12">
                      No hay artículos disponibles en esta categoría.
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {menu.length === 0 && (
            <div className="mesa-subtle-text py-40 text-center text-13">
              No hay categorías cargadas en la carta.
            </div>
          )}
        </div>
      </div>

      {(totalItems > 0 || state.pedidos.length > 0) && (
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 p-16">
          <div className="pointer-events-auto mx-auto max-w-lg">
            <button
              onClick={() => {
                if (totalItems > 0) {
                  setCarritoAbierto(true);
                } else {
                  dispatch({ type: 'SET_VISTA', payload: 'seguimiento' });
                }
              }}
              disabled={enviandoPedido || state.cuentaSolicitada}
              className="mesa-primary-bg flex min-h-64 w-full items-center rounded-xl px-20 py-12 font-medium shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-10">
                <span className="text-16" aria-hidden="true">🛒</span>
                <div className="min-w-0 text-left leading-tight">
                  <span className="block truncate text-14 font-semibold">
                    {totalItems > 0 ? 'Ver carrito' : 'Ver pedido de la mesa'}
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

      <CartBottomSheet
        branding={branding}
        items={state.items}
        totalPrecio={totalPrecio}
        enviando={enviandoPedido}
        isOpen={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        onSetCantidad={(id, cantidad) => dispatch({ type: 'SET_CANTIDAD', payload: { id, cantidad } })}
        onSetNota={(id, nota) => dispatch({ type: 'SET_NOTA', payload: { id, nota } })}
        onConfirmar={handleConfirmarPedido}
      />

      {itemParaPersonalizar && (
        <ModalPersonalizacion
          key={itemParaPersonalizar.id}
          articulo={itemParaPersonalizar}
          isOpen={Boolean(itemParaPersonalizar)}
          onClose={() => setItemParaPersonalizar(null)}
          onConfirmar={handleConfirmarPersonalizacion}
        />
      )}

      {modalNombreComensal}
    </div>
  );
}
