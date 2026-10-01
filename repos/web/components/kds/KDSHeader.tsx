// repos/web/components/kds/KDSHeader.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { isAudioEnabled, setAudioEnabled } from "./AudioAlerts";
import { Sucursal } from "@/lib/api";

export interface KDSHeaderProps {
  sucursales: Sucursal[];
  sucursalSeleccionadaId: string;
  onCambiarSucursal: (sucursalId: string) => void;
  conectadoSSE: boolean;
  totalComandasActivas: number;
  totalDespachadas: number;
  onAbrirHistorial: () => void;
}

export function KDSHeader({
  sucursales,
  sucursalSeleccionadaId,
  onCambiarSucursal,
  conectadoSSE,
  totalComandasActivas,
  totalDespachadas,
  onAbrirHistorial,
}: KDSHeaderProps) {
  const [horaActual, setHoraActual] = useState<string>("");
  const [audioActivo, setAudioActivo] = useState<boolean>(true);
  const [esPantallaCompleta, setEsPantallaCompleta] = useState<boolean>(false);

  // Reloj digital en vivo
  useEffect(() => {
    function actualizarHora() {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
    actualizarHora();
    const interval = setInterval(actualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sincronizar estado inicial de sonido
  useEffect(() => {
    setAudioActivo(isAudioEnabled());
  }, []);

  // Listener para estado de pantalla completa
  useEffect(() => {
    function onFullscreenChange() {
      setEsPantallaCompleta(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function toggleAudio() {
    const nuevoEstado = !audioActivo;
    setAudioActivo(nuevoEstado);
    setAudioEnabled(nuevoEstado);
  }

  async function togglePantallaCompleta() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Error alternando pantalla completa:", err);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-12 border-b border-neutral-800 bg-neutral-950 px-16 py-10 shadow-md">
      {/* LADO IZQUIERDO: BRAND + SUCURSAL + VOLVER */}
      <div className="flex items-center gap-12">
        <Link
          href="/dashboard"
          className="flex h-36 w-36 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Volver al Dashboard"
        >
          ←
        </Link>

        <div className="flex items-center gap-8">
          <span className="text-20">🍳</span>
          <div>
            <div className="flex items-center gap-8">
              <h1 className="text-16 font-black tracking-wider text-white uppercase">
                KDS Cocina
              </h1>
              <span className="rounded bg-amber-500/20 px-6 py-1 text-10 font-bold text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-11 text-neutral-400 font-medium">Mesa CLICK Display</p>
          </div>
        </div>

        {/* SELECTOR DE SUCURSAL */}
        {sucursales.length > 1 ? (
          <select
            value={sucursalSeleccionadaId}
            onChange={(e) => onCambiarSucursal(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-10 py-6 text-13 font-semibold text-neutral-200 focus:border-amber-500 focus:outline-none"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                📍 {s.nombre}
              </option>
            ))}
          </select>
        ) : sucursales.length === 1 ? (
          <span className="hidden sm:inline-flex items-center gap-4 rounded-lg bg-neutral-900 border border-neutral-800 px-10 py-6 text-12 font-medium text-neutral-300">
            📍 {sucursales[0].nombre}
          </span>
        ) : null}
      </div>

      {/* CENTRO: RELOJ Y ESTADO SSE */}
      <div className="flex items-center gap-16">
        {/* RELOJ DIGITAL */}
        <div className="flex items-center gap-6 rounded-lg bg-neutral-900/80 border border-neutral-800 px-12 py-6 font-mono text-16 font-black text-amber-400 shadow-inner">
          <span>🕒</span>
          <span>{horaActual || "--:--:--"}</span>
        </div>

        {/* ESTADO EN VIVO SSE */}
        <div
          className={`flex items-center gap-6 rounded-full border px-10 py-4 text-11 font-bold ${
            conectadoSSE
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300 animate-pulse"
          }`}
          title={conectadoSSE ? "Conectado al servidor en tiempo real" : "Reconectando con el servidor..."}
        >
          <span
            className={`inline-block h-8 w-8 rounded-full ${
              conectadoSSE ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{conectadoSSE ? "EN VIVO" : "RECONECTANDO"}</span>
        </div>
      </div>

      {/* LADO DERECHO: HERRAMIENTAS Y ACCIONES */}
      <div className="flex items-center gap-8">
        {/* BOTÓN HISTORIAL DE DESPACHOS */}
        <button
          type="button"
          onClick={onAbrirHistorial}
          className="relative flex items-center gap-6 rounded-lg border border-neutral-800 bg-neutral-900 px-12 py-8 text-12 font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer min-h-[40px]"
          title="Ver comandas despachadas recientemente"
        >
          <span>📋</span>
          <span className="hidden md:inline">Despachos</span>
          {totalDespachadas > 0 && (
            <span className="rounded-full bg-emerald-500 px-6 py-1 text-10 font-black text-neutral-950">
              {totalDespachadas}
            </span>
          )}
        </button>

        {/* TOGGLE SONIDO (US-66) */}
        <button
          type="button"
          onClick={toggleAudio}
          className={`flex h-40 w-40 items-center justify-center rounded-lg border text-16 transition-all cursor-pointer ${
            audioActivo
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
              : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:text-neutral-300"
          }`}
          title={audioActivo ? "Sonido activado (clic para silenciar)" : "Sonido silenciado (clic para activar)"}
        >
          {audioActivo ? "🔔" : "🔕"}
        </button>

        {/* TOGGLE FULLSCREEN (US-65) */}
        <button
          type="button"
          onClick={togglePantallaCompleta}
          className="flex h-40 w-40 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-16 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
          title={esPantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa para cocina"}
        >
          {esPantallaCompleta ? "🗗" : "⛶"}
        </button>
      </div>
    </header>
  );
}
