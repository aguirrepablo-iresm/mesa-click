"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { api, MesaAPI, Sucursal, getErrorMessage } from "@/lib/api";

function QRCanvas({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/mesa/${token}`;
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
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="bg-canvas-white p-4 rounded-md border border-ghost-fog flex items-center justify-center">
        <canvas ref={canvasRef} className="max-w-full h-auto rounded" />
      </div>
      <button
        onClick={handleDownload}
        className="w-full px-8 py-6 text-12 font-medium text-plain-green-muted border border-plain-green-muted rounded-md hover:bg-ghost-fog transition-colors flex items-center justify-center gap-4"
      >
        <span className="material-symbols-outlined text-16">download</span>
        Descargar QR
      </button>
    </div>
  );
}

export default function MesasSection() {
  const [mesas, setMesas] = useState<MesaAPI[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormMesa, setMostrarFormMesa] = useState(false);
  const [nuevoNumero, setNuevoNumero] = useState('');
  const [nuevaCapacidad, setNuevaCapacidad] = useState('4');
  const [errorMsg, setErrorMsg] = useState('');

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
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargarMesas]);

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
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al crear la mesa.'));
    }
  };

  const handleEliminarMesa = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta mesa?')) return;
    try {
      await api.eliminarMesa(id);
      setMesas(prev => prev.filter(m => m.id !== id));
    } catch (err: unknown) {
      console.error("No se pudo eliminar mesa:", err);
      setErrorMsg(getErrorMessage(err, 'Error al eliminar la mesa.'));
    }
  };

  return (
    <div className="p-24 md:p-32 space-y-24 font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-20 font-medium text-ash-graphite">Mesas & Códigos QR</h2>
          <p className="text-13 text-sage-green mt-4">
            {mesas.length} mesas configuradas con QR activo {loading && "(cargando...)"}
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('');
            setMostrarFormMesa(true);
          }}
          className="px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-6 shrink-0 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-16">add</span>
          Nueva Mesa
        </button>
      </div>

      {errorMsg && (
        <div className="p-10 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
          {errorMsg}
        </div>
      )}

      {mostrarFormMesa && (
        <form onSubmit={handleCrearMesa} className="p-16 border border-plain-green rounded-md bg-ghost-fog flex flex-col sm:flex-row items-stretch sm:items-end gap-12">
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
              className="w-full px-12 py-8 text-13 bg-canvas-white rounded-md border border-ash-graphite outline-none focus:border-plain-green"
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
              className="w-full px-12 py-8 text-13 bg-canvas-white rounded-md border border-ash-graphite outline-none focus:border-plain-green"
            />
          </div>
          <div className="flex items-center gap-8 pt-4 sm:pt-0">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setMostrarFormMesa(false);
              }}
              className="px-12 py-8 text-sage-green text-13 hover:text-ash-graphite"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-16">
        {mesas.map(mesa => (
          <div key={mesa.id} className="border border-ash-graphite rounded-lg p-16 space-y-12 bg-canvas-white flex flex-col items-center">
            <div className="flex items-center justify-between w-full">
              <span className="text-15 font-medium text-ash-graphite">Mesa {mesa.numero}</span>
              <button
                onClick={() => handleEliminarMesa(mesa.id)}
                title="Eliminar mesa"
                className="p-4 text-12 text-alert-red hover:opacity-70"
              >
                ✕
              </button>
            </div>
            <QRCanvas token={mesa.qr_token} />
            <div className="space-y-2 w-full">
              <p className="text-9 font-mono text-sage-green text-center break-all truncate">
                {mesa.qr_token}
              </p>
              <p className="text-11 text-sage-green text-center font-mono">
                Capacidad: {mesa.capacidad} pers.
              </p>
            </div>
          </div>
        ))}
      </div>

      {mesas.length === 0 && !loading && (
        <div className="text-center py-40 text-sage-green text-13">
          No hay mesas registradas. Creá la primera para generar los códigos QR.
        </div>
      )}
    </div>
  );
}
