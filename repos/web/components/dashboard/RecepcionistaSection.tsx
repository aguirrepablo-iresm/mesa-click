"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { api, PedidoAPI, Sucursal, MesaAPI } from "@/lib/api";

export interface PedidoVista {
  id: string;
  mesa: number;
  mesaId?: string;
  sucursalId?: string;
  timestamp: string;
  estado: 'recibido' | 'preparando' | 'listo';
  items: Array<{ id: string; nombre: string; cantidad: number; precio: number; nota?: string }>;
  cuentaSolicitada?: boolean;
}

interface MesaGrupo {
  key: string;
  mesa: number;
  mesaId?: string;
  pedidos: PedidoVista[];
  cuentaSolicitada: boolean;
}

const ESTADO_LABELS: Record<'recibido' | 'preparando' | 'listo', string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
};

const ESTADO_STYLES: Record<'recibido' | 'preparando' | 'listo', string> = {
  recibido: 'bg-vanilla-cream text-ash-graphite border-ash-graphite',
  preparando: 'bg-ghost-fog text-sage-green border-sage-green',
  listo: 'bg-success text-ash-graphite border-success',
};

function calcularEstadoMesa(pedidos: PedidoVista[]): PedidoVista['estado'] {
  if (pedidos.length > 0 && pedidos.every(pedido => pedido.estado === 'listo')) {
    return 'listo';
  }
  if (pedidos.some(pedido => pedido.estado === 'preparando')) {
    return 'preparando';
  }
  return 'recibido';
}

function PedidoDetalle({
  pedido,
  onAvanzar,
  onCerrar,
}: {
  pedido: PedidoVista;
  onAvanzar: (id: string) => void;
  onCerrar: (id: string) => void;
}) {
  const total = pedido.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return (
    <div className="border-t border-ghost-fog px-16 py-12 sm:px-20">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <span className="text-13 font-semibold text-ash-graphite">Pedido</span>
          <span className="text-11 font-mono text-sage-green">{pedido.timestamp}</span>
        </div>
        <span className={`shrink-0 rounded-md border px-10 py-3 text-11 font-medium ${ESTADO_STYLES[pedido.estado]}`}>
          {ESTADO_LABELS[pedido.estado]}
        </span>
      </div>

      <div className="mt-12 space-y-8">
        {pedido.items.map(item => (
          <div key={item.id} className="flex items-start justify-between gap-12 text-13">
            <div className="min-w-0">
              <p className="text-ash-graphite">{item.cantidad}× {item.nombre}</p>
              {item.nota && <p className="mt-2 text-11 text-sage-green">Nota: {item.nota}</p>}
            </div>
            <span className="shrink-0 font-mono text-sage-green">${(item.precio * item.cantidad).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-ghost-fog pt-8 text-13 font-medium">
        <span className="font-semibold text-ash-graphite">Total del pedido</span>
        <span className="font-mono font-semibold text-ash-graphite">${total.toLocaleString()}</span>
      </div>

      <div className="mt-12 flex items-center gap-8">
        {pedido.estado !== 'listo' && (
          <button
            onClick={() => onAvanzar(pedido.id)}
            className="flex min-h-44 flex-1 items-center justify-center rounded-md bg-plain-green px-16 py-8 text-center text-12 font-semibold text-canvas-white transition-all hover:opacity-90 active:scale-[0.98] sm:flex-initial"
          >
            {pedido.estado === 'recibido' ? '→ Preparando' : '→ Listo'}
          </button>
        )}
        {pedido.estado === 'listo' && (
          <button
            onClick={() => onCerrar(pedido.id)}
            className="flex min-h-44 flex-1 items-center justify-center rounded-md bg-ash-graphite px-16 py-8 text-center text-12 font-semibold text-canvas-white transition-all hover:opacity-90 active:scale-[0.98] sm:flex-initial"
          >
            Cerrar pedido
          </button>
        )}
      </div>
    </div>
  );
}

function MesaCard({
  grupo,
  onOpen,
}: {
  grupo: MesaGrupo;
  onOpen: () => void;
}) {
  const total = grupo.pedidos.reduce(
    (sum, pedido) => sum + pedido.items.reduce((pedidoTotal, item) => pedidoTotal + item.precio * item.cantidad, 0),
    0,
  );
  const totalItems = grupo.pedidos.reduce(
    (sum, pedido) => sum + pedido.items.reduce((pedidoItems, item) => pedidoItems + item.cantidad, 0),
    0,
  );
  const estadoMesa = calcularEstadoMesa(grupo.pedidos);
  const cuentaSolicitada = grupo.cuentaSolicitada;

  return (
    <div className={`overflow-hidden rounded-lg border bg-canvas-white ${cuentaSolicitada ? 'border-alert-red shadow-sm' : 'border-ash-graphite'}`}>
      <div className={`flex items-center justify-between gap-12 border-b px-16 py-10 sm:px-20 ${cuentaSolicitada ? 'border-alert-red bg-red-50' : 'border-ash-graphite bg-vanilla-cream'}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-8 sm:gap-12">
          <span className="text-15 font-medium text-ash-graphite">Mesa {grupo.mesa}</span>
          <span className="text-11 font-mono text-sage-green">
            {grupo.pedidos.length} {grupo.pedidos.length === 1 ? 'pedido' : 'pedidos'} activos
          </span>
          {cuentaSolicitada && (
            <span className="flex items-center gap-4 rounded bg-red-100/60 px-6 py-1 text-11 font-medium text-alert-red">
              Cuenta solicitada
            </span>
          )}
        </div>
        <span className={`shrink-0 rounded-md border px-10 py-3 text-11 font-medium ${ESTADO_STYLES[estadoMesa]}`}>
          {ESTADO_LABELS[estadoMesa]}
        </span>
      </div>

      <div className="space-y-12 px-16 py-14 sm:px-20">
        <div className="flex items-end justify-between gap-12">
          <div>
            <p className="text-13 font-medium text-ash-graphite">Resumen de la mesa</p>
            <p className="mt-2 text-11 text-sage-green">{totalItems} {totalItems === 1 ? 'ítem solicitado' : 'ítems solicitados'}</p>
          </div>
          <span className="shrink-0 font-mono text-15 font-semibold text-ash-graphite">${total.toLocaleString()}</span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-44 w-full items-center justify-center gap-6 rounded-md border border-ash-graphite px-12 py-8 text-12 font-semibold text-ash-graphite transition-colors hover:bg-ghost-fog"
        >
          <span>Ver más</span>
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </div>
  );
}

function MesaDetalleModal({
  grupo,
  onClose,
  onAvanzar,
  onCerrar,
  onTodoListo,
  onCerrarCuenta,
  mesaAccionEnCurso,
}: {
  grupo: MesaGrupo;
  onClose: () => void;
  onAvanzar: (id: string) => void;
  onCerrar: (id: string) => void;
  onTodoListo: (grupo: MesaGrupo) => void;
  onCerrarCuenta: (grupo: MesaGrupo) => void;
  mesaAccionEnCurso: 'todo-listo' | 'cerrar-cuenta' | null;
}) {
  const total = grupo.pedidos.reduce(
    (sum, pedido) => sum + pedido.items.reduce((pedidoTotal, item) => pedidoTotal + item.precio * item.cantidad, 0),
    0,
  );
  const totalItems = grupo.pedidos.reduce(
    (sum, pedido) => sum + pedido.items.reduce((pedidoItems, item) => pedidoItems + item.cantidad, 0),
    0,
  );
  const estadoMesa = calcularEstadoMesa(grupo.pedidos);
  const todosListos = estadoMesa === 'listo';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-12 sm:items-center sm:p-24"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[calc(100vh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-ash-graphite bg-canvas-white shadow-2xl sm:max-h-[calc(100vh-48px)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`mesa-detalle-${grupo.key}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-12 border-b border-ash-graphite bg-vanilla-cream px-16 py-12 sm:px-20">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-8 sm:gap-12">
              <h2 id={`mesa-detalle-${grupo.key}`} className="text-16 font-medium text-ash-graphite">
                Mesa {grupo.mesa}
              </h2>
              <span className={`shrink-0 rounded-md border px-10 py-3 text-11 font-medium ${ESTADO_STYLES[estadoMesa]}`}>
                {ESTADO_LABELS[estadoMesa]}
              </span>
            </div>
            <p className="mt-2 text-11 font-mono text-sage-green">
              {grupo.pedidos.length} {grupo.pedidos.length === 1 ? 'pedido activo' : 'pedidos activos'} · {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Cerrar detalle de Mesa ${grupo.mesa}`}
            className="flex h-44 w-44 shrink-0 items-center justify-center rounded-md border border-ash-graphite text-20 leading-none text-ash-graphite transition-colors hover:bg-ghost-fog"
          >
            ×
          </button>
        </header>

        <div className="flex flex-wrap gap-8 border-b border-ghost-fog bg-canvas-white px-16 py-12 sm:px-20">
          <button
            type="button"
            onClick={() => onTodoListo(grupo)}
            disabled={todosListos || mesaAccionEnCurso !== null}
            className="min-h-44 flex-1 rounded-md bg-success px-12 py-8 text-12 font-semibold text-ash-graphite transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
          >
            {mesaAccionEnCurso === 'todo-listo' ? 'Actualizando...' : 'Todo listo'}
          </button>
          <button
            type="button"
            onClick={() => onCerrarCuenta(grupo)}
            disabled={mesaAccionEnCurso !== null}
            className="min-h-44 flex-1 rounded-md bg-alert-red px-12 py-8 text-12 font-semibold text-canvas-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
          >
            {mesaAccionEnCurso === 'cerrar-cuenta' ? 'Cerrando...' : 'Cerrar cuenta'}
          </button>
          {grupo.cuentaSolicitada && (
            <span className="flex min-h-44 items-center justify-center rounded-md border border-alert-red bg-red-50 px-12 py-8 text-12 font-semibold text-alert-red sm:ml-auto">
              Cuenta solicitada
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between gap-12 border-b border-ghost-fog px-16 py-14 sm:px-20">
            <span className="text-13 font-medium text-ash-graphite">Total acumulado de la mesa</span>
            <span className="shrink-0 font-mono text-16 font-semibold text-ash-graphite">${total.toLocaleString()}</span>
          </div>
          {grupo.pedidos.map(pedido => (
            <PedidoDetalle key={pedido.id} pedido={pedido} onAvanzar={onAvanzar} onCerrar={onCerrar} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function RecepcionistaSection() {
  const [pedidos, setPedidos] = useState<PedidoVista[]>([]);
  const [sucursal, setSucursal] = useState<Sucursal | null>(null);
  const [mesas, setMesas] = useState<Record<string, MesaAPI>>({});
  const [loading, setLoading] = useState(true);
  const [sseConectado, setSseConectado] = useState(false);
  const [mesaAccionEnCurso, setMesaAccionEnCurso] = useState<'todo-listo' | 'cerrar-cuenta' | null>(null);
  const [mesaDetalleKey, setMesaDetalleKey] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const transformarPedidoApi = useCallback((p: PedidoAPI, mesasMap: Record<string, MesaAPI>): PedidoVista => {
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
        nombre: i.nombre_articulo?.trim() || 'Producto sin nombre',
        cantidad: i.cantidad,
        precio: i.precio_unitario,
        nota: i.notas?.trim() || '',
      })),
      cuentaSolicitada: Boolean(mesasMap[p.mesa_id]?.cuenta_solicitada),
    };
  }, []);

  const cargarDatos = useCallback(async () => {
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
        } catch (err) {
          console.error("Error al obtener pedidos activos:", err);
        }
      }

      setPedidos([]);
    } catch (err) {
      console.error("Error cargando pedidos para recepcionista:", err);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [transformarPedidoApi]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void cargarDatos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargarDatos]);

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

    es.addEventListener('cuenta_solicitada', (e: MessageEvent) => {
      try {
        const data: MesaAPI = JSON.parse(e.data);
        if (!data?.id) return;
        setMesas(prev => ({
          ...prev,
          [data.id]: { ...prev[data.id], ...data, cuenta_solicitada: true },
        }));
        setPedidos(prev => prev.map(pedido =>
          pedido.mesaId === data.id ? { ...pedido, cuentaSolicitada: true } : pedido,
        ));
      } catch (err) {
        console.warn("Error parseando solicitud de cuenta SSE:", err);
      }
    });

    es.addEventListener('cuenta_cerrada', (e: MessageEvent) => {
      try {
        const data: MesaAPI = JSON.parse(e.data);
        if (!data?.id) return;
        setMesas(prev => ({
          ...prev,
          [data.id]: { ...prev[data.id], ...data, cuenta_solicitada: false },
        }));
        setPedidos(prev => prev.filter(pedido => pedido.mesaId !== data.id));
        setMesaDetalleKey(current => current === data.id ? null : current);
      } catch (err) {
        console.warn("Error parseando cierre de cuenta SSE:", err);
      }
    });

    es.onerror = () => {
      setSseConectado(false);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [sucursal, mesas, transformarPedidoApi]);

  const avanzarEstado = async (pedidoId: string) => {
    const target = pedidos.find(p => p.id === pedidoId);
    if (!target) return;

    const nextEstado: 'preparando' | 'listo' = target.estado === 'recibido' ? 'preparando' : 'listo';

    try {
      await api.cambiarEstadoPedido(pedidoId, nextEstado);
      setPedidos(prev =>
        prev.map(p => (p.id === pedidoId ? { ...p, estado: nextEstado } : p))
      );
    } catch (err) {
      console.error("Error al cambiar estado del pedido:", err);
    }
  };

  const cerrarPedido = async (pedidoId: string) => {
    try {
      await api.cambiarEstadoPedido(pedidoId, 'cerrado');
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch (err) {
      console.error("Error al cerrar pedido:", err);
    }
  };

  const marcarMesaTodoLista = async (grupo: MesaGrupo) => {
    const pendientes = grupo.pedidos.filter(pedido => pedido.estado !== 'listo');
    if (pendientes.length === 0) return;
    if (!window.confirm(`¿Seguro que deseas marcar como listos los ${pendientes.length} pedidos pendientes de la Mesa ${grupo.mesa}?`)) return;

    setMesaAccionEnCurso('todo-listo');
    try {
      const resultados = await Promise.allSettled(
        pendientes.map(pedido => api.cambiarEstadoPedido(pedido.id, 'listo')),
      );
      const pedidosActualizados = new Set(
        pendientes.filter((_, index) => resultados[index].status === 'fulfilled').map(pedido => pedido.id),
      );
      setPedidos(prev => prev.map(pedido =>
        pedidosActualizados.has(pedido.id) ? { ...pedido, estado: 'listo' } : pedido,
      ));

      if (resultados.some(resultado => resultado.status === 'rejected')) {
        alert('Algunos pedidos no pudieron actualizarse. Revisa el estado de la mesa.');
      }
    } catch (err) {
      console.error("Error al marcar la mesa como lista:", err);
      alert('No se pudo actualizar el estado de la mesa.');
    } finally {
      setMesaAccionEnCurso(null);
    }
  };

  const cerrarCuenta = async (grupo: MesaGrupo) => {
    if (!grupo.mesaId) {
      alert('No se pudo identificar la mesa para cerrarla.');
      return;
    }
    if (!window.confirm(`¿Seguro que deseas cerrar la cuenta de la Mesa ${grupo.mesa}? Se finalizarán los pedidos actuales y la mesa quedará disponible para una nueva cuenta.`)) return;

    setMesaAccionEnCurso('cerrar-cuenta');
    try {
      const mesaActualizada = await api.cerrarCuenta(grupo.mesaId);
      setPedidos(prev => prev.filter(pedido => pedido.mesaId !== grupo.mesaId));
      setMesas(prev => ({
        ...prev,
        [grupo.mesaId as string]: {
          ...prev[grupo.mesaId as string],
          ...mesaActualizada,
          cuenta_solicitada: false,
        },
      }));
      setMesaDetalleKey(null);
    } catch (err) {
      console.error("Error al cerrar la cuenta:", err);
      alert('No se pudo cerrar la cuenta. Intenta nuevamente.');
    } finally {
      setMesaAccionEnCurso(null);
    }
  };

  const cerrarMesaDetalle = useCallback(() => setMesaDetalleKey(null), []);
  const mesasAgrupadas = useMemo(() => {
    const grupos = new Map<string, MesaGrupo>();

    pedidos.forEach(pedido => {
      const key = pedido.mesaId || `mesa-${pedido.mesa}`;
      const grupo = grupos.get(key);
      if (grupo) {
        grupo.pedidos.push(pedido);
        return;
      }

      grupos.set(key, {
        key,
        mesa: pedido.mesa,
        mesaId: pedido.mesaId,
        pedidos: [pedido],
        cuentaSolicitada: Boolean(pedido.mesaId && mesas[pedido.mesaId]?.cuenta_solicitada) || Boolean(pedido.cuentaSolicitada),
      });
    });

    return Array.from(grupos.values());
  }, [mesas, pedidos]);
  const mesaDetalle = mesasAgrupadas.find(grupo => grupo.key === mesaDetalleKey);
  const conAlerta = mesasAgrupadas.filter(grupo => grupo.cuentaSolicitada);
  const sinAlerta = mesasAgrupadas.filter(grupo => !grupo.cuentaSolicitada);

  return (
    <div className="p-16 sm:p-24 md:p-32 space-y-24 font-inter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-12">
        <div>
          <h2 className="text-20 font-medium text-ash-graphite">Panel Recepcionista</h2>
          <p className="text-13 text-sage-green mt-2">
            {mesasAgrupadas.length} {mesasAgrupadas.length === 1 ? 'mesa activa' : 'mesas activas'} · {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'} {loading && "(cargando...)"}
          </p>
        </div>
        <div className="flex items-center gap-8 self-start sm:self-auto bg-ghost-fog px-12 py-6 rounded-full border border-ash-graphite/10">
          <span
            className={`w-8 h-8 rounded-full ${sseConectado ? 'bg-success animate-pulse' : 'bg-sage-green'}`}
          />
          <span className="text-11 font-mono text-sage-green uppercase tracking-wide">
            {sseConectado ? 'En vivo (SSE)' : 'Conectando...'}
          </span>
        </div>
      </div>

      {conAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-alert-red uppercase tracking-wider font-semibold">
            ⚠️ Solicitudes de cuenta
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {conAlerta.map(grupo => (
              <MesaCard
                key={grupo.key}
                grupo={grupo}
                onOpen={() => setMesaDetalleKey(grupo.key)}
              />
            ))}
          </div>
        </div>
      )}

      {sinAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Pedidos en curso</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {sinAlerta.map(grupo => (
              <MesaCard
                key={grupo.key}
                grupo={grupo}
                onOpen={() => setMesaDetalleKey(grupo.key)}
              />
            ))}
          </div>
        </div>
      )}

      {pedidos.length === 0 && !loading && (
        <div className="text-center py-40 text-sage-green text-13 bg-vanilla-cream rounded-lg border border-ash-graphite/20">
          No hay pedidos activos en este momento.
        </div>
      )}

      {mesaDetalle && (
        <MesaDetalleModal
          grupo={mesaDetalle}
          onClose={cerrarMesaDetalle}
          onAvanzar={avanzarEstado}
          onCerrar={cerrarPedido}
          onTodoListo={marcarMesaTodoLista}
          onCerrarCuenta={cerrarCuenta}
          mesaAccionEnCurso={mesaAccionEnCurso}
        />
      )}
    </div>
  );
}
