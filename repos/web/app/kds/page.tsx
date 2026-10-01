// repos/web/app/kds/page.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  estaAutenticado,
  PedidoAPI,
  Sucursal,
} from "@/lib/api";
import { KDSHeader } from "@/components/kds/KDSHeader";
import { ComandaCard } from "@/components/kds/ComandaCard";
import { HistorialDespachoDrawer } from "@/components/kds/HistorialDespachoDrawer";
import { playNewOrderSound, playOrderReadySound } from "@/components/kds/AudioAlerts";

export default function KDSPage() {
  const router = useRouter();

  // Estados de datos
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [sucursalSeleccionadaId, setSucursalSeleccionadaId] = useState<string>("");
  const [mesasMap, setMesasMap] = useState<Record<string, { numero: number; sector?: string }>>({});
  const [pedidosActivos, setPedidosActivos] = useState<PedidoAPI[]>([]);
  const [pedidosDespachados, setPedidosDespachados] = useState<PedidoAPI[]>([]);

  // Estados de interfaz y conexión
  const [conectadoSSE, setConectadoSSE] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerHistorialAbierto, setDrawerHistorialAbierto] = useState<boolean>(false);

  // 1. Verificación de autenticación y carga inicial de sucursales y mesas
  useEffect(() => {
    if (!estaAutenticado()) {
      router.push("/login");
      return;
    }

    async function inicializarKDS() {
      try {
        setCargando(true);
        setError(null);

        // Cargar sucursales
        const sucs = await api.listarSucursales();
        setSucursales(sucs);

        if (sucs.length === 0) {
          setError("No se encontraron sucursales registradas.");
          setCargando(false);
          return;
        }

        // Determinar sucursal activa
        const guardada = typeof window !== "undefined" ? localStorage.getItem("kds_sucursal_id") : null;
        const inicial = sucs.find((s) => s.id === guardada) || sucs[0];
        setSucursalSeleccionadaId(inicial.id);

        // Cargar mapa de mesas y sectores
        try {
          const [mesas, sectores] = await Promise.all([
            api.listarMesas(),
            api.listarSectores(inicial.id).catch(() => []),
          ]);

          const sectoresLookup: Record<string, string> = {};
          sectores.forEach((sec) => {
            sectoresLookup[sec.id] = sec.nombre;
          });

          const map: Record<string, { numero: number; sector?: string }> = {};
          mesas.forEach((m) => {
            map[m.id] = {
              numero: m.numero,
              sector: m.sector_id ? sectoresLookup[m.sector_id] : undefined,
            };
          });
          setMesasMap(map);
        } catch (e) {
          console.warn("No se pudieron cargar nombres de mesas/sectores:", e);
        }
      } catch (err: unknown) {
        console.error("Error inicializando KDS:", err);
        setError(err instanceof Error ? err.message : "Error al inicializar pantalla de cocina");
      } finally {
        setCargando(false);
      }
    }

    inicializarKDS();
  }, [router]);

  // 2. Cargar comandas activas al cambiar de sucursal
  const cargarPedidosSucursal = useCallback(async (sucursalId: string) => {
    if (!sucursalId) return;
    try {
      const pedidos = await api.listarPedidosActivos(sucursalId);
      // Filtrar sólo pedidos no cerrados para el tablero activo
      const activos = pedidos.filter((p) => p.estado !== "cerrado");
      setPedidosActivos(activos);
    } catch (err) {
      console.error("Error al listar pedidos activos:", err);
    }
  }, []);

  useEffect(() => {
    if (sucursalSeleccionadaId) {
      cargarPedidosSucursal(sucursalSeleccionadaId);
    }
  }, [sucursalSeleccionadaId, cargarPedidosSucursal]);

  // 3. Conexión en tiempo real SSE al canal KDS (US-64 & US-65)
  useEffect(() => {
    if (!sucursalSeleccionadaId) return;

    const sseUrl = api.obtenerEventosKDSUrl(sucursalSeleccionadaId);
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setConectadoSSE(true);
      };

      eventSource.onerror = () => {
        setConectadoSSE(false);
      };

      // Ping keepalive
      eventSource.addEventListener("ping", () => {
        setConectadoSSE(true);
      });

      // Nueva comanda ingresada (US-66: sonido de campana / chime)
      eventSource.addEventListener("pedido_creado", (e: MessageEvent) => {
        try {
          const nuevoPedido: PedidoAPI = JSON.parse(e.data);
          playNewOrderSound();
          setPedidosActivos((prev) => {
            if (prev.some((p) => p.id === nuevoPedido.id)) {
              return prev.map((p) => (p.id === nuevoPedido.id ? nuevoPedido : p));
            }
            return [...prev, nuevoPedido];
          });
        } catch (err) {
          console.error("Error procesando pedido_creado SSE:", err);
        }
      });

      // Pedido actualizado globalmente
      eventSource.addEventListener("pedido_actualizado", (e: MessageEvent) => {
        try {
          const pedidoActualizado: PedidoAPI = JSON.parse(e.data);

          if (pedidoActualizado.estado === "cerrado") {
            // Remueve de activos y agrega a despachados
            setPedidosActivos((prev) => prev.filter((p) => p.id !== pedidoActualizado.id));
            setPedidosDespachados((prev) => {
              const filtrados = prev.filter((p) => p.id !== pedidoActualizado.id);
              return [pedidoActualizado, ...filtrados].slice(0, 30);
            });
          } else {
            // Actualiza en activos
            setPedidosActivos((prev) => {
              const existe = prev.some((p) => p.id === pedidoActualizado.id);
              if (existe) {
                return prev.map((p) => (p.id === pedidoActualizado.id ? pedidoActualizado : p));
              }
              return [...prev, pedidoActualizado];
            });

            // Si pasa a listo, sonar alerta de comanda lista
            if (pedidoActualizado.estado === "listo") {
              playOrderReadySound();
            }
          }
        } catch (err) {
          console.error("Error procesando pedido_actualizado SSE:", err);
        }
      });

      // Ítem individual actualizado en cocina (US-66)
      eventSource.addEventListener("pedido_item_actualizado", (e: MessageEvent) => {
        try {
          const pedidoActualizado: PedidoAPI = JSON.parse(e.data);

          if (pedidoActualizado.estado === "cerrado") {
            setPedidosActivos((prev) => prev.filter((p) => p.id !== pedidoActualizado.id));
          } else {
            setPedidosActivos((prev) =>
              prev.map((p) => (p.id === pedidoActualizado.id ? pedidoActualizado : p))
            );

            // Verificar si todos los ítems están listos
            const todosListos =
              pedidoActualizado.items &&
              pedidoActualizado.items.length > 0 &&
              pedidoActualizado.items.every((it) => it.estado === "listo");

            if (todosListos || pedidoActualizado.estado === "listo") {
              playOrderReadySound();
            }
          }
        } catch (err) {
          console.error("Error procesando pedido_item_actualizado SSE:", err);
        }
      });
    } catch (err) {
      console.warn("Error creando EventSource KDS:", err);
      setConectadoSSE(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [sucursalSeleccionadaId]);

  // Cambio de sucursal desde el header
  function handleCambiarSucursal(sucId: string) {
    setSucursalSeleccionadaId(sucId);
    if (typeof window !== "undefined") {
      localStorage.setItem("kds_sucursal_id", sucId);
    }
  }

  // 4. Acciones interactivas táctiles (US-66)
  const handleCambiarEstadoItem = useCallback(
    async (itemId: string, nuevoEstado: "pendiente" | "preparando" | "listo") => {
      // Optimistic update
      setPedidosActivos((prev) =>
        prev.map((ped) => {
          if (!ped.items || !ped.items.some((it) => it.id === itemId)) return ped;
          const itemsActualizados = ped.items.map((it) =>
            it.id === itemId ? { ...it, estado: nuevoEstado } : it
          );
          return { ...ped, items: itemsActualizados };
        })
      );

      try {
        const pedActualizado = await api.cambiarEstadoItem(itemId, nuevoEstado);
        setPedidosActivos((prev) =>
          prev.map((p) => (p.id === pedActualizado.id ? pedActualizado : p))
        );
        if (pedActualizado.estado === "listo") {
          playOrderReadySound();
        }
      } catch (err) {
        console.error("Error al cambiar estado de ítem:", err);
        // Recargar pedidos en caso de error
        if (sucursalSeleccionadaId) {
          cargarPedidosSucursal(sucursalSeleccionadaId);
        }
      }
    },
    [sucursalSeleccionadaId, cargarPedidosSucursal]
  );

  const handleComandaCompletaLista = useCallback(
    async (pedidoId: string) => {
      // Optimistic update
      setPedidosActivos((prev) =>
        prev.map((p) => {
          if (p.id !== pedidoId) return p;
          const itemsListos = p.items?.map((it) => ({ ...it, estado: "listo" as const }));
          return { ...p, estado: "listo", items: itemsListos };
        })
      );
      playOrderReadySound();

      try {
        const actualizado = await api.cambiarEstadoPedido(pedidoId, "listo");
        setPedidosActivos((prev) =>
          prev.map((p) => (p.id === actualizado.id ? actualizado : p))
        );
      } catch (err) {
        console.error("Error al marcar comanda completa como lista:", err);
        if (sucursalSeleccionadaId) {
          cargarPedidosSucursal(sucursalSeleccionadaId);
        }
      }
    },
    [sucursalSeleccionadaId, cargarPedidosSucursal]
  );

  const handleDespacharComanda = useCallback(
    async (pedidoId: string) => {
      const pedidoADespachar = pedidosActivos.find((p) => p.id === pedidoId);

      // Optimistic update
      setPedidosActivos((prev) => prev.filter((p) => p.id !== pedidoId));
      if (pedidoADespachar) {
        setPedidosDespachados((prev) => [{ ...pedidoADespachar, estado: "cerrado" }, ...prev]);
      }

      try {
        await api.cambiarEstadoPedido(pedidoId, "cerrado");
      } catch (err) {
        console.error("Error al despachar comanda:", err);
        if (sucursalSeleccionadaId) {
          cargarPedidosSucursal(sucursalSeleccionadaId);
        }
      }
    },
    [pedidosActivos, sucursalSeleccionadaId, cargarPedidosSucursal]
  );

  const handleReabrirComanda = useCallback(
    async (pedidoId: string) => {
      try {
        const reabierto = await api.cambiarEstadoPedido(pedidoId, "listo");
        setPedidosDespachados((prev) => prev.filter((p) => p.id !== pedidoId));
        setPedidosActivos((prev) => [reabierto, ...prev]);
      } catch (err) {
        console.error("Error al reabrir comanda:", err);
      }
    },
    []
  );

  // 5. Clasificación Kanban por columnas (US-65)
  // Ordenamiento FIFO: más antiguas primero (created_at ascendente)
  const { pendientes, enPreparacion, listos } = useMemo(() => {
    const ordenados = [...pedidosActivos].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const pend: PedidoAPI[] = [];
    const prep: PedidoAPI[] = [];
    const list: PedidoAPI[] = [];

    ordenados.forEach((p) => {
      const items = p.items || [];
      const todosListos = items.length > 0 && items.every((i) => i.estado === "listo");

      if (p.estado === "listo" || todosListos) {
        list.push(p);
      } else if (
        p.estado === "preparando" ||
        items.some((i) => i.estado === "preparando")
      ) {
        prep.push(p);
      } else {
        pend.push(p);
      }
    });

    return { pendientes: pend, enPreparacion: prep, listos: list };
  }, [pedidosActivos]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 font-sans">
      {/* HEADER DE KDS */}
      <KDSHeader
        sucursales={sucursales}
        sucursalSeleccionadaId={sucursalSeleccionadaId}
        onCambiarSucursal={handleCambiarSucursal}
        conectadoSSE={conectadoSSE}
        totalComandasActivas={pedidosActivos.length}
        totalDespachadas={pedidosDespachados.length}
        onAbrirHistorial={() => setDrawerHistorialAbierto(true)}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-16 md:p-24 overflow-x-auto">
        {cargando ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <div className="h-40 w-40 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-16" />
            <p className="text-16 font-bold text-neutral-300">Cargando comandas de cocina...</p>
            <p className="text-12 text-neutral-500 mt-4">Sincronizando con el servidor</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-500/40 bg-red-950/20 p-24 text-center">
            <span className="text-36 mb-12 inline-block">⚠️</span>
            <h2 className="text-18 font-black text-red-300">Error en Pantalla KDS</h2>
            <p className="text-13 text-neutral-300 mt-6">{error}</p>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-16 rounded-lg bg-neutral-800 px-16 py-8 text-13 font-bold text-white hover:bg-neutral-700 cursor-pointer"
            >
              Volver al Dashboard
            </button>
          </div>
        ) : (
          /* TABLERO KANBAN DE 3 COLUMNAS */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 min-h-[calc(100vh-120px)] items-start">
            {/* COLUMNA 1: PENDIENTES */}
            <section className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 min-h-[500px]">
              {/* HEADER COLUMNA */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-12 mb-12">
                <div className="flex items-center gap-8">
                  <span className="flex h-28 w-28 items-center justify-center rounded-md bg-neutral-800 text-14">
                    ⏳
                  </span>
                  <h2 className="text-16 font-black tracking-wide text-neutral-200 uppercase">
                    Pendientes
                  </h2>
                </div>
                <span className="rounded-full bg-neutral-800 px-10 py-3 font-mono text-12 font-black text-neutral-300 border border-neutral-700">
                  {pendientes.length}
                </span>
              </div>

              {/* LISTA DE COMANDAS */}
              <div className="space-y-12 flex-1">
                {pendientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-48 text-center text-neutral-500">
                    <span className="text-32 mb-8">✨</span>
                    <p className="font-bold text-14 text-neutral-400">Sin comandas pendientes</p>
                    <p className="text-11 text-neutral-500 mt-2">Nuevos pedidos ingresarán automáticamente</p>
                  </div>
                ) : (
                  pendientes.map((p) => {
                    const mesaInfo = mesasMap[p.mesa_id];
                    return (
                      <ComandaCard
                        key={p.id}
                        pedido={p}
                        numeroMesa={mesaInfo?.numero ?? 0}
                        nombreSector={mesaInfo?.sector}
                        onCambiarEstadoItem={handleCambiarEstadoItem}
                        onComandaCompletaLista={handleComandaCompletaLista}
                        onDespacharComanda={handleDespacharComanda}
                      />
                    );
                  })
                )}
              </div>
            </section>

            {/* COLUMNA 2: EN PREPARACIÓN */}
            <section className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 min-h-[500px]">
              {/* HEADER COLUMNA */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-12 mb-12">
                <div className="flex items-center gap-8">
                  <span className="flex h-28 w-28 items-center justify-center rounded-md bg-amber-500/20 text-14 text-amber-300">
                    🔥
                  </span>
                  <h2 className="text-16 font-black tracking-wide text-amber-300 uppercase">
                    En Preparación
                  </h2>
                </div>
                <span className="rounded-full bg-amber-500/20 px-10 py-3 font-mono text-12 font-black text-amber-300 border border-amber-500/40">
                  {enPreparacion.length}
                </span>
              </div>

              {/* LISTA DE COMANDAS */}
              <div className="space-y-12 flex-1">
                {enPreparacion.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-48 text-center text-neutral-500">
                    <span className="text-32 mb-8">🍳</span>
                    <p className="font-bold text-14 text-neutral-400">Nada en preparación</p>
                    <p className="text-11 text-neutral-500 mt-2">Toca un ítem pendiente para comenzar a elaborarlo</p>
                  </div>
                ) : (
                  enPreparacion.map((p) => {
                    const mesaInfo = mesasMap[p.mesa_id];
                    return (
                      <ComandaCard
                        key={p.id}
                        pedido={p}
                        numeroMesa={mesaInfo?.numero ?? 0}
                        nombreSector={mesaInfo?.sector}
                        onCambiarEstadoItem={handleCambiarEstadoItem}
                        onComandaCompletaLista={handleComandaCompletaLista}
                        onDespacharComanda={handleDespacharComanda}
                      />
                    );
                  })
                )}
              </div>
            </section>

            {/* COLUMNA 3: LISTOS PARA SERVIR */}
            <section className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 min-h-[500px]">
              {/* HEADER COLUMNA */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-12 mb-12">
                <div className="flex items-center gap-8">
                  <span className="flex h-28 w-28 items-center justify-center rounded-md bg-emerald-500/20 text-14 text-emerald-400">
                    🛎️
                  </span>
                  <h2 className="text-16 font-black tracking-wide text-emerald-400 uppercase">
                    Listos para Retirar
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-10 py-3 font-mono text-12 font-black text-emerald-400 border border-emerald-500/40">
                  {listos.length}
                </span>
              </div>

              {/* LISTA DE COMANDAS */}
              <div className="space-y-12 flex-1">
                {listos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-48 text-center text-neutral-500">
                    <span className="text-32 mb-8">🛎️</span>
                    <p className="font-bold text-14 text-neutral-400">Sin comandas listas</p>
                    <p className="text-11 text-neutral-500 mt-2">Los pedidos completados aguardando retiro aparecerán aquí</p>
                  </div>
                ) : (
                  listos.map((p) => {
                    const mesaInfo = mesasMap[p.mesa_id];
                    return (
                      <ComandaCard
                        key={p.id}
                        pedido={p}
                        numeroMesa={mesaInfo?.numero ?? 0}
                        nombreSector={mesaInfo?.sector}
                        onCambiarEstadoItem={handleCambiarEstadoItem}
                        onComandaCompletaLista={handleComandaCompletaLista}
                        onDespacharComanda={handleDespacharComanda}
                      />
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* DRAWER HISTORIAL DE DESPACHOS (US-66) */}
      <HistorialDespachoDrawer
        isOpen={drawerHistorialAbierto}
        onClose={() => setDrawerHistorialAbierto(false)}
        pedidosDespachados={pedidosDespachados}
        mesasMap={mesasMap}
        onReabrir={handleReabrirComanda}
      />
    </div>
  );
}
