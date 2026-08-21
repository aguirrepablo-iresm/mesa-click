"use client";
import { useState, useEffect, useRef } from "react";
import { api, PedidoAPI, Sucursal, MesaAPI } from "@/lib/api";
import { mockPedidos, Pedido } from "@/lib/mock/pedidos";

export interface PedidoVista {
  id: string;
  mesa: number;
  mesaId?: string;
  sucursalId?: string;
  timestamp: string;
  estado: 'recibido' | 'preparando' | 'listo';
  items: Array<{ id: string; nombre: string; cantidad: number; precio: number }>;
  cuentaSolicitada?: boolean;
}

const ESTADOS: Array<'recibido' | 'preparando' | 'listo'> = ['recibido', 'preparando', 'listo'];

const ESTADO_LABELS: Record<'recibido' | 'preparando' | 'listo', string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
};

const ESTADO_STYLES: Record<'recibido' | 'preparando' | 'listo', string> = {
  recibido: 'bg-vanilla-cream text-ash-graphite border-ash-graphite',
  preparando: 'bg-ghost-fog text-sage-green border-sage-green',
  listo: 'bg-plain-green text-ash-graphite border-plain-green',
};

function PedidoCard({
  pedido,
  onAvanzar,
  onCerrar,
}: {
  pedido: PedidoVista;
  onAvanzar: (id: string) => void;
  onCerrar: (id: string) => void;
}) {
  const total = pedido.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const esAlerta = pedido.cuentaSolicitada;

  return (
    <div className={`border rounded-lg overflow-hidden bg-canvas-white ${esAlerta ? 'border-alert-red shadow-sm' : 'border-ash-graphite'}`}>
      <div
        className={`flex items-center justify-between px-20 py-10 border-b ${
          esAlerta ? 'bg-red-50 border-alert-red' : 'bg-vanilla-cream border-ash-graphite'
        }`}
      >
        <div className="flex items-center gap-12">
          <span className="text-15 font-medium text-ash-graphite">Mesa {pedido.mesa}</span>
          {esAlerta && (
            <span className="text-12 font-medium text-alert-red flex items-center gap-4">
              ⚠️ Pide la cuenta
            </span>
          )}
          <span className="text-12 font-mono text-sage-green">{pedido.timestamp}</span>
        </div>
        <span className={`px-10 py-3 text-11 font-medium rounded-md border ${ESTADO_STYLES[pedido.estado]}`}>
          {ESTADO_LABELS[pedido.estado]}
        </span>
      </div>

      <div className="px-20 py-12 space-y-6">
        {pedido.items.map(item => (
          <div key={item.id} className="flex items-center justify-between text-13">
            <span className="text-ash-graphite">{item.cantidad}× {item.nombre}</span>
            <span className="font-mono text-sage-green">${(item.precio * item.cantidad).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex items-center justify-between text-13 font-medium border-t border-ghost-fog pt-8 mt-4">
          <span className="text-ash-graphite">Total</span>
          <span className="font-mono text-ash-graphite">${total.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-8 px-20 py-12 border-t border-ghost-fog bg-canvas-white">
        {pedido.estado !== 'listo' && (
          <button
            onClick={() => onAvanzar(pedido.id)}
            className="px-12 py-6 bg-plain-green text-ash-graphite text-12 font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            {pedido.estado === 'recibido' ? '→ Preparando' : '→ Listo'}
          </button>
        )}
        {pedido.estado === 'listo' && (
          <button
            onClick={() => onCerrar(pedido.id)}
            className="px-12 py-6 bg-ash-graphite text-canvas-white text-12 font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Cerrar pedido
          </button>
        )}
      </div>
    </div>
  );
}

export default function RecepcionistaSection() {
  const [pedidos, setPedidos] = useState<PedidoVista[]>([]);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [mesas, setMesas] = useState<Record<string, MesaAPI>>({});
  const [loading, setLoading] = useState(true);
  const [sseConectado, setSseConectado] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const transformarPedidoApi = (p: PedidoAPI, mesasMap: Record<string, MesaAPI>): PedidoVista => {
    const numMesa = mesasMap[p.mesa_id]?.numero || 1;
    const est = (p.estado === 'cerrado' ? 'listo' : p.estado) as 'recibido' | 'preparando' | 'listo';
    return {
      id: p.id,
      mesa: numMesa,
      mesaId: p.mesa_id,
      sucursalId: p.sucursal_id,
      timestamp: p.created_at ? new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estado: est,
      items: (p.items || []).map(i => ({
        id: i.id || i.articulo_id,
        nombre: i.nombre_articulo || 'Artículo',
        cantidad: i.cantidad,
        precio: i.precio_unitario,
      })),
      cuentaSolicitada: false,
    };
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sucursalesList, mesasList] = await Promise.all([
        api.listarSucursales(),
        api.listarMesas(),
      ]);

      const sMap: Record<string, MesaAPI> = {};
      if (mesasList) {
        mesasList.forEach(m => { sMap[m.id] = m; });
        setMesas(sMap);
      }

      if (sucursalesList && sucursalesList.length > 0) {
        const primSuc = sucursalesList[0];
        setSucursal(primSuc);

        try {
          const pedidosApi = await api.listarPedidosActivos(primSuc.id);
          if (pedidosApi && pedidosApi.length >= 0) {
            const formateados = pedidosApi
              .filter(p => p.estado !== 'cerrado')
              .map(p => transformarPedidoApi(p, sMap));
            setPedidos(formateados);
            return;
          }
        } catch {
          // Fallback a mocks
        }
      }

      // Fallback mocks si no hay backend activo
      const fallback: PedidoVista[] = mockPedidos.map(p => ({
        id: p.id,
        mesa: p.mesa,
        timestamp: p.timestamp,
        estado: p.estado,
        items: p.items,
        cuentaSolicitada: p.cuentaSolicitada,
      }));
      setPedidos(fallback);
    } catch (err) {
      console.warn("Error cargando pedidos para recepcionista, usando mocks:", err);
      const fallback: PedidoVista[] = mockPedidos.map(p => ({
        id: p.id,
        mesa: p.mesa,
        timestamp: p.timestamp,
        estado: p.estado,
        items: p.items,
        cuentaSolicitada: p.cuentaSolicitada,
      }));
      setPedidos(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // SSE en tiempo real para recepcionista (US-45)
  useEffect(() => {
    if (!sucursal) return;

    const sseUrl = api.obtenerEventosSucursalUrl(sucursal.id);
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setSseConectado(true);
    };

    es.addEventListener('pedido_creado', (e: MessageEvent) => {
      try {
        const data: PedidoAPI = JSON.parse(e.data);
        if (data && data.id) {
          const nuevo = transformarPedidoApi(data, mesas);
          setPedidos(prev => [nuevo, ...prev.filter(p => p.id !== data.id)]);
        }
      } catch (err) {
        console.warn("Error parseando pedido_creado SSE:", err);
      }
    });

    es.addEventListener('pedido_actualizado', (e: MessageEvent) => {
      try {
        const data: PedidoAPI = JSON.parse(e.data);
        if (data && data.id) {
          if (data.estado === 'cerrado') {
            setPedidos(prev => prev.filter(p => p.id !== data.id));
          } else {
            setPedidos(prev =>
              prev.map(p =>
                p.id === data.id
                  ? { ...p, estado: data.estado as 'recibido' | 'preparando' | 'listo' }
                  : p
              )
            );
          }
        }
      } catch (err) {
        console.warn("Error parseando pedido_actualizado SSE:", err);
      }
    });

    es.onerror = () => {
      setSseConectado(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sucursal, mesas]);

  const avanzarEstado = async (pedidoId: string) => {
    const target = pedidos.find(p => p.id === pedidoId);
    if (!target) return;

    const nextEstado: 'preparando' | 'listo' = target.estado === 'recibido' ? 'preparando' : 'listo';

    try {
      await api.cambiarEstadoPedido(pedidoId, nextEstado);
      setPedidos(prev =>
        prev.map(p => (p.id === pedidoId ? { ...p, estado: nextEstado } : p))
      );
    } catch {
      // Fallback local
      setPedidos(prev =>
        prev.map(p => (p.id === pedidoId ? { ...p, estado: nextEstado } : p))
      );
    }
  };

  const cerrarPedido = async (pedidoId: string) => {
    try {
      await api.cambiarEstadoPedido(pedidoId, 'cerrado');
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch {
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    }
  };

  const conAlerta = pedidos.filter(p => p.cuentaSolicitada);
  const sinAlerta = pedidos.filter(p => !p.cuentaSolicitada);

  return (
    <div className="p-24 md:p-32 space-y-24 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-20 font-medium text-ash-graphite">Panel Recepcionista</h2>
          <p className="text-13 text-sage-green mt-4">
            {pedidos.length} pedidos activos {loading && "(cargando...)"}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <span
            className={`w-8 h-8 rounded-full ${sseConectado ? 'bg-plain-green animate-pulse' : 'bg-sage-green'}`}
          />
          <span className="text-11 font-mono text-sage-green uppercase">
            {sseConectado ? 'En vivo (SSE)' : 'Conectando tiempo real...'}
          </span>
        </div>
      </div>

      {conAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-alert-red uppercase tracking-wider font-semibold">
            ⚠️ Solicitudes de cuenta
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {conAlerta.map(p => (
              <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado} onCerrar={cerrarPedido} />
            ))}
          </div>
        </div>
      )}

      {sinAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Pedidos en curso</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {sinAlerta.map(p => (
              <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado} onCerrar={cerrarPedido} />
            ))}
          </div>
        </div>
      )}

      {pedidos.length === 0 && !loading && (
        <div className="text-center py-40 text-sage-green text-13 bg-vanilla-cream rounded-lg border border-ash-graphite/20">
          No hay pedidos activos en este momento.
        </div>
      )}
    </div>
  );
}
