"use client";
import { useState } from "react";
import { mockPedidos, Pedido } from "@/lib/mock/pedidos";

const ESTADOS: Pedido['estado'][] = ['recibido', 'preparando', 'listo'];

const ESTADO_LABELS: Record<Pedido['estado'], string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
};

const ESTADO_STYLES: Record<Pedido['estado'], string> = {
  recibido: 'bg-vanilla-cream text-ash-graphite border-ash-graphite',
  preparando: 'bg-ghost-fog text-sage-green border-sage-green',
  listo: 'bg-plain-green text-ash-graphite border-plain-green',
};

function PedidoCard({
  pedido,
  onAvanzar,
  onCerrar,
}: {
  pedido: Pedido;
  onAvanzar: (id: string) => void;
  onCerrar: (id: string) => void;
}) {
  const total = pedido.items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  const esAlerta = pedido.cuentaSolicitada;

  return (
    <div className={`border rounded-lg overflow-hidden ${esAlerta ? 'border-alert-red' : 'border-ash-graphite'}`}>
      <div
        className={`flex items-center justify-between px-20 py-10 border-b ${
          esAlerta ? 'bg-red-50 border-alert-red' : 'bg-vanilla-cream border-ash-graphite'
        }`}
      >
        <div className="flex items-center gap-12">
          <span className="text-15 font-medium text-ash-graphite">Mesa {pedido.mesa}</span>
          {esAlerta && (
            <span className="text-12 font-medium text-alert-red">⚠️ Pide la cuenta</span>
          )}
          <span className="text-12 font-mono text-sage-green">{pedido.timestamp}</span>
        </div>
        <span className={`px-10 py-3 text-11 font-medium rounded-md border ${ESTADO_STYLES[pedido.estado]}`}>
          {ESTADO_LABELS[pedido.estado]}
        </span>
      </div>

      <div className="px-20 py-12 space-y-4">
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

      <div className="flex items-center gap-8 px-20 py-12 border-t border-ghost-fog">
        {pedido.estado !== 'listo' && (
          <button
            onClick={() => onAvanzar(pedido.id)}
            className="px-12 py-6 bg-plain-green text-ash-graphite text-12 font-medium rounded-md hover:opacity-90"
          >
            {pedido.estado === 'recibido' ? '→ Preparando' : '→ Listo'}
          </button>
        )}
        {pedido.estado === 'listo' && (
          <button
            onClick={() => onCerrar(pedido.id)}
            className="px-12 py-6 bg-ash-graphite text-canvas-white text-12 font-medium rounded-md hover:opacity-90"
          >
            Cerrar pedido
          </button>
        )}
      </div>
    </div>
  );
}

export default function RecepcionistaSection() {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);

  const avanzarEstado = (pedidoId: string) => {
    setPedidos(prev =>
      prev.map(p => {
        if (p.id !== pedidoId) return p;
        const idx = ESTADOS.indexOf(p.estado);
        if (idx >= ESTADOS.length - 1) return p;
        return { ...p, estado: ESTADOS[idx + 1] };
      })
    );
  };

  const cerrarPedido = (pedidoId: string) => {
    setPedidos(prev => prev.filter(p => p.id !== pedidoId));
  };

  const conAlerta = pedidos.filter(p => p.cuentaSolicitada);
  const sinAlerta = pedidos.filter(p => !p.cuentaSolicitada);

  return (
    <div className="p-24 md:p-32 space-y-24">
      <div>
        <h2 className="text-20 font-medium text-ash-graphite">Panel Recepcionista</h2>
        <p className="text-13 text-sage-green mt-4">{pedidos.length} pedidos activos</p>
      </div>

      {conAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">
            ⚠️ Solicitudes de cuenta
          </p>
          {conAlerta.map(p => (
            <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado} onCerrar={cerrarPedido} />
          ))}
        </div>
      )}

      {sinAlerta.length > 0 && (
        <div className="space-y-8">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Pedidos activos</p>
          {sinAlerta.map(p => (
            <PedidoCard key={p.id} pedido={p} onAvanzar={avanzarEstado} onCerrar={cerrarPedido} />
          ))}
        </div>
      )}

      {pedidos.length === 0 && (
        <div className="text-center py-40 text-sage-green text-13">
          No hay pedidos activos en este momento.
        </div>
      )}
    </div>
  );
}
