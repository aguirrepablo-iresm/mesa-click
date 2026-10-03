"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { api, MesaAPI, Sucursal, EstadoPlan, esPlanLimitReached, detallePlanLimit, getErrorMessage } from "@/lib/api";
import { EmptyState, Skeleton, useToast, useConfirm } from "@/components/ui";
import UpgradeModal from "./UpgradeModal";

function QRCanvas({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/mesa/${token}`;
    setPublicUrl(url);
    QRCode.toCanvas(canvasRef.current, url, { width: 140, margin: 1 });
  }, [token]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-mesa-${token}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex items-center justify-center rounded-xl border border-concrete bg-canvas-white p-8 shadow-sm">
        <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
      </div>
      {publicUrl && (
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir menú de la Mesa ${token} en una nueva pestaña`}
          className="w-full truncate text-center text-10 font-mono text-sage-green underline decoration-sage-green/40 underline-offset-2 transition-colors hover:text-ash-graphite"
        >
          {publicUrl}
        </a>
      )}
      <button
        onClick={handleDownload}
        className="flex h-44 w-full items-center justify-center gap-6 rounded-lg border border-concrete bg-canvas-white px-10 text-12 font-semibold text-ash-graphite transition-colors hover:border-stone hover:bg-ghost-fog"
      >
        <span className="material-symbols-outlined text-16">download</span>
        Descargar QR
      </button>
    </div>
  );
}

export default function MesasSection() {
  const toast = useToast();
  const confirmar = useConfirm();
  const [mesas, setMesas] = useState<MesaAPI[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormMesa, setMostrarFormMesa] = useState(false);
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState('4');
  const [errorMsg, setErrorMsg] = useState('');
  const [estadoPlan, setEstadoPlan] = useState<EstadoPlan | null>(null);
  const [modalUpgradeOpen, setModalUpgradeOpen] = useState(false);
  const [modalLimiteInfo, setModalLimiteInfo] = useState<{ limite?: number; uso?: number }>({});

  const cargarPlan = useCallback(async () => {
    try {
      const plan = await api.obtenerMiPlan();
      setEstadoPlan(plan);
    } catch (err) {
      console.warn("No se pudo cargar el plan en MesasSection:", err);
    }
  }, []);

  const cargarMesas = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [mesasList, sucursalesList] = await Promise.all([
        api.listarMesas(),
        api.listarSucursales(),
      ]);

      if (sucursalesList && sucursalesList.length > 0) {
        setSucursales(sucursalesList);
      } else {
        setSucursales([]);
      }

      if (mesasList && mesasList.length > 0) {
        setMesas(mesasList);
      } else {
        setMesas([]);
      }
    } catch (err: unknown) {
      console.error("Error al cargar mesas desde la API:", err);
      setMesas([]);
      setErrorMsg(getErrorMessage(err, 'Error al conectar con la API de mesas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void cargarMesas();
      void cargarPlan();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargarMesas, cargarPlan]);

  const limiteMesasAlcanzado = Boolean(
    estadoPlan &&
      estadoPlan.plan === "free" &&
      (estadoPlan.alcanzado?.mesas === true ||
        (estadoPlan.disponibles?.mesas !== undefined && estadoPlan.disponibles.mesas <= 0))
  );

  const handleAbrirCrearMesa = () => {
    if (limiteMesasAlcanzado) {
      setModalLimiteInfo({
        limite: estadoPlan?.limites?.mesas ?? 10,
        uso: estadoPlan?.uso?.mesas ?? mesas.length,
      });
      setModalUpgradeOpen(true);
      return;
    }
    setErrorMsg('');
    setMostrarFormMesa(true);
  };

  const handleCrearMesa = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(nuevoNumero, 10);
    const cap = parseInt(nuevaCapacidad, 10);

    if (isNaN(num) || num <= 0) {
      setErrorMsg('Ingresa un número de mesa válido.');
      return;
    }

    if (isNaN(cap) || cap <= 0) {
      setErrorMsg('Ingresa una capacidad válida.');
      return;
    }

    if (sucursales.length === 0) {
      setErrorMsg('No hay una sucursal registrada para crear mesas.');
      return;
    }

    setErrorMsg('');
    const sucursalId = sucursales[0].id;

    const yaExiste = mesas.some(
      mesa => mesa.sucursal_id === sucursalId && mesa.numero === num
    );
    if (yaExiste) {
      setErrorMsg(`Ya existe una mesa con el número ${num}.`);
      return;
    }

    try {
      const creada = await api.crearMesa({
        sucursal_id: sucursalId,
        numero: num,
        capacidad: cap,
      });
      setMesas(prev => [...prev, creada]);
      setNuevoNumero('');
      setNuevaCapacidad('4');
      setMostrarFormMesa(false);
      toast.success('Mesa creada correctamente.');
      void cargarPlan();
    } catch (err: unknown) {
      if (esPlanLimitReached(err)) {
        const detalle = detallePlanLimit(err);
        setModalLimiteInfo({
          limite: detalle?.limite ?? 10,
          uso: detalle?.uso ?? 10,
        });
        setModalUpgradeOpen(true);
        return;
      }
      setErrorMsg(getErrorMessage(err, 'Error al crear la mesa.'));
    }
  };

  const handleEliminarMesa = async (id: string) => {
    const ok = await confirmar({
      titulo: 'Eliminar mesa',
      mensaje: '¿Eliminás esta mesa? Se borrará el QR asociado y no podrá recuperarse.',
      labelAceptar: 'Sí, eliminar',
      variante: 'danger',
    });
    if (!ok) return;
    try {
      await api.eliminarMesa(id);
      setMesas(prev => prev.filter(m => m.id !== id));
      toast.success('Mesa eliminada.');
      void cargarPlan();
    } catch (err: unknown) {
      console.error("No se pudo eliminar mesa:", err);
      setErrorMsg(getErrorMessage(err, 'Error al eliminar la mesa.'));
    }
  };

  return (
    <div className="h-full space-y-24 overflow-y-auto bg-ghost-fog/45 p-16 font-inter sm:p-24 md:p-32">
      <div className="flex flex-col justify-between gap-16 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="text-24 font-semibold tracking-[-0.02em] text-ash-graphite sm:text-32">Mesas & Códigos QR</h2>
          <p className="mt-4 text-13 text-sage-green sm:text-14">
            {loading ? 'Cargando mesas...' : `${mesas.length} mesas configuradas con QR activo`}
          </p>
        </div>
        <div className="flex items-center gap-8">
          {limiteMesasAlcanzado && (
            <span
              className="inline-flex items-center gap-4 rounded-full border border-stone/30 bg-ghost-fog px-10 py-4 text-11 font-mono font-medium text-stone"
              title="Límite del plan Free alcanzado"
            >
              <span className="material-symbols-outlined text-14">lock</span>
              Límite alcanzado
            </span>
          )}
          <button
            onClick={handleAbrirCrearMesa}
            className={`flex h-48 shrink-0 items-center justify-center gap-8 whitespace-nowrap rounded-lg px-20 text-13 font-semibold shadow-sm transition-colors ${
              limiteMesasAlcanzado
                ? "border border-concrete bg-ghost-fog text-ash-graphite hover:border-stone hover:bg-stone/10"
                : "bg-plain-green text-canvas-white hover:bg-plain-green-muted"
            }`}
            aria-label={limiteMesasAlcanzado ? "Límite de mesas alcanzado. Ver opciones de plan Pro." : "Nueva mesa"}
          >
            <span className="material-symbols-outlined text-16">
              {limiteMesasAlcanzado ? "lock" : "add"}
            </span>
            Nueva mesa
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-10 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
          {errorMsg}
        </div>
      )}

      {mostrarFormMesa && (
        <form onSubmit={handleCrearMesa} className="flex flex-col items-stretch gap-12 rounded-xl border border-concrete bg-canvas-white p-16 shadow-sm sm:flex-row sm:items-end sm:p-20">
          <div className="space-y-4 flex-1">
            <label className="text-11 font-mono text-sage-green uppercase">Número de Mesa</label>
            <input
              type="number"
              required
              min="1"
              autoFocus
              placeholder="Ej: 1"
              value={nuevoNumero}
              onChange={e => setNuevoNumero(e.target.value)}
              className="h-44 w-full rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green"
            />
          </div>
          <div className="space-y-4 flex-1">
            <label className="text-11 font-mono text-sage-green uppercase">Capacidad (Sillas)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="4"
              value={nuevaCapacidad}
              onChange={e => setNuevaCapacidad(e.target.value)}
              className="h-44 w-full rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green"
            />
          </div>
          <div className="flex items-center gap-8 pt-4 sm:pt-0">
            <button
              type="submit"
              className="h-44 flex-1 rounded-lg bg-plain-green px-16 text-13 font-semibold text-canvas-white transition-colors hover:bg-plain-green-muted sm:flex-initial"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setMostrarFormMesa(false);
              }}
              className="h-44 rounded-lg px-12 text-13 text-sage-green hover:bg-ghost-fog hover:text-ash-graphite"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Skeleton de carga */}
      {loading && (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-12 rounded-xl border border-concrete bg-canvas-white p-16 shadow-sm">
              <Skeleton className="h-14 w-2/3" />
              <Skeleton className="h-140 w-full" />
              <Skeleton className="h-10 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Grid de mesas */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mesas.map(mesa => (
              <article key={mesa.id} className="flex flex-col items-center space-y-14 rounded-xl border border-concrete bg-canvas-white p-16 shadow-sm transition-shadow hover:shadow-md sm:p-20">
                <div className="flex w-full items-center justify-between gap-8">
                  <div className="flex min-w-0 items-center gap-10">
                    <span className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg bg-ghost-fog text-ash-graphite">
                      <span className="material-symbols-outlined text-20">table_restaurant</span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-16 font-semibold text-ash-graphite">Mesa {mesa.numero}</p>
                      <p className="mt-2 text-11 text-sage-green">{mesa.capacidad} personas</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarMesa(mesa.id)}
                    title="Eliminar mesa"
                    className="flex h-44 w-44 shrink-0 items-center justify-center rounded-lg text-alert-red transition-colors hover:bg-warm-pink/20"
                    aria-label={`Eliminar Mesa ${mesa.numero}`}
                  >
                    <span className="material-symbols-outlined text-18">delete</span>
                  </button>
                </div>
                <QRCanvas token={mesa.qr_token} />
                <div className="w-full space-y-2 border-t border-ghost-fog pt-10">
                  <p className="text-9 font-mono text-sage-green text-center break-all truncate">
                    {mesa.qr_token}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {mesas.length === 0 && (
            <EmptyState
              icon="table_restaurant"
              title="No hay mesas configuradas"
              description="Creá tu primera mesa para generar el código QR que los clientes escanean."
              actionLabel="Nueva Mesa"
              onAction={handleAbrirCrearMesa}
            />
          )}
        </>
      )}

      <UpgradeModal
        isOpen={modalUpgradeOpen}
        onClose={() => setModalUpgradeOpen(false)}
        recurso="mesas"
        limite={modalLimiteInfo.limite ?? estadoPlan?.limites?.mesas ?? 10}
        uso={modalLimiteInfo.uso ?? estadoPlan?.uso?.mesas ?? mesas.length}
        onUpgradeSolicitado={() => void cargarPlan()}
      />
    </div>
  );
}
