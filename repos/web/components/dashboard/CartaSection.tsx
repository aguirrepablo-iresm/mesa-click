"use client";
import { useState, useEffect } from "react";
import { api, CategoriaAPI, ArticuloAPI } from "@/lib/api";
import { mockMenu } from "@/lib/mock/menu";

export interface CategoriaConItems extends CategoriaAPI {
  items: ArticuloAPI[];
}

type NuevoItemForm = { nombre: string; descripcion: string; precio: string };

export default function CartaSection() {
  const [categorias, setCategorias] = useState<CategoriaConItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [mostrarFormCat, setMostrarFormCat] = useState(false);
  const [mostrarFormItem, setMostrarFormItem] = useState<string | null>(null);
  const [nuevoItem, setNuevoItem] = useState<NuevoItemForm>({ nombre: '', descripcion: '', precio: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const cargarCarta = async () => {
    try {
      setLoading(true);
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
        // Fallback a estructura inicial si aún no hay en backend
        const fallback: CategoriaConItems[] = mockMenu.map(m => ({
          id: m.id,
          tenant_id: 'default',
          nombre: m.nombre,
          orden: 0,
          activa: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: m.items.map(i => ({
            id: i.id,
            tenant_id: 'default',
            categoria_id: m.id,
            nombre: i.nombre,
            descripcion: i.descripcion,
            precio: i.precio,
            imagen_url: '',
            disponible: i.disponible,
            orden: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })),
        }));
        setCategorias(fallback);
      }
    } catch (err: any) {
      console.warn("API de carta no disponible, usando mocks:", err);
      // Usar mocks como fallback
      const fallback: CategoriaConItems[] = mockMenu.map(m => ({
        id: m.id,
        tenant_id: 'default',
        nombre: m.nombre,
        orden: 0,
        activa: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: m.items.map(i => ({
          id: i.id,
          tenant_id: 'default',
          categoria_id: m.id,
          nombre: i.nombre,
          descripcion: i.descripcion,
          precio: i.precio,
          imagen_url: '',
          disponible: i.disponible,
          orden: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      }));
      setCategorias(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCarta();
  }, []);

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
    } catch (err: any) {
      // Si no hay API conectada, mantener fallback local
      setCategorias(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          tenant_id: 'local',
          nombre: nuevaCatNombre.trim(),
          orden: prev.length,
          activa: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [],
        },
      ]);
      setNuevaCatNombre('');
      setMostrarFormCat(false);
    }
  };

  const eliminarCategoria = async (catId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus ítems?')) return;
    try {
      await api.eliminarCategoria(catId);
    } catch (err) {
      console.warn("No se pudo eliminar categoría en back:", err);
    }
    setCategorias(prev => prev.filter(c => c.id !== catId));
  };

  const agregarItem = async (catId: string) => {
    if (!nuevoItem.nombre.trim() || !nuevoItem.precio) return;
    const precioNum = parseFloat(nuevoItem.precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorMsg('Ingresa un precio válido.');
      return;
    }
    setErrorMsg('');

    try {
      const creado = await api.crearArticulo({
        categoria_id: catId,
        nombre: nuevoItem.nombre.trim(),
        descripcion: nuevoItem.descripcion.trim(),
        precio: precioNum,
        disponible: true,
      });

      setCategorias(prev =>
        prev.map(c => c.id === catId ? { ...c, items: [...c.items, creado] } : c)
      );
    } catch (err) {
      // Fallback local
      const itemLocal: ArticuloAPI = {
        id: crypto.randomUUID(),
        tenant_id: 'local',
        categoria_id: catId,
        nombre: nuevoItem.nombre.trim(),
        descripcion: nuevoItem.descripcion.trim(),
        precio: precioNum,
        imagen_url: '',
        disponible: true,
        orden: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategorias(prev =>
        prev.map(c => c.id === catId ? { ...c, items: [...c.items, itemLocal] } : c)
      );
    }

    setNuevoItem({ nombre: '', descripcion: '', precio: '' });
    setMostrarFormItem(null);
  };

  const eliminarItem = async (catId: string, itemId: string) => {
    if (!confirm('¿Eliminar este ítem?')) return;
    try {
      await api.eliminarArticulo(itemId);
    } catch (err) {
      console.warn("No se pudo eliminar artículo en back:", err);
    }
    setCategorias(prev =>
      prev.map(c =>
        c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
      )
    );
  };

  const toggleDisponible = async (catId: string, item: ArticuloAPI) => {
    const nuevoEstado = !item.disponible;
    try {
      await api.actualizarArticulo(item.id, { disponible: nuevoEstado });
    } catch (err) {
      console.warn("No se pudo actualizar disponibilidad en back:", err);
    }
    setCategorias(prev =>
      prev.map(c =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map(i =>
                i.id === item.id ? { ...i, disponible: nuevoEstado } : i
              ),
            }
          : c
      )
    );
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
        <div className="flex items-center gap-8 p-16 border border-plain-green rounded-md bg-ghost-fog">
          <input
            className="flex-1 px-12 py-8 text-13 bg-canvas-white rounded-md border border-ash-graphite focus:border-plain-green outline-none"
            placeholder="Nombre de la categoría"
            value={nuevaCatNombre}
            onChange={e => setNuevaCatNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
            autoFocus
          />
          <button
            onClick={agregarCategoria}
            className="px-12 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md"
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
      )}

      <div className="space-y-16">
        {categorias.map(cat => (
          <div key={cat.id} className="border border-ash-graphite rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-20 py-12 bg-vanilla-cream border-b border-ash-graphite">
              <h3 className="text-15 font-medium text-ash-graphite">{cat.nombre}</h3>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => {
                    setMostrarFormItem(cat.id);
                    setNuevoItem({ nombre: '', descripcion: '', precio: '' });
                  }}
                  className="px-10 py-4 text-12 font-medium text-plain-green-muted border border-plain-green-muted rounded-md hover:bg-ghost-fog"
                >
                  + Ítem
                </button>
                <button
                  onClick={() => eliminarCategoria(cat.id)}
                  className="px-10 py-4 text-12 font-medium text-alert-red border border-alert-red rounded-md hover:bg-red-50"
                >
                  Eliminar cat.
                </button>
              </div>
            </div>

            <div className="divide-y divide-ghost-fog">
              {cat.items.map(item => (
                <div key={item.id} className="flex items-center gap-16 px-20 py-12">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-8">
                      <span className="text-13 font-medium text-ash-graphite">{item.nombre}</span>
                      {!item.disponible && (
                        <span className="px-6 py-1 text-10 font-medium bg-vanilla-cream text-sage-green rounded-md border border-ghost-fog">
                          No disponible
                        </span>
                      )}
                    </div>
                    {item.descripcion && (
                      <p className="text-12 text-sage-green truncate">{item.descripcion}</p>
                    )}
                  </div>
                  <span className="text-13 font-medium text-ash-graphite font-mono">
                    ${item.precio.toLocaleString()}
                  </span>
                  <button
                    onClick={() => toggleDisponible(cat.id, item)}
                    className="text-12 font-medium text-sage-green hover:text-ash-graphite underline"
                  >
                    {item.disponible ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    onClick={() => eliminarItem(cat.id, item.id)}
                    className="text-12 text-alert-red hover:opacity-70 font-medium"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {cat.items.length === 0 && mostrarFormItem !== cat.id && (
                <p className="px-20 py-12 text-13 text-sage-green italic">Sin ítems aún.</p>
              )}

              {mostrarFormItem === cat.id && (
                <div className="px-20 py-16 bg-ghost-fog space-y-8">
                  <div className="flex gap-8">
                    <input
                      className="flex-1 px-10 py-6 text-13 bg-canvas-white rounded-md border border-ash-graphite"
                      placeholder="Nombre del ítem *"
                      value={nuevoItem.nombre}
                      onChange={e => setNuevoItem(p => ({ ...p, nombre: e.target.value }))}
                      autoFocus
                    />
                    <input
                      type="number"
                      className="w-100 px-10 py-6 text-13 bg-canvas-white rounded-md border border-ash-graphite"
                      placeholder="Precio *"
                      value={nuevoItem.precio}
                      onChange={e => setNuevoItem(p => ({ ...p, precio: e.target.value }))}
                    />
                  </div>
                  <input
                    className="w-full px-10 py-6 text-13 bg-canvas-white rounded-md border border-ash-graphite"
                    placeholder="Descripción (opcional)"
                    value={nuevoItem.descripcion}
                    onChange={e => setNuevoItem(p => ({ ...p, descripcion: e.target.value }))}
                  />
                  <div className="flex gap-8">
                    <button
                      onClick={() => agregarItem(cat.id)}
                      className="px-12 py-6 bg-plain-green text-ash-graphite text-13 font-medium rounded-md"
                    >
                      Agregar ítem
                    </button>
                    <button
                      onClick={() => setMostrarFormItem(null)}
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
