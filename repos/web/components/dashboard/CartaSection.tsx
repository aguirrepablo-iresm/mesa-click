"use client";
import { useState } from "react";
import { mockMenu, Categoria, MenuItem } from "@/lib/mock/menu";

type NuevoItemForm = { nombre: string; descripcion: string; precio: string };

export default function CartaSection() {
  const [categorias, setCategorias] = useState<Categoria[]>(mockMenu);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [mostrarFormCat, setMostrarFormCat] = useState(false);
  const [mostrarFormItem, setMostrarFormItem] = useState<string | null>(null);
  const [nuevoItem, setNuevoItem] = useState<NuevoItemForm>({ nombre: '', descripcion: '', precio: '' });

  const agregarCategoria = () => {
    if (!nuevaCatNombre.trim()) return;
    setCategorias(prev => [
      ...prev,
      { id: crypto.randomUUID(), nombre: nuevaCatNombre.trim(), items: [] },
    ]);
    setNuevaCatNombre('');
    setMostrarFormCat(false);
  };

  const eliminarCategoria = (catId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus ítems?')) return;
    setCategorias(prev => prev.filter(c => c.id !== catId));
  };

  const agregarItem = (catId: string) => {
    if (!nuevoItem.nombre.trim() || !nuevoItem.precio) return;
    const item: MenuItem = {
      id: crypto.randomUUID(),
      nombre: nuevoItem.nombre.trim(),
      descripcion: nuevoItem.descripcion.trim(),
      precio: parseFloat(nuevoItem.precio),
      disponible: true,
    };
    setCategorias(prev =>
      prev.map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c)
    );
    setNuevoItem({ nombre: '', descripcion: '', precio: '' });
    setMostrarFormItem(null);
  };

  const eliminarItem = (catId: string, itemId: string) => {
    if (!confirm('¿Eliminar este ítem?')) return;
    setCategorias(prev =>
      prev.map(c =>
        c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
      )
    );
  };

  const toggleDisponible = (catId: string, itemId: string) => {
    setCategorias(prev =>
      prev.map(c =>
        c.id === catId
          ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, disponible: !i.disponible } : i) }
          : c
      )
    );
  };

  const totalItems = categorias.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="p-24 md:p-32 space-y-24 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-20 font-medium text-ash-graphite">Gestión de Carta</h2>
          <p className="text-13 text-sage-green mt-4">
            {categorias.length} categorías · {totalItems} ítems
          </p>
        </div>
        <button
          onClick={() => setMostrarFormCat(true)}
          className="px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity"
        >
          + Nueva categoría
        </button>
      </div>

      {mostrarFormCat && (
        <div className="flex items-center gap-8 p-16 border border-plain-green rounded-md bg-ghost-fog">
          <input
            className="flex-1 px-12 py-8 text-13 rounded-md"
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
                    <p className="text-12 text-sage-green truncate">{item.descripcion}</p>
                  </div>
                  <span className="text-13 font-medium text-ash-graphite font-mono">
                    ${item.precio.toLocaleString()}
                  </span>
                  <button
                    onClick={() => toggleDisponible(cat.id, item.id)}
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
                      className="flex-1 px-10 py-6 text-13 rounded-md"
                      placeholder="Nombre del ítem *"
                      value={nuevoItem.nombre}
                      onChange={e => setNuevoItem(p => ({ ...p, nombre: e.target.value }))}
                      autoFocus
                    />
                    <input
                      type="number"
                      className="w-100 px-10 py-6 text-13 rounded-md"
                      placeholder="Precio *"
                      value={nuevoItem.precio}
                      onChange={e => setNuevoItem(p => ({ ...p, precio: e.target.value }))}
                    />
                  </div>
                  <input
                    className="w-full px-10 py-6 text-13 rounded-md"
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

        {categorias.length === 0 && (
          <div className="text-center py-40 text-sage-green text-13">
            No hay categorías. Creá la primera para empezar.
          </div>
        )}
      </div>
    </div>
  );
}
