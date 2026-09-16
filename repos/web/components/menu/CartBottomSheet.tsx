"use client";

import { useEffect, useRef, useState, type TouchEvent, type PointerEvent } from "react";
import type { CartItem } from "@/app/mesa/[token]/page";
import { BrandMark } from "./BrandHeader";
import type { MesaBranding } from "./BrandHeader";

interface Props {
  branding: MesaBranding;
  items: CartItem[];
  totalPrecio: number;
  enviando?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSetCantidad: (id: string, cantidad: number) => void;
  onSetNota: (id: string, nota: string) => void;
  onConfirmar: () => void;
}

export default function CartBottomSheet({
  branding,
  items,
  totalPrecio,
  enviando = false,
  isOpen,
  onClose,
  onSetCantidad,
  onSetNota,
  onConfirmar,
}: Props) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll de fondo y soportar Escape para cerrar
  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Manejo de gestos táctiles y arrastre hacia abajo
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const delta = touch.clientY - startYRef.current;
    if (delta > 0) {
      currentYRef.current = touch.clientY;
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = currentYRef.current - startYRef.current;
    // Si se arrastró más de 100px hacia abajo, se cierra la hoja
    if (delta > 100) {
      onClose();
    }
    setDragY(0);
  };

  // Manejo de puntero (mouse / stylus en desktop y emuladores)
  const handlePointerDown = (e: PointerEvent) => {
    startYRef.current = e.clientY;
    currentYRef.current = e.clientY;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - startYRef.current;
    if (delta > 0) {
      currentYRef.current = e.clientY;
      setDragY(delta);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const delta = currentYRef.current - startYRef.current;
    if (delta > 100) {
      onClose();
    }
    setDragY(0);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignorar si el puntero ya se liberó
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-bottom-sheet-title"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : "translateY(0)",
          transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="mesa-background flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border-t border-x mesa-border shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superior / Drag Handle */}
        <div
          className="flex flex-col items-center pt-10 pb-4 cursor-grab active:cursor-grabbing select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="h-4 w-36 rounded-full bg-slate-400/60 transition-colors" />
        </div>

        {/* Header del carrito */}
        <header className="flex shrink-0 items-center justify-between border-b mesa-border px-16 py-10">
          <div className="flex items-center gap-10 min-w-0">
            <BrandMark branding={branding} className="h-36 w-36 shrink-0" />
            <div className="min-w-0">
              <h2 id="cart-bottom-sheet-title" className="mesa-text text-15 font-semibold leading-tight truncate">
                Tu pedido
              </h2>
              <span className="mesa-muted text-11 font-mono">
                {items.length} {items.length === 1 ? "ítem" : "ítems"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={onClose}
              className="mesa-primary min-h-48 px-10 text-12 font-medium hover:underline flex items-center"
            >
              + Agregar más
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="mesa-muted mesa-subtle-surface flex h-48 w-48 items-center justify-center rounded-full text-18 font-medium transition-colors hover:text-[var(--mesa-primary)]"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Lista de ítems deslizable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-16 py-14 space-y-12 overscroll-contain">
          {items.map(item => (
            <div key={item.id} className="mesa-surface mesa-border space-y-10 rounded-lg border p-14 shadow-2xs">
              <div className="flex items-start justify-between gap-8">
                <span className="mesa-text text-14 font-medium leading-snug">{item.nombre}</span>
                <span className="mesa-text text-14 font-mono font-semibold shrink-0">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="mesa-muted text-12 font-mono">${item.precio.toLocaleString()} c/u</span>
                <div className="mesa-subtle-surface mesa-border flex items-center gap-8 rounded-full border p-2">
                  <button
                    onClick={() => onSetCantidad(item.id, item.cantidad - 1)}
                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                    className="mesa-surface mesa-muted flex h-48 w-48 items-center justify-center rounded-full text-16 font-semibold shadow-2xs transition-transform active:scale-90"
                  >
                    −
                  </button>
                  <span className="mesa-text w-24 text-center text-14 font-mono font-medium">
                    {item.cantidad}
                  </span>
                  <button
                    onClick={() => onSetCantidad(item.id, item.cantidad + 1)}
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                    className="mesa-primary-bg flex h-48 w-48 items-center justify-center rounded-full text-16 font-semibold shadow-2xs transition-transform active:scale-90"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                className="mesa-subtle-surface mesa-muted mesa-border w-full rounded-md border px-12 py-8 text-12 outline-none transition-colors placeholder:text-slate-400 focus:border-[var(--mesa-primary)] focus:bg-[var(--mesa-surface)]"
                placeholder="Aclaración a cocina (ej: sin sal, hielo aparte)..."
                value={item.nota}
                onChange={e => onSetNota(item.id, e.target.value)}
              />
            </div>
          ))}

          {items.length === 0 && (
            <div className="mesa-subtle-text py-36 text-center text-13">
              El carrito está vacío. Agregá platos del menú para armar tu pedido.
            </div>
          )}
        </div>

        {/* Footer fijo del bottom sheet */}
        <footer className="mesa-surface mesa-border border-t px-16 py-14 space-y-10 shadow-lg">
          <div className="mesa-text flex items-center justify-between text-15 font-medium">
            <span>Total a pagar</span>
            <span className="mesa-primary text-18 font-mono font-semibold">
              ${totalPrecio.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onConfirmar}
            disabled={items.length === 0 || enviando}
            className="mesa-primary-bg flex min-h-52 w-full items-center justify-center gap-8 rounded-lg px-16 py-14 text-15 font-semibold shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{enviando ? "Enviando pedido..." : "Confirmar pedido"}</span>
            <span className="text-16" aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
