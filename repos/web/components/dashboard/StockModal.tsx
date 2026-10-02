"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { api, ArticuloAPI, CategoriaAPI, getErrorMessage } from "@/lib/api";
import { useToast, useConfirm } from "@/components/ui";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ItemConCategoria extends ArticuloAPI {
  categoriaNombre: string;
}

export default function StockModal({ isOpen, onClose }: Props) {
  const [items, setItems] = useState<ItemConCategoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "stock" | "agotados">("todos");
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [reponiendo, setReponiendo] = useState(false);

  const toast = useToast();
  const confirmar = useConfirm();

  const cargarArticulos = useCallback(async () => {
    try {
      setLoading(true);
      const [categorias, articulos] = await Promise.all([
        api.listarCategorias(),
        api.listarArticulos(),
      ]);
      const catMap = new Map<string, string>();
      categorias.forEach(c => catMap.set(c.id, c.nombre));
      const todosLosItems: ItemConCategoria[] = articulos.map(art => ({
        ...art,
        categoriaNombre: catMap.get(art.categoria_id) || "Sin categoría",
      }));
      setItems(todosLosItems);
    } catch (err: unknown) {
      console.error("Error al cargar artículos:", err);
      toast.error(getErrorMessage(err, "No se pudieron cargar los artículos."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      void cargarArticulos();
    }
  }, [isOpen, cargarArticulos]);

  const handleToggleStock = async (item: ItemConCategoria) => {
    const nuevoEstado = item.disponible === false;
    setActualizandoId(item.id);
    try {
      await api.actualizarDisponibilidadArticulo(item.id, nuevoEstado);
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, disponible: nuevoEstado } : i))
      );
      toast.success(
        nuevoEstado
          ? `"${item.nombre}" ahora está En stock.`
          : `"${item.nombre}" marcado como 86 (Agotado).`
      );
    } catch (err: unknown) {
      console.error("Error al actualizar disponibilidad:", err);
      toast.error(getErrorMessage(err, "Error al actualizar disponibilidad."));
    } finally {
      setActualizandoId(null);
    }
  };

  const handleReponerTodos = async () => {
    const ok = await confirmar({
      titulo: "Reponer stock de la carta",
      mensaje: "¿Deseas restablecer el stock de todos los artículos agotados para el servicio de hoy?",
      labelAceptar: "Sí, reponer stock",
    });
    if (!ok) return;

    setReponiendo(true);
    try {
      const res = await api.reponerTodosLosArticulos();
      await cargarArticulos();
      toast.success(`Se repuso el stock de ${res.repuestos} productos.`);
    } catch (err: unknown) {
      console.error("Error al reponer stock:", err);
      toast.error(getErrorMessage(err, "Error al reponer stock."));
    } finally {
      setReponiendo(false);
    }
  };

  const itemsFiltrados = useMemo(() => {
    return items.filter(item => {
      const coincideBusqueda =
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.categoriaNombre.toLowerCase().includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      if (filtro === "stock") return item.disponible !== false;
      if (filtro === "agotados") return item.disponible === false;
      return true;
    });
  }, [items, busqueda, filtro]);

  const totalAgotados = useMemo(() => {
    return items.filter(i => i.disponible === false).length;
  }, [items]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-stock-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-16 sm:p-24"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ash-graphite/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-concrete bg-canvas-white shadow-2xl overflow-hidden font-inter animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-concrete px-20 py-16 sm:px-24">
          <div className="min-w-0">
            <h2 id="modal-stock-title" className="text-18 font-semibold text-ash-graphite sm:text-20">
              Disponibilidad de Carta (86)
            </h2>
            <p className="mt-2 text-12 text-sage-green">
              {totalAgotados > 0
                ? `${totalAgotados} ${totalAgotados === 1 ? "artículo agotado" : "artículos agotados"} en este turno`
                : "Todos los artículos están en stock"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-44 w-44 items-center justify-center rounded-lg text-sage-green hover:bg-ghost-fog hover:text-ash-graphite transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Barra de herramientas y filtros */}
        <div className="border-b border-concrete bg-ghost-fog/30 p-16 space-y-12 sm:px-24">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar por plato o categoría..."
                className="w-full h-44 rounded-lg border border-concrete bg-canvas-white px-12 text-13 text-ash-graphite placeholder:text-stone/70 focus:border-ash-graphite focus:outline-none"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-12 text-stone hover:text-ash-graphite"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleReponerTodos}
              disabled={reponiendo || totalAgotados === 0}
              className="flex h-44 items-center justify-center gap-6 rounded-lg border border-concrete bg-canvas-white px-14 text-12 font-medium text-ash-graphite shadow-2xs hover:bg-ghost-fog disabled:opacity-40 transition-colors"
            >
              <span>↺</span>
              <span>{reponiendo ? "Reponiendo..." : "Reponer todos"}</span>
            </button>
          </div>

          <div className="flex gap-8">
            <button
              onClick={() => setFiltro("todos")}
              className={`min-h-[32px] px-12 rounded-full text-12 font-medium transition-colors ${
                filtro === "todos"
                  ? "bg-ash-graphite text-canvas-white"
                  : "bg-canvas-white border border-concrete text-stone hover:text-ash-graphite"
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFiltro("stock")}
              className={`min-h-[32px] px-12 rounded-full text-12 font-medium transition-colors ${
                filtro === "stock"
                  ? "bg-ash-graphite text-canvas-white"
                  : "bg-canvas-white border border-concrete text-stone hover:text-ash-graphite"
              }`}
            >
              En stock ({items.length - totalAgotados})
            </button>
            <button
              onClick={() => setFiltro("agotados")}
              className={`min-h-[32px] px-12 rounded-full text-12 font-medium transition-colors ${
                filtro === "agotados"
                  ? "bg-ash-graphite text-canvas-white"
                  : "bg-canvas-white border border-concrete text-stone hover:text-ash-graphite"
              }`}
            >
              Agotados (86) ({totalAgotados})
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto p-16 sm:p-24 space-y-8 divide-y divide-concrete/40">
          {loading ? (
            <div className="py-40 text-center text-13 text-sage-green">
              Cargando catálogo de carta...
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="py-40 text-center text-13 text-stone">
              {busqueda
                ? "No se encontraron artículos con esa búsqueda."
                : "No hay artículos en esta vista."}
            </div>
          ) : (
            itemsFiltrados.map(item => {
              const estaAgotado = item.disponible === false;
              const cargando = actualizandoId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-12 pt-8 pb-4 first:pt-0 ${
                    estaAgotado ? "opacity-75" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-8 flex-wrap">
                      <span
                        className={`text-14 font-medium break-words ${
                          estaAgotado ? "text-stone line-through" : "text-ash-graphite"
                        }`}
                      >
                        {item.nombre}
                      </span>
                      <span className="rounded-md bg-ghost-fog px-6 py-2 text-10 font-medium text-stone border border-concrete/60">
                        {item.categoriaNombre}
                      </span>
                      {estaAgotado && (
                        <span className="rounded-md bg-stone/15 px-6 py-2 text-10 font-semibold text-stone border border-stone/30">
                          86 Agotado
                        </span>
                      )}
                    </div>
                    <span className="mt-2 block text-12 font-mono text-sage-green">
                      ${item.precio.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStock(item)}
                    disabled={cargando}
                    className={`flex h-44 min-w-[110px] items-center justify-center gap-6 rounded-lg border px-12 text-12 font-medium transition-all active:scale-95 disabled:opacity-50 ${
                      estaAgotado
                        ? "border-concrete bg-canvas-white text-stone hover:border-ash-graphite hover:text-ash-graphite"
                        : "border-success/30 bg-success/15 text-[#087645] hover:bg-success/25"
                    }`}
                  >
                    {cargando ? (
                      <span className="text-11">Guardando...</span>
                    ) : estaAgotado ? (
                      <>
                        <span className="material-symbols-outlined text-16">close</span>
                        <span>86 Agotado</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-16">check</span>
                        <span>En stock</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-concrete bg-ghost-fog/20 px-20 py-14 sm:px-24 flex items-center justify-between">
          <span className="text-11 text-stone">
            Los cambios se reflejan al instante en las mesas vía SSE.
          </span>
          <button
            onClick={onClose}
            className="flex h-44 items-center justify-center rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-medium text-ash-graphite hover:bg-ghost-fog shadow-2xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
