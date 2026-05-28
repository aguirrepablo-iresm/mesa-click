"use client";
import { useReducer, useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export type EstadoPedido = 'recibido' | 'preparando' | 'listo';
type Vista = 'carta' | 'carrito' | 'seguimiento';

type State = {
  items: CartItem[];
  vista: Vista;
  estadoPedido: EstadoPedido;
  cuentaSolicitada: boolean;
};

type Action =
  | { type: 'ADD_ITEM'; payload: { id: string; nombre: string; precio: number } }
  | { type: 'SET_CANTIDAD'; payload: { id: string; cantidad: number } }
  | { type: 'SET_NOTA'; payload: { id: string; nota: string } }
  | { type: 'SET_VISTA'; payload: Vista }
  | { type: 'CONFIRMAR_PEDIDO' }
  | { type: 'AVANZAR_ESTADO' }
  | { type: 'PEDIR_CUENTA' };

const INITIAL_STATE: State = {
  items: [],
  vista: 'carta',
  estadoPedido: 'recibido',
  cuentaSolicitada: false,
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
      return { ...state, vista: 'seguimiento', estadoPedido: 'recibido' };
    case 'AVANZAR_ESTADO': {
      const next: EstadoPedido =
        state.estadoPedido === 'recibido' ? 'preparando' : 'listo';
      return { ...state, estadoPedido: next };
    }
    case 'PEDIR_CUENTA':
      return { ...state, cuentaSolicitada: true };
    default:
      return state;
  }
}

export default function MesaPage() {
  const params = useParams();
  const token = params.token as string;
  const mesa = mockMesas.find(m => m.token === token);

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [categoriaActiva, setCategoriaActiva] = useState<string>(mockMenu[0]?.id ?? '');

  useEffect(() => {
    if (state.vista !== 'seguimiento') return;
    const t1 = setTimeout(() => dispatch({ type: 'AVANZAR_ESTADO' }), 4000);
    const t2 = setTimeout(() => dispatch({ type: 'AVANZAR_ESTADO' }), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.vista]);

  if (!mesa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-15">Mesa no encontrada.</p>
      </div>
    );
  }

  const totalItems = state.items.reduce((n, i) => n + i.cantidad, 0);
  const totalPrecio = state.items.reduce((n, i) => n + i.precio * i.cantidad, 0);
  const categoriaItems = mockMenu.find(c => c.id === categoriaActiva)?.items ?? [];

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
        onConfirmar={() => dispatch({ type: 'CONFIRMAR_PEDIDO' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 px-16 py-12 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <p className="text-11 text-slate-500 font-mono">Mesa {mesa.numero}</p>
          <h1 className="text-16 font-medium text-slate-900">Menú Digital</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        <CategoriaNav
          categorias={mockMenu}
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
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 px-16 py-12 z-20">
          <button
            onClick={() => dispatch({ type: 'SET_VISTA', payload: 'carrito' })}
            className="max-w-lg mx-auto flex items-center justify-between w-full text-white"
          >
            <span className="text-13 font-medium">🛒 {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}</span>
            <span className="text-13 font-medium">${totalPrecio.toLocaleString()} · Ver carrito →</span>
          </button>
        </div>
      )}
    </div>
  );
}
