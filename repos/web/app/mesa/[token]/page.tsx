"use client";
import { useReducer, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { api, CategoriaPublica, ArticuloPublico } from "@/lib/api";
import { mockMesas } from "@/lib/mock/mesas";
import { mockMenu } from "@/lib/mock/menu";
import CategoriaNav from "@/components/menu/CategoriaNav";
import ItemCard from "@/components/menu/ItemCard";
import CartDrawer from "@/components/menu/CartDrawer";
import SeguimientoView from "@/components/menu/SeguimientoView";

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  nota: string;
};

export type EstadoPedido = 'recibido' | 'preparando' | 'listo' | 'cerrado';
type Vista = 'carta' | 'carrito' | 'seguimiento';

type State = {
  items: CartItem[];
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
  | { type: 'CONFIRMAR_PEDIDO'; payload?: { pedidoId?: string } }
  | { type: 'SET_ESTADO_PEDIDO'; payload: EstadoPedido }
  | { type: 'PEDIR_CUENTA' };

const INITIAL_STATE: State = {
  items: [],
  vista: 'carta',
  estadoPedido: 'recibido',
  cuentaSolicitada: false,
  pedidoId: null,
};

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
    case 'CONFIRMAR_PEDIDO':
      return {
        ...state,
        vista: 'seguimiento',
        estadoPedido: 'recibido',
        pedidoId: action.payload?.pedidoId || state.pedidoId,
      };
    case 'SET_ESTADO_PEDIDO':
      return { ...state, estadoPedido: action.payload };
    case 'PEDIR_CUENTA':
      return { ...state, cuentaSolicitada: true };
    default:
      return state;
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
  const token = params.token as string;

  const [mesa, setMesa] = useState<{ id: string; numero: number; sucursal_id?: string } | null>(null);
  const [menu, setMenu] = useState<MenuCategoryView[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Cargar datos de mesa y carta (US-42)
  useEffect(() => {
    let isMounted = true;

    async function cargarDatos() {
      try {
        setLoading(true);
        // Intentar obtener mesa desde API real
        let mesaInfo: { id: string; numero: number; sucursal_id: string } | null = null;
        try {
          const mesaApi = await api.obtenerMesaPorQR(token);
          if (mesaApi) {
            mesaInfo = {
              id: mesaApi.id,
              numero: mesaApi.numero,
              sucursal_id: mesaApi.sucursal_id,
            };
          }
        } catch {
          // Fallback a mocks si la API no encuentra el QR o está en modo local
          const mock = mockMesas.find(m => m.token === token);
          if (mock) {
            mesaInfo = {
              id: mock.id,
              numero: mock.numero,
              sucursal_id: 'default',
            };
          }
        }

        if (!mesaInfo) {
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          setMesa(mesaInfo);
        }

        // Cargar carta de la sucursal
        try {
          const cartaResp = await api.obtenerCartaPublica(mesaInfo.sucursal_id);
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
        } catch {
          // Fallback a mockMenu
        }

        // Fallback a carta mock
        const fallbackMenu: MenuCategoryView[] = mockMenu.map(m => ({
          id: m.id,
          nombre: m.nombre,
          items: m.items.map(i => ({
            id: i.id,
            nombre: i.nombre,
            descripcion: i.descripcion,
            precio: i.precio,
            disponible: i.disponible,
          })),
        }));

        if (isMounted) {
          setMenu(fallbackMenu);
          setCategoriaActiva(fallbackMenu[0]?.id || '');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (token) {
      cargarDatos();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. Conectar SSE para seguimiento en tiempo real (US-44)
  useEffect(() => {
    if (state.vista !== 'seguimiento') {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    if (state.pedidoId) {
      const url = api.obtenerEventosPedidoUrl(state.pedidoId);
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('pedido_actualizado', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.estado) {
            dispatch({ type: 'SET_ESTADO_PEDIDO', payload: data.estado as EstadoPedido });
          }
        } catch (err) {
          console.warn("Error parseando evento SSE de pedido:", err);
        }
      });

      es.onerror = () => {
        // En caso de corte o si es mock, permitir que la conexión intente reconectar
      };

      return () => {
        es.close();
        eventSourceRef.current = null;
      };
    } else {
      // Si fue creado en modo mock sin API, simular avance automático
      const t1 = setTimeout(() => dispatch({ type: 'SET_ESTADO_PEDIDO', payload: 'preparando' }), 4000);
      const t2 = setTimeout(() => dispatch({ type: 'SET_ESTADO_PEDIDO', payload: 'listo' }), 12000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [state.vista, state.pedidoId]);

  // 3. Confirmar y enviar pedido a la API real (US-43)
  const handleConfirmarPedido = async () => {
    if (!mesa) return;
    setEnviandoPedido(true);

    try {
      const resp = await api.crearPedido({
        mesa_id: mesa.id,
        items: state.items.map(i => ({
          articulo_id: i.id,
          cantidad: i.cantidad,
          notas: i.nota,
        })),
      });

      dispatch({
        type: 'CONFIRMAR_PEDIDO',
        payload: { pedidoId: resp?.id },
      });
    } catch (err) {
      console.warn("No se pudo persistir en API real, procediendo con pedido local:", err);
      dispatch({ type: 'CONFIRMAR_PEDIDO' });
    } finally {
      setEnviandoPedido(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-inter">
        <span className="material-symbols-outlined text-36 text-blue-600 animate-spin">
          progress_activity
        </span>
        <p className="text-slate-500 text-13 mt-12">Cargando menú de la mesa...</p>
      </div>
    );
  }

  if (!mesa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-24 text-center font-inter">
        <span className="material-symbols-outlined text-48 text-slate-400">table_restaurant</span>
        <h2 className="text-16 font-medium text-slate-800 mt-12">Mesa no encontrada</h2>
        <p className="text-slate-500 text-13 mt-4 max-w-xs">
          El código QR escaneado no coincide con ninguna mesa activa.
        </p>
      </div>
    );
  }

  const totalItems = state.items.reduce((n, i) => n + i.cantidad, 0);
  const totalPrecio = state.items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const categoriaSeleccionada = menu.find(c => c.id === categoriaActiva) || menu[0];
  const categoriaItems = categoriaSeleccionada?.items ?? [];

  if (state.vista === 'seguimiento') {
    return (
      <SeguimientoView
        items={state.items}
        estadoPedido={state.estadoPedido}
        cuentaSolicitada={state.cuentaSolicitada}
        mesa={mesa.numero}
        onAgregarMas={() => dispatch({ type: 'SET_VISTA', payload: 'carta' })}
        onPedirCuenta={() => dispatch({ type: 'PEDIR_CUENTA' })}
      />
    );
  }

  if (state.vista === 'carrito') {
    return (
      <CartDrawer
        items={state.items}
        totalPrecio={totalPrecio}
        onSetCantidad={(id, cantidad) => dispatch({ type: 'SET_CANTIDAD', payload: { id, cantidad } })}
        onSetNota={(id, nota) => dispatch({ type: 'SET_NOTA', payload: { id, nota } })}
        onVolver={() => dispatch({ type: 'SET_VISTA', payload: 'carta' })}
        onConfirmar={handleConfirmarPedido}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-80 font-inter">
      <header className="bg-white border-b border-slate-200 px-16 py-12 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-11 text-slate-500 font-mono uppercase tracking-wider">Mesa {mesa.numero}</p>
            <h1 className="text-16 font-medium text-slate-900">Menú Digital</h1>
          </div>
          <span className="px-8 py-3 bg-green-50 text-green-700 text-11 font-mono rounded border border-green-200">
            En vivo
          </span>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        <CategoriaNav
          categorias={menu}
          activa={categoriaActiva}
          onSelect={setCategoriaActiva}
        />
        <div className="px-16 space-y-12">
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
            <div className="text-center py-40 text-slate-400 text-13">
              No hay artículos disponibles en esta categoría.
            </div>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-16 z-20 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={() => dispatch({ type: 'SET_VISTA', payload: 'carrito' })}
              disabled={enviandoPedido}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white px-20 py-14 rounded-xl shadow-xl flex items-center justify-between font-medium transition-all"
            >
              <div className="flex items-center gap-8">
                <span className="text-16">🛒</span>
                <span className="text-14 font-semibold">{totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}</span>
              </div>
              <span className="text-14 font-mono font-semibold">${totalPrecio.toLocaleString()} · Ver carrito →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
