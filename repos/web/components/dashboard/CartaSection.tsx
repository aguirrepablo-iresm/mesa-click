"use client";
import { useState, useEffect, useCallback } from "react";
import { api, CategoriaAPI, ArticuloAPI, getErrorMessage } from "@/lib/api";

export interface CategoriaConItems extends CategoriaAPI {
  items: ArticuloAPI[];
}

type NuevoItemForm = { nombre: string; descripcion: string; precio: string };
type NuevoItemErrors = Partial<Record<"nombre" | "precio", string>>;

export default function CartaSection() {
  const [categorias, setCategorias] = useState<CategoriaConItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [mostrarFormCat, setMostrarFormCat] = useState(false);
  const [mostrarFormItem, setMostrarFormItem] = useState<string | null>(null);
  const [nuevoItem, setNuevoItem] = useState<NuevoItemForm>({ nombre: '', descripcion: '', precio: '' });
  const [nuevoItemErrors, setNuevoItemErrors] = useState<NuevoItemErrors>({});
  const [errorMsg, setErrorMsg] = useState('');

  const cargarCarta = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [cats, arts] = await Promise.all([
        api.listarCategorias(),
        api.listarArticulos(),
      ]);

      if (cats && cats.length > 0) {
        const combinadas: CategoriaConItems[] = cats.map(c => ({
          ...c,
          items: arts ? arts.filter(a => a.categoria_id === c.id) : [],
        }));
        setCategorias(combinadas);
      } else {
        setCategorias([]);
      }
    } catch (err: unknown) {
      console.error("Error al cargar la carta desde la API:", err);
      setCategorias([]);
      setErrorMsg(getErrorMessage(err, 'Error al conectar con la API de carta.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void cargarCarta();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargarCarta]);

  const agregarCategoria = async () => {
    if (!nuevaCatNombre.trim()) return;
    setErrorMsg('');

    try {
      const creada = await api.crearCategoria(nuevaCatNombre.trim(), categorias.length);
      setCategorias(prev => [
        ...prev,
        { ...creada, items: [] },
      ]);
      setNuevaCatNombre('');
      setMostrarFormCat(false);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al crear la categoría.'));
    }
  };

  const eliminarCategoria = async (catId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus ítems?')) return;
    try {
      await api.eliminarCategoria(catId);
      setCategorias(prev => prev.filter(c => c.id !== catId));
    } catch (err: unknown) {
      console.error("No se pudo eliminar categoría:", err);
      setErrorMsg(getErrorMessage(err, 'Error al eliminar categoría.'));
    }
  };

  const agregarItem = async (catId: string) => {
    const errores: NuevoItemErrors = {};
    if (!nuevoItem.nombre.trim()) {
      errores.nombre = 'Falta completar el nombre del ítem.';
    }
    if (!nuevoItem.precio.trim()) {
      errores.precio = 'Falta completar el precio del ítem.';
    }

    if (Object.keys(errores).length > 0) {
      setNuevoItemErrors(errores);
      setErrorMsg('');
      return;
    }

    const precioNum = parseFloat(nuevoItem.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setNuevoItemErrors({ precio: 'Ingresa un precio válido mayor a 0.' });
      setErrorMsg('');
      return;
    }
    setNuevoItemErrors({});
    setErrorMsg('');

    try {
      const creado = await api.crearArticulo({
        categoria_id: catId,
        nombre: nuevoItem.nombre.trim(),
        descripcion: nuevoItem.descripcion.trim(),
        precio: precioNum,
        activo: true,
      });

      setCategorias(prev =>
        prev.map(c => c.id === catId ? { ...c, items: [...c.items, creado] } : c)
      );
      setNuevoItem({ nombre: '', descripcion: '', precio: '' });
      setMostrarFormItem(null);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al crear el artículo.'));
    }
  };

  const eliminarItem = async (catId: string, itemId: string) => {
    if (!confirm('¿Eliminar este ítem?')) return;
    try {
      await api.eliminarArticulo(itemId);
      setCategorias(prev =>
        prev.map(c =>
          c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
        )
      );
    } catch (err: unknown) {
      console.error("No se pudo eliminar artículo:", err);
      setErrorMsg(getErrorMessage(err, 'Error al eliminar artículo.'));
    }
  };

  const toggleDisponible = async (catId: string, item: ArticuloAPI) => {
    const nuevoEstado = !(item.activo !== false);
    try {
      await api.actualizarArticulo(item.id, { activo: nuevoEstado });
      setCategorias(prev =>
        prev.map(c =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map(i =>
                  i.id === item.id ? { ...i, activo: nuevoEstado } : i
                ),
              }
            : c
        )
      );
    } catch (err: unknown) {
      console.error("No se pudo actualizar disponibilidad:", err);
      setErrorMsg(getErrorMessage(err, 'Error al actualizar disponibilidad.'));
    }
  };

  const totalItems = categorias.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="p-24 md:p-32 space-y-24 overflow-y-auto h-full font-inter">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-20 font-medium text-ash-graphite">Gestión de Carta</h2>
          <p className="text-13 text-sage-green mt-4">
            {categorias.length} categorías · {totalItems} ítems {loading && "(cargando...)"}
          </p>
        </div>
        <button
          onClick={() => setMostrarFormCat(true)}
          className="px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          + Nueva categoría
        </button>
      </div>

      {errorMsg && (
        <div className="p-10 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red">
          {errorMsg}
        </div>
      )}

      {mostrarFormCat && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 p-16 border border-plain-green rounded-md bg-ghost-fog">
          <input
            className="flex-1 px-12 py-8 text-13 bg-canvas-white rounded-md border border-ash-graphite focus:border-plain-green outline-none"
            placeholder="Nombre de la categoría"
            value={nuevaCatNombre}
            onChange={e => setNuevaCatNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
            autoFocus
          />
          <div className="flex items-center gap-8 justify-end">
            <button
              onClick={agregarCategoria}
              className="flex-1 sm:flex-initial px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90"
            >
              Agregar
            </button>
            <button
              onClick={() => setMostrarFormCat(false)}
              className="px-12 py-8 text-sage-green text-13 hover:text-ash-graphite"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-16">
        {categorias.map(cat => (
          <div key={cat.id} className="border border-ash-graphite rounded-lg overflow-hidden bg-canvas-white">
            <div className="flex items-center justify-between px-16 sm:px-20 py-12 bg-vanilla-cream border-b border-ash-graphite">
              <h3 className="text-15 font-medium text-ash-graphite truncate pr-8">{cat.nombre}</h3>
              <div className="flex items-center gap-8 shrink-0">
                <button
                  onClick={() => {
                    setMostrarFormItem(cat.id);
                    setNuevoItem({ nombre: '', descripcion: '', precio: '' });
                    setNuevoItemErrors({});
                  }}
                  className="px-10 py-4 text-12 font-medium text-plain-green-muted border border-plain-green-muted rounded-md hover:bg-ghost-fog transition-colors"
                >
                  + Ítem
                </button>
                <button
                  onClick={() => eliminarCategoria(cat.id)}
                  className="px-10 py-4 text-12 font-medium text-alert-red border border-alert-red rounded-md hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="divide-y divide-ghost-fog">
              {cat.items.map(item => {
                const visible = item.activo !== false;

                return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 px-16 sm:px-20 py-12">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-8 flex-wrap">
                      <span className="text-13 font-medium text-ash-graphite">{item.nombre}</span>
                      {!visible && (
                        <span className="px-6 py-1 text-10 font-medium bg-vanilla-cream text-sage-green rounded-md border border-ghost-fog">
                          No disponible
                        </span>
                      )}
                    </div>
                    {item.descripcion && (
                      <p className="text-12 text-sage-green line-clamp-2 mt-2">{item.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-16 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-ghost-fog/60">
                    <span className="text-13 font-medium text-ash-graphite font-mono">
                      ${item.precio.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-12">
                      <button
                        onClick={() => toggleDisponible(cat.id, item)}
                        className={`inline-flex items-center gap-4 px-8 py-4 text-11 font-medium rounded-md border transition-colors ${
                          visible
                            ? "text-plain-green-muted border-plain-green-muted bg-ghost-fog hover:bg-canvas-white"
                            : "text-sage-green border-ghost-fog bg-vanilla-cream hover:bg-ghost-fog"
                        }`}
                        title={visible ? "Ocultar del menú público" : "Mostrar en el menú público"}
                      >
                        <span className="material-symbols-outlined text-16">
                          {visible ? "visibility" : "visibility_off"}
                        </span>
                        {visible ? 'Visible en menú' : 'Oculto en menú'}
                      </button>
                      <button
                        onClick={() => eliminarItem(cat.id, item.id)}
                        className="p-4 text-12 text-alert-red hover:opacity-70 font-medium"
                        title="Eliminar artículo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}

              {cat.items.length === 0 && mostrarFormItem !== cat.id && (
                <p className="px-20 py-12 text-13 text-sage-green italic">Sin ítems aún.</p>
              )}

              {mostrarFormItem === cat.id && (
                <div className="px-16 sm:px-20 py-16 bg-ghost-fog space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(150px,1fr)] gap-8">
                    <div className="space-y-4">
                      <input
                        className={`w-full px-10 py-6 text-13 bg-canvas-white rounded-md border outline-none focus:border-plain-green ${
                          nuevoItemErrors.nombre ? "border-alert-red" : "border-ash-graphite"
                        }`}
                        placeholder="Nombre del ítem *"
                        value={nuevoItem.nombre}
                        onChange={e => {
                          setNuevoItem(p => ({ ...p, nombre: e.target.value }));
                          setNuevoItemErrors(p => ({ ...p, nombre: undefined }));
                        }}
                        aria-invalid={Boolean(nuevoItemErrors.nombre)}
                        autoFocus
                      />
                      {nuevoItemErrors.nombre && (
                        <p className="text-11 text-alert-red">{nuevoItemErrors.nombre}</p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className={`w-full px-12 py-6 text-14 bg-canvas-white rounded-md border outline-none focus:border-plain-green ${
                          nuevoItemErrors.precio ? "border-alert-red" : "border-ash-graphite"
                        }`}
                        placeholder="Precio *"
                        value={nuevoItem.precio}
                        onChange={e => {
                          setNuevoItem(p => ({ ...p, precio: e.target.value }));
                          setNuevoItemErrors(p => ({ ...p, precio: undefined }));
                        }}
                        aria-invalid={Boolean(nuevoItemErrors.precio)}
                      />
                      {nuevoItemErrors.precio && (
                        <p className="text-11 text-alert-red">{nuevoItemErrors.precio}</p>
                      )}
                    </div>
                  </div>
                  <input
                    className="w-full px-10 py-6 text-13 bg-canvas-white rounded-md border border-ash-graphite outline-none focus:border-plain-green"
                    placeholder="Descripción (opcional)"
                    value={nuevoItem.descripcion}
                    onChange={e => setNuevoItem(p => ({ ...p, descripcion: e.target.value }))}
                  />
                  <div className="flex items-center gap-8 pt-4">
                    <button
                      type="button"
                      onClick={() => agregarItem(cat.id)}
                      className="px-14 py-6 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 whitespace-nowrap"
                    >
                      Agregar ítem
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormItem(null);
                        setNuevoItemErrors({});
                      }}
                      className="px-12 py-6 text-sage-green text-13 hover:text-ash-graphite"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {categorias.length === 0 && !loading && (
          <div className="text-center py-40 text-sage-green text-13">
            No hay categorías. Creá la primera para empezar.
          </div>
        )}
      </div>
    </div>
  );
}
