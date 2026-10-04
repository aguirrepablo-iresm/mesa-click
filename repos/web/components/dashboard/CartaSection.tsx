"use client";
import { useState, useEffect, useCallback } from "react";
import { api, CategoriaAPI, ArticuloAPI, FranjaHorariaAPI, getErrorMessage } from "@/lib/api";
import { EmptyState, Skeleton, useToast, useConfirm } from "@/components/ui";
import ImportarCartaModal from "@/components/dashboard/ImportarCartaModal";
import AjustePreciosModal from "./AjustePreciosModal";
import FranjasHorariasModal from "./FranjasHorariasModal";

export interface CategoriaConItems extends CategoriaAPI {
  items: ArticuloAPI[];
}

type NuevoItemForm = { nombre: string; descripcion: string; precio: string };
type NuevoItemErrors = Partial<Record<"nombre" | "precio", string>>;

type SelectorFranjaCategoriaProps = {
  categoria: CategoriaConItems;
  franjas: FranjaHorariaAPI[];
  abierto: boolean;
  guardando: boolean;
  onToggle: () => void;
  onSelect: (franjaId: string) => void;
};

function SelectorFranjaCategoria({
  categoria,
  franjas,
  abierto,
  guardando,
  onToggle,
  onSelect,
}: SelectorFranjaCategoriaProps) {
  const franjaActual = franjas.find(franja => franja.id === categoria.franja_horaria_id);

  return (
    <div className="relative min-w-0 flex-1 sm:w-[190px] sm:flex-none" onClick={event => event.stopPropagation()}>
      <button
        type="button"
        disabled={guardando}
        onClick={event => {
          event.stopPropagation();
          onToggle();
        }}
        className={`group flex h-44 w-full min-w-0 items-center gap-8 rounded-lg border px-10 text-left transition-all disabled:cursor-wait disabled:opacity-60 ${
          franjaActual
            ? "border-plain-green/30 bg-plain-green/[0.07] hover:border-plain-green/55"
            : "border-concrete bg-canvas-white hover:border-stone hover:bg-ghost-fog"
        }`}
        aria-label={`Cambiar horario de ${categoria.nombre}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className={`material-symbols-outlined shrink-0 text-18 ${franjaActual ? 'text-plain-green' : 'text-sage-green'}`}>
          schedule
        </span>
        <span className="min-w-0 flex-1 truncate text-11 font-semibold text-ash-graphite">
          {franjaActual?.nombre || 'Todo el día'}
        </span>
        <span className={`material-symbols-outlined shrink-0 text-18 text-sage-green transition-transform ${abierto ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {abierto && (
        <div
          role="listbox"
          aria-label={`Horario de ${categoria.nombre}`}
          className="absolute right-0 top-[50px] z-40 w-[260px] overflow-hidden rounded-xl border border-concrete bg-canvas-white p-6 shadow-xl"
        >
          <div className="px-12 pb-8 pt-6 text-center">
            <p className="text-10 font-semibold uppercase tracking-[0.08em] text-sage-green">Disponibilidad horaria</p>
            <p className="mt-2 text-10 text-sage-green">Opcional para toda la categoría</p>
          </div>

          <button
            type="button"
            role="option"
            aria-selected={!categoria.franja_horaria_id}
            onClick={() => onSelect('')}
            className={`flex min-h-48 w-full items-center gap-8 rounded-lg px-10 py-8 text-left transition-colors ${
              !categoria.franja_horaria_id ? 'bg-plain-green/[0.08]' : 'hover:bg-ghost-fog'
            }`}
          >
            <span className="flex h-30 w-30 shrink-0 items-center justify-center rounded-lg bg-ghost-fog text-sage-green">
              <span className="material-symbols-outlined text-18">all_inclusive</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-12 font-semibold text-ash-graphite">Siempre disponible</span>
              <span className="block truncate text-10 text-sage-green">Sin restricción horaria</span>
            </span>
            {!categoria.franja_horaria_id && (
              <span className="material-symbols-outlined shrink-0 text-18 text-plain-green">check</span>
            )}
          </button>

          {franjas.map(franja => {
            const seleccionada = categoria.franja_horaria_id === franja.id;
            return (
              <button
                key={franja.id}
                type="button"
                role="option"
                aria-selected={seleccionada}
                onClick={() => onSelect(franja.id)}
                className={`mt-2 flex min-h-48 w-full items-center gap-8 rounded-lg px-10 py-8 text-left transition-colors ${
                  seleccionada ? 'bg-plain-green/[0.08]' : 'hover:bg-ghost-fog'
                }`}
              >
                <span className={`flex h-30 w-30 shrink-0 items-center justify-center rounded-lg ${
                  seleccionada ? 'bg-plain-green/15 text-plain-green' : 'bg-ghost-fog text-sage-green'
                }`}>
                  <span className="material-symbols-outlined text-18">schedule</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-12 font-semibold text-ash-graphite">{franja.nombre}</span>
                  <span className="block font-mono text-10 text-sage-green">{franja.hora_inicio} — {franja.hora_fin}</span>
                </span>
                {seleccionada && (
                  <span className="material-symbols-outlined shrink-0 text-18 text-plain-green">check</span>
                )}
              </button>
            );
          })}

          {franjas.length === 0 && (
            <p className="mx-8 mb-6 mt-8 rounded-lg bg-ghost-fog px-10 py-8 text-10 leading-relaxed text-sage-green">
              Creá una franja desde el botón Horarios para poder limitar esta categoría.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CartaSection() {
  const toast = useToast();
  const confirmar = useConfirm();
  const [categorias, setCategorias] = useState<CategoriaConItems[]>([]);
  const [franjas, setFranjas] = useState<FranjaHorariaAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');
  const [mostrarFormCat, setMostrarFormCat] = useState(false);
  const [mostrarFormItem, setMostrarFormItem] = useState<string | null>(null);
  const [nuevoItem, setNuevoItem] = useState<NuevoItemForm>({ nombre: '', descripcion: '', precio: '' });
  const [nuevoItemErrors, setNuevoItemErrors] = useState<NuevoItemErrors>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [articuloVariantesAbierto, setArticuloVariantesAbierto] = useState<string | null>(null);
  const [nuevaVariante, setNuevaVariante] = useState<{
    nombre: string;
    grupo: string;
    precioAdicional: string;
    seleccionUnica: boolean;
  }>({
    nombre: '',
    grupo: '',
    precioAdicional: '0',
    seleccionUnica: false,
  });
  const [guardandoVariante, setGuardandoVariante] = useState(false);
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [mostrarAjustePrecios, setMostrarAjustePrecios] = useState(false);
  const [mostrarFranjasHorarias, setMostrarFranjasHorarias] = useState(false);
  const [guardandoHorarioId, setGuardandoHorarioId] = useState<string | null>(null);
  const [menuHorarioCategoriaAbierto, setMenuHorarioCategoriaAbierto] = useState<string | null>(null);
  const [menuCategoriaAbierto, setMenuCategoriaAbierto] = useState<string | null>(null);
  const [menuItemAbierto, setMenuItemAbierto] = useState<string | null>(null);

  const cargarCarta = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [cats, arts, franjasConfiguradas] = await Promise.all([
        api.listarCategorias(),
        api.listarArticulos(),
        api.listarFranjasHorarias(),
      ]);

      setFranjas(franjasConfiguradas || []);

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

  useEffect(() => {
    const cerrarMenus = () => {
      setMenuHorarioCategoriaAbierto(null);
      setMenuCategoriaAbierto(null);
      setMenuItemAbierto(null);
    };
    window.addEventListener("click", cerrarMenus);
    return () => window.removeEventListener("click", cerrarMenus);
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
      toast.success('Categoría creada correctamente.');
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al crear la categoría.'));
    }
  };

  const eliminarCategoria = async (catId: string) => {
    const ok = await confirmar({
      titulo: 'Eliminar categoría',
      mensaje: '¿Eliminás esta categoría y todos sus ítems? Esta acción no se puede deshacer.',
      labelAceptar: 'Sí, eliminar',
      variante: 'danger',
    });
    if (!ok) return;
    try {
      await api.eliminarCategoria(catId);
      setCategorias(prev => prev.filter(c => c.id !== catId));
      toast.success('Categoría eliminada.');
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
      toast.success('Ítem agregado a la carta.');
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, 'Error al crear el artículo.'));
    }
  };

  const eliminarItem = async (catId: string, itemId: string) => {
    const ok = await confirmar({
      titulo: 'Eliminar ítem',
      mensaje: '¿Eliminás este ítem del menú? Esta acción no se puede deshacer.',
      labelAceptar: 'Sí, eliminar',
      variante: 'danger',
    });
    if (!ok) return;
    try {
      await api.eliminarArticulo(itemId);
      setCategorias(prev =>
        prev.map(c =>
          c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
        )
      );
      toast.success('Ítem eliminado.');
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
      toast.success(
        item.activo !== false
          ? 'Ítem ocultado del menú público.'
          : 'Ítem visible en el menú público.'
      );
    } catch (err: unknown) {
      console.error("No se pudo actualizar visibilidad:", err);
      setErrorMsg(getErrorMessage(err, 'Error al actualizar visibilidad.'));
    }
  };

  const toggleStock = async (catId: string, item: ArticuloAPI) => {
    const nuevoStock = !(item.disponible !== false);
    try {
      await api.actualizarDisponibilidadArticulo(item.id, nuevoStock);
      setCategorias(prev =>
        prev.map(c =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map(i =>
                  i.id === item.id ? { ...i, disponible: nuevoStock } : i
                ),
              }
            : c
        )
      );
      toast.success(
        nuevoStock
          ? `${item.nombre} marcado como disponible.`
          : `${item.nombre} marcado como agotado (86).`
      );
    } catch (err: unknown) {
      console.error("No se pudo actualizar stock:", err);
      setErrorMsg(getErrorMessage(err, 'Error al actualizar stock.'));
    }
  };

  const handleReponerTodos = async () => {
    const ok = await confirmar({
      titulo: 'Reponer stock de la carta',
      mensaje: '¿Deseas restablecer el stock de todos los artículos de la carta para el servicio de hoy?',
      labelAceptar: 'Sí, reponer stock',
    });
    if (!ok) return;

    try {
      const res = await api.reponerTodosLosArticulos();
      await cargarCarta();
      toast.success(`Se repuso el stock de ${res.repuestos} productos.`);
    } catch (err: unknown) {
      console.error("Error al reponer stock:", err);
      setErrorMsg(getErrorMessage(err, 'Error al reponer stock.'));
    }
  };

  const asignarFranjaCategoria = async (categoriaId: string, franjaId: string) => {
    try {
      setGuardandoHorarioId(categoriaId);
      const actualizada = await api.asignarFranjaCategoria(categoriaId, franjaId || null);
      setCategorias(prev => prev.map(categoria => (
        categoria.id === categoriaId
          ? { ...categoria, franja_horaria_id: actualizada.franja_horaria_id }
          : categoria
      )));
      setMenuHorarioCategoriaAbierto(null);
      toast.success(franjaId ? "Horario aplicado a la categoría." : "La categoría quedó disponible todo el día.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el horario."));
    } finally {
      setGuardandoHorarioId(null);
    }
  };

  const asignarFranjaArticulo = async (categoriaId: string, articuloId: string, franjaId: string) => {
    try {
      setGuardandoHorarioId(articuloId);
      const actualizado = await api.asignarFranjaArticulo(articuloId, franjaId || null);
      setCategorias(prev => prev.map(categoria => (
        categoria.id === categoriaId
          ? {
              ...categoria,
              items: categoria.items.map(item => item.id === articuloId
                ? { ...item, franja_horaria_id: actualizado.franja_horaria_id }
                : item),
            }
          : categoria
      )));
      setMenuItemAbierto(null);
      toast.success(franjaId ? "Horario propio aplicado al producto." : "El producto vuelve a heredar el horario de su categoría.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el horario."));
    } finally {
      setGuardandoHorarioId(null);
    }
  };

  const agregarVariante = async (catId: string, articuloId: string) => {
    if (!nuevaVariante.nombre.trim()) {
      toast.error('Ingresá el nombre de la opción.');
      return;
    }
    const precio = parseFloat(nuevaVariante.precioAdicional || '0');
    if (isNaN(precio) || precio < 0) {
      toast.error('El precio adicional debe ser 0 o mayor.');
      return;
    }

    try {
      setGuardandoVariante(true);
      const creada = await api.crearVariante(articuloId, {
        nombre: nuevaVariante.nombre.trim(),
        grupo: nuevaVariante.grupo.trim() || undefined,
        precio_adicional: precio,
        seleccion_unica: nuevaVariante.seleccionUnica,
      });

      setCategorias(prev =>
        prev.map(c =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map(i =>
                  i.id === articuloId
                    ? { ...i, variantes: [...(i.variantes || []), creada] }
                    : i
                ),
              }
            : c
        )
      );

      setNuevaVariante(prev => ({
        nombre: '',
        grupo: prev.grupo,
        precioAdicional: '0',
        seleccionUnica: prev.seleccionUnica,
      }));
      toast.success('Opción agregada.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al agregar opción.'));
    } finally {
      setGuardandoVariante(false);
    }
  };

  const eliminarVariante = async (catId: string, articuloId: string, varianteId: string) => {
    const ok = await confirmar({
      titulo: 'Eliminar opción',
      mensaje: '¿Eliminás esta opción de personalización?',
      labelAceptar: 'Sí, eliminar',
      variante: 'danger',
    });
    if (!ok) return;
    try {
      await api.eliminarVariante(varianteId);
      setCategorias(prev =>
        prev.map(c =>
          c.id === catId
            ? {
                ...c,
                items: c.items.map(i =>
                  i.id === articuloId
                    ? { ...i, variantes: (i.variantes || []).filter(v => v.id !== varianteId) }
                    : i
                ),
              }
            : c
        )
      );
      toast.success('Opción eliminada.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al eliminar opción.'));
    }
  };

  const totalItems = categorias.reduce((n, c) => n + c.items.length, 0);

  const handlePreciosActualizados = async (actualizados: number) => {
    await cargarCarta();
    toast.success(
      `Se ${actualizados === 1 ? "actualizó" : "actualizaron"} ${actualizados} ${
        actualizados === 1 ? "producto" : "productos"
      }.`
    );
  };

  return (
    <div className="h-full space-y-24 overflow-y-auto bg-ghost-fog/45 p-16 font-inter sm:p-24 md:p-32">
      <div className="flex flex-col justify-between gap-16 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <h2 className="text-24 font-semibold tracking-[-0.02em] text-ash-graphite sm:text-32">
            Gestión de Carta
          </h2>
          <p className="mt-4 text-13 text-sage-green sm:text-14">
            {loading ? 'Cargando carta...' : `${categorias.length} categorías · ${totalItems} ítems`}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:flex xl:shrink-0">
          <button
            type="button"
            onClick={() => setMostrarFranjasHorarias(true)}
            className="flex h-48 items-center justify-center gap-8 rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-semibold text-ash-graphite shadow-sm transition-colors hover:border-stone hover:bg-vanilla-cream"
          >
            <span className="material-symbols-outlined text-18">schedule</span>
            Horarios
          </button>
          <button
            type="button"
            onClick={() => setModalImportarAbierto(true)}
            className="flex h-48 items-center justify-center gap-8 rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-semibold text-ash-graphite shadow-sm transition-colors hover:border-stone hover:bg-vanilla-cream"
          >
            <span className="material-symbols-outlined text-18">upload_file</span>
            Importar CSV/Excel
          </button>
          <button
            type="button"
            onClick={() => setMostrarAjustePrecios(true)}
            disabled={loading || totalItems === 0}
            className="flex h-48 items-center justify-center gap-8 rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-semibold text-ash-graphite shadow-sm transition-colors hover:border-stone hover:bg-vanilla-cream disabled:cursor-not-allowed disabled:opacity-40"
            title={totalItems === 0 ? "Agregá productos antes de ajustar precios" : undefined}
          >
            <span className="material-symbols-outlined text-18">percent</span>
            Ajustar precios
          </button>
          <button
            type="button"
            onClick={() => void handleReponerTodos()}
            disabled={loading || totalItems === 0}
            className="flex h-48 items-center justify-center gap-8 rounded-lg border border-concrete bg-canvas-white px-16 text-12 font-semibold text-ash-graphite shadow-sm transition-colors hover:border-stone hover:bg-vanilla-cream disabled:cursor-not-allowed disabled:opacity-40"
            title="Restablece el stock de todos los artículos de la carta"
          >
            <span className="material-symbols-outlined text-18">restart_alt</span>
            Reponer stock
          </button>
          <button
            type="button"
            onClick={() => setMostrarFormCat(true)}
            className="flex h-48 items-center justify-center gap-8 rounded-lg bg-plain-green px-20 text-13 font-semibold text-canvas-white shadow-sm transition-colors hover:bg-plain-green-muted"
          >
            <span className="material-symbols-outlined text-18">add</span>
            Nueva categoría
          </button>
        </div>
      </div>

      <ImportarCartaModal
        isOpen={modalImportarAbierto}
        onClose={() => setModalImportarAbierto(false)}
        onImportacionCompletada={() => void cargarCarta()}
      />

      {mostrarAjustePrecios && (
        <AjustePreciosModal
          categorias={categorias}
          onClose={() => setMostrarAjustePrecios(false)}
          onApplied={handlePreciosActualizados}
        />
      )}

      {mostrarFranjasHorarias && (
        <FranjasHorariasModal
          categorias={categorias}
          franjas={franjas}
          onClose={() => setMostrarFranjasHorarias(false)}
          onChanged={cargarCarta}
        />
      )}

      {errorMsg && (
        <div className="p-10 bg-red-50 border border-alert-red/30 rounded text-12 text-alert-red flex items-center justify-between gap-12">
          <span>{errorMsg}</span>
          <button
            onClick={() => void cargarCarta()}
            className="text-12 font-medium underline hover:no-underline shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {mostrarFormCat && (
        <div className="flex flex-col items-stretch gap-10 rounded-xl border border-concrete bg-canvas-white p-16 shadow-sm sm:flex-row sm:items-center">
          <input
            className="h-44 flex-1 rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green"
            placeholder="Nombre de la categoría"
            value={nuevaCatNombre}
            onChange={e => setNuevaCatNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
            autoFocus
          />
          <div className="flex items-center gap-8 justify-end">
            <button
              onClick={agregarCategoria}
              className="h-44 flex-1 rounded-lg bg-plain-green px-16 text-13 font-semibold text-canvas-white hover:bg-plain-green-muted sm:flex-initial"
            >
              Agregar
            </button>
            <button
              onClick={() => setMostrarFormCat(false)}
              className="h-44 rounded-lg px-12 text-13 text-sage-green hover:bg-ghost-fog hover:text-ash-graphite"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Skeleton de carga */}
      {loading && (
        <div className="space-y-16">
          {[1, 2, 3].map(i => (
            <div key={i} className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm">
              <Skeleton className="h-72 w-full rounded-none" />
              <div>
                {[1, 2].map(j => (
                  <div key={j} className="flex items-center justify-between px-20 py-16">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-12 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de categorías */}
      {!loading && (
        <div className="space-y-20">
          {categorias.map(cat => (
            <section key={cat.id} className="rounded-xl border border-concrete bg-canvas-white shadow-sm">
              <header className="flex flex-col justify-between gap-12 border-b border-concrete/70 px-16 py-16 sm:flex-row sm:items-center sm:px-20">
                <div className="min-w-0">
                  <h3 className="truncate text-16 font-semibold text-ash-graphite sm:text-20">{cat.nombre}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-6 text-12 text-sage-green">
                    <span>{cat.items.length} {cat.items.length === 1 ? 'ítem' : 'ítems'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cat.franja_horaria_id ? franjas.find(franja => franja.id === cat.franja_horaria_id)?.nombre || 'Horario configurado' : 'Siempre disponible'}</span>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-end gap-8 sm:w-auto">
                  <SelectorFranjaCategoria
                    categoria={cat}
                    franjas={franjas}
                    abierto={menuHorarioCategoriaAbierto === cat.id}
                    guardando={guardandoHorarioId === cat.id}
                    onToggle={() => {
                      setMenuHorarioCategoriaAbierto(actual => actual === cat.id ? null : cat.id);
                      setMenuCategoriaAbierto(null);
                      setMenuItemAbierto(null);
                    }}
                    onSelect={franjaId => void asignarFranjaCategoria(cat.id, franjaId)}
                  />
                  <button
                    onClick={() => {
                      setMostrarFormItem(cat.id);
                      setNuevoItem({ nombre: '', descripcion: '', precio: '' });
                      setNuevoItemErrors({});
                    }}
                    className="flex h-44 shrink-0 items-center gap-6 whitespace-nowrap rounded-lg border border-concrete bg-canvas-white px-10 text-12 font-semibold text-ash-graphite transition-colors hover:border-stone hover:bg-ghost-fog sm:px-12"
                  >
                    <span className="material-symbols-outlined text-18">add</span>
                    Agregar ítem
                  </button>
                  <div className="relative" onClick={event => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={event => {
                        event.stopPropagation();
                        setMenuCategoriaAbierto(actual => actual === cat.id ? null : cat.id);
                        setMenuHorarioCategoriaAbierto(null);
                        setMenuItemAbierto(null);
                      }}
                      className="flex h-44 w-44 items-center justify-center rounded-lg text-sage-green transition-colors hover:bg-ghost-fog hover:text-ash-graphite"
                      title="Más acciones de la categoría"
                      aria-label={`Más acciones de ${cat.nombre}`}
                      aria-expanded={menuCategoriaAbierto === cat.id}
                    >
                      <span className="material-symbols-outlined text-24">more_horiz</span>
                    </button>
                    {menuCategoriaAbierto === cat.id && (
                      <div className="absolute right-0 top-[48px] z-30 min-w-[190px] rounded-lg border border-concrete bg-canvas-white p-4 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuCategoriaAbierto(null);
                            void eliminarCategoria(cat.id);
                          }}
                          className="flex h-44 w-full items-center gap-8 rounded-md px-10 text-left text-12 font-medium text-alert-red transition-colors hover:bg-warm-pink/20"
                        >
                          <span className="material-symbols-outlined text-18">delete</span>
                          Eliminar categoría
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="divide-y divide-ghost-fog">
                {cat.items.map(item => {
                  const visible = item.activo !== false;

                  return (
                  <div key={item.id} className="border-b border-ghost-fog last:border-b-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-14 gap-y-10 px-16 py-16 transition-colors hover:bg-ghost-fog/35 sm:px-20 md:grid-cols-[minmax(0,1fr)_110px_auto]">
                      <div className="col-span-2 min-w-0 md:col-span-1">
                        <div className="flex flex-wrap items-center gap-8">
                          <span className="text-14 font-semibold text-ash-graphite sm:text-16">{item.nombre}</span>
                          {item.variantes && item.variantes.length > 0 && (
                            <span className="rounded-full border border-concrete bg-ghost-fog px-8 py-2 text-10 font-medium text-sage-green">
                              {item.variantes.length} {item.variantes.length === 1 ? 'opción' : 'opciones'}
                            </span>
                          )}
                          {item.franja_horaria_id && (
                            <span className="inline-flex items-center gap-3 rounded-full border border-concrete bg-vanilla-cream/60 px-8 py-2 text-10 font-medium text-sage-green">
                              <span className="material-symbols-outlined text-12">schedule</span>
                              {franjas.find(franja => franja.id === item.franja_horaria_id)?.nombre || 'Horario propio'}
                            </span>
                          )}
                        </div>
                        {item.descripcion && (
                          <p className="mt-3 line-clamp-2 text-12 leading-relaxed text-sage-green sm:text-13">
                            {item.descripcion}
                          </p>
                        )}
                      </div>

                      <span className="whitespace-nowrap text-14 font-semibold text-ash-graphite md:text-16">
                        ${item.precio.toLocaleString('es-AR')}
                      </span>

                      <div className="flex items-center justify-end gap-6">
                        {/* Control de Stock (86) */}
                        <button
                          type="button"
                          onClick={() => void toggleStock(cat.id, item)}
                          className={`inline-flex h-44 items-center gap-6 rounded-full border px-10 text-11 font-semibold transition-colors sm:px-12 ${
                            item.disponible !== false
                              ? "border-concrete bg-canvas-white text-ash-graphite hover:bg-ghost-fog"
                              : "border-alert-red/30 bg-warm-pink/20 text-alert-red hover:bg-warm-pink/30"
                          }`}
                          title={item.disponible !== false ? "Marcar plato como agotado (86)" : "Marcar plato como en stock"}
                          aria-label={item.disponible !== false ? `Marcar ${item.nombre} como agotado` : `Marcar ${item.nombre} en stock`}
                        >
                          <span className={`h-8 min-h-0 w-8 min-w-0 rounded-full ${item.disponible !== false ? 'bg-plain-green' : 'bg-alert-red'}`} />
                          <span>{item.disponible !== false ? 'En stock' : '86 Agotado'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void toggleDisponible(cat.id, item)}
                          className={`inline-flex h-44 items-center gap-6 rounded-full border px-10 text-11 font-semibold transition-colors sm:px-12 ${
                            visible
                              ? "border-success/30 bg-success/10 text-[#087645] hover:bg-success/20"
                              : "border-concrete bg-ghost-fog text-sage-green hover:bg-vanilla-cream"
                          }`}
                          title={visible ? "Ocultar del menú público" : "Mostrar en el menú público"}
                          aria-label={visible ? `Ocultar ${item.nombre}` : `Mostrar ${item.nombre}`}
                        >
                          <span className={`h-8 min-h-0 w-8 min-w-0 rounded-full ${visible ? 'bg-success-muted' : 'bg-stone'}`} />
                          <span>{visible ? 'Visible' : 'Oculto'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (articuloVariantesAbierto === item.id) {
                              setArticuloVariantesAbierto(null);
                            } else {
                              setArticuloVariantesAbierto(item.id);
                              setNuevaVariante({ nombre: '', grupo: '', precioAdicional: '0', seleccionUnica: false });
                            }
                          }}
                          className={`flex h-44 w-44 items-center justify-center rounded-lg border transition-colors ${
                            articuloVariantesAbierto === item.id
                              ? "border-plain-green bg-plain-green text-canvas-white"
                              : "border-concrete bg-canvas-white text-ash-graphite hover:border-stone hover:bg-ghost-fog"
                          }`}
                          title="Gestionar opciones y variantes"
                          aria-label={`Gestionar opciones de ${item.nombre}`}
                          aria-expanded={articuloVariantesAbierto === item.id}
                        >
                          <span className="material-symbols-outlined text-20">tune</span>
                        </button>
                        <div className="relative" onClick={event => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={event => {
                              event.stopPropagation();
                              setMenuItemAbierto(actual => actual === item.id ? null : item.id);
                              setMenuHorarioCategoriaAbierto(null);
                              setMenuCategoriaAbierto(null);
                            }}
                            className="flex h-44 w-44 items-center justify-center rounded-lg text-sage-green transition-colors hover:bg-ghost-fog hover:text-ash-graphite"
                            title="Más acciones del ítem"
                            aria-label={`Más acciones de ${item.nombre}`}
                            aria-expanded={menuItemAbierto === item.id}
                          >
                            <span className="material-symbols-outlined text-24">more_horiz</span>
                          </button>
                          {menuItemAbierto === item.id && (
                            <div className="absolute right-0 top-[48px] z-30 w-[250px] rounded-lg border border-concrete bg-canvas-white p-6 shadow-xl">
                              <div className="px-6 pb-8 pt-6">
                                <p className="px-4 text-10 font-semibold uppercase tracking-[0.08em] text-sage-green">
                                  Horario del producto
                                </p>
                                <p className="mb-6 mt-2 px-4 text-10 leading-relaxed text-sage-green">
                                  Podés reemplazar el horario de la categoría solo para este producto.
                                </p>
                                <button
                                  type="button"
                                  disabled={guardandoHorarioId === item.id}
                                  onClick={() => void asignarFranjaArticulo(cat.id, item.id, '')}
                                  className={`flex min-h-44 w-full items-center gap-8 rounded-lg px-8 py-6 text-left transition-colors disabled:cursor-wait disabled:opacity-60 ${
                                    !item.franja_horaria_id ? 'bg-plain-green/[0.08]' : 'hover:bg-ghost-fog'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-18 text-sage-green">
                                    {cat.franja_horaria_id ? 'account_tree' : 'all_inclusive'}
                                  </span>
                                  <span className="min-w-0 flex-1 text-11 font-semibold text-ash-graphite">
                                    {cat.franja_horaria_id ? 'Heredar de la categoría' : 'Siempre disponible'}
                                  </span>
                                  {!item.franja_horaria_id && (
                                    <span className="material-symbols-outlined text-18 text-plain-green">check</span>
                                  )}
                                </button>
                                {franjas.map(franja => {
                                  const seleccionada = item.franja_horaria_id === franja.id;
                                  return (
                                    <button
                                      key={franja.id}
                                      type="button"
                                      disabled={guardandoHorarioId === item.id}
                                      onClick={() => void asignarFranjaArticulo(cat.id, item.id, franja.id)}
                                      className={`mt-2 flex min-h-44 w-full items-center gap-8 rounded-lg px-8 py-6 text-left transition-colors disabled:cursor-wait disabled:opacity-60 ${
                                        seleccionada ? 'bg-plain-green/[0.08]' : 'hover:bg-ghost-fog'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-18 text-sage-green">schedule</span>
                                      <span className="min-w-0 flex-1">
                                        <span className="block truncate text-11 font-semibold text-ash-graphite">{franja.nombre}</span>
                                        <span className="block font-mono text-9 text-sage-green">{franja.hora_inicio} — {franja.hora_fin}</span>
                                      </span>
                                      {seleccionada && (
                                        <span className="material-symbols-outlined text-18 text-plain-green">check</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="my-4 border-t border-ghost-fog" />
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuItemAbierto(null);
                                  void eliminarItem(cat.id, item.id);
                                }}
                                className="flex h-44 w-full items-center gap-8 rounded-md px-10 text-left text-12 font-medium text-alert-red transition-colors hover:bg-warm-pink/20"
                              >
                                <span className="material-symbols-outlined text-18">delete</span>
                                Eliminar ítem
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subpanel de variantes y personalización */}
                    {articuloVariantesAbierto === item.id && (
                      <div className="space-y-12 border-t border-ghost-fog bg-ghost-fog/70 px-16 py-16 sm:px-20">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-6">
                            <span className="material-symbols-outlined text-16 text-ash-graphite">tune</span>
                            <h4 className="text-12 font-semibold text-ash-graphite">
                              Opciones y Variantes de &ldquo;{item.nombre}&rdquo;
                            </h4>
                          </div>
                          <span className="text-11 text-sage-green">
                            {item.variantes?.length ?? 0} {item.variantes?.length === 1 ? 'opción configurada' : 'opciones configuradas'}
                          </span>
                        </div>

                        {/* Lista de variantes existentes */}
                        {item.variantes && item.variantes.length > 0 ? (
                          <div className="space-y-6">
                            {item.variantes.map(v => (
                              <div
                                key={v.id}
                                className="flex flex-col gap-8 rounded-lg border border-concrete bg-canvas-white px-12 py-10 text-12 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex min-w-0 flex-wrap items-center gap-8">
                                  <span className="rounded-full border border-concrete bg-ghost-fog px-8 py-2 text-10 font-medium text-ash-graphite">
                                    {v.grupo || 'General'}
                                  </span>
                                  <span className="font-medium text-ash-graphite truncate">{v.nombre}</span>
                                  <span className="text-10 text-sage-green">
                                    ({v.seleccion_unica ? 'Radio · Única' : 'Checkbox · Múltiple'})
                                  </span>
                                </div>
                                <div className="flex shrink-0 items-center justify-between gap-10 sm:justify-end">
                                  <span className="font-mono font-medium text-ash-graphite">
                                    {v.precio_adicional > 0 ? `+$${v.precio_adicional.toLocaleString()}` : 'Sin cargo'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => eliminarVariante(cat.id, item.id, v.id)}
                                    className="flex h-44 w-44 items-center justify-center rounded-lg text-alert-red transition-colors hover:bg-warm-pink/20"
                                    title="Eliminar opción"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-12 text-sage-green italic">
                            No hay opciones agregadas aún. Añadí términos de cocción, tamaños o extras debajo.
                          </p>
                        )}

                        {/* Formulario para agregar variante */}
                        <div className="space-y-10 rounded-lg border border-concrete bg-canvas-white p-12">
                          <div className="text-11 font-semibold text-ash-graphite">
                            + Agregar nueva opción
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <input
                              className="h-44 rounded-lg border border-concrete bg-canvas-white px-10 text-12 outline-none focus:border-plain-green"
                              placeholder="Nombre (ej: Jugoso, Cheddar) *"
                              value={nuevaVariante.nombre}
                              onChange={e => setNuevaVariante(p => ({ ...p, nombre: e.target.value }))}
                            />
                            <input
                              className="h-44 rounded-lg border border-concrete bg-canvas-white px-10 text-12 outline-none focus:border-plain-green"
                              placeholder="Grupo (ej: Término, Extras)"
                              value={nuevaVariante.grupo}
                              onChange={e => setNuevaVariante(p => ({ ...p, grupo: e.target.value }))}
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="h-44 rounded-lg border border-concrete bg-canvas-white px-10 text-12 outline-none focus:border-plain-green"
                              placeholder="Precio adicional ($)"
                              value={nuevaVariante.precioAdicional}
                              onChange={e => setNuevaVariante(p => ({ ...p, precioAdicional: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-col justify-between gap-8 pt-2 sm:flex-row sm:items-center">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={nuevaVariante.seleccionUnica}
                              onClick={() => setNuevaVariante(p => ({ ...p, seleccionUnica: !p.seleccionUnica }))}
                              className="group flex min-h-44 select-none items-center gap-10 rounded-lg px-8 text-left transition-colors hover:bg-canvas-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plain-green/30 focus-visible:ring-offset-2"
                            >
                              <span
                                aria-hidden="true"
                                className={`relative h-24 w-44 shrink-0 rounded-full border transition-colors after:absolute after:left-[3px] after:top-[3px] after:h-[16px] after:w-[16px] after:rounded-full after:bg-canvas-white after:shadow-sm after:transition-transform ${
                                  nuevaVariante.seleccionUnica
                                    ? 'border-plain-green bg-plain-green after:translate-x-20'
                                    : 'border-concrete bg-stone/45'
                                }`}
                              />
                              <span className="min-w-0">
                                <span className="block text-12 font-semibold text-ash-graphite">Selección única</span>
                                <span className="mt-2 block text-10 leading-snug text-sage-green">Una sola opción permitida dentro del grupo</span>
                              </span>
                            </button>
                            <button
                              type="button"
                              disabled={guardandoVariante}
                              onClick={() => agregarVariante(cat.id, item.id)}
                              className="h-44 self-end whitespace-nowrap rounded-lg bg-plain-green px-14 text-12 font-semibold text-canvas-white hover:bg-plain-green-muted disabled:opacity-50 sm:self-auto"
                            >
                              {guardandoVariante ? 'Guardando...' : 'Agregar opción'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}

                {cat.items.length === 0 && mostrarFormItem !== cat.id && (
                  <div className="px-20 py-16">
                    <EmptyState
                      compact
                      icon="restaurant_menu"
                      title="Sin ítems"
                      description="Agregá platos o bebidas a esta categoría."
                      actionLabel="Agregar ítem"
                      onAction={() => {
                        setMostrarFormItem(cat.id);
                        setNuevoItem({ nombre: '', descripcion: '', precio: '' });
                        setNuevoItemErrors({});
                      }}
                    />
                  </div>
                )}

                {mostrarFormItem === cat.id && (
                  <div className="space-y-10 bg-ghost-fog/70 px-16 py-16 sm:px-20">
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(150px,1fr)] gap-8">
                      <div className="space-y-4">
                        <input
                          className={`h-44 w-full rounded-lg border bg-canvas-white px-10 text-13 outline-none focus:border-plain-green ${
                            nuevoItemErrors.nombre ? "border-alert-red" : "border-concrete"
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
                          className={`h-44 w-full rounded-lg border bg-canvas-white px-12 text-14 outline-none focus:border-plain-green ${
                            nuevoItemErrors.precio ? "border-alert-red" : "border-concrete"
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
                      className="h-44 w-full rounded-lg border border-concrete bg-canvas-white px-10 text-13 outline-none focus:border-plain-green"
                      placeholder="Descripción (opcional)"
                      value={nuevoItem.descripcion}
                      onChange={e => setNuevoItem(p => ({ ...p, descripcion: e.target.value }))}
                    />
                    <div className="flex items-center gap-8 pt-4">
                      <button
                        type="button"
                        onClick={() => agregarItem(cat.id)}
                        className="h-44 whitespace-nowrap rounded-lg bg-plain-green px-14 text-13 font-semibold text-canvas-white hover:bg-plain-green-muted"
                      >
                        Agregar ítem
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarFormItem(null);
                          setNuevoItemErrors({});
                        }}
                        className="h-44 rounded-lg px-12 text-13 text-sage-green hover:bg-canvas-white hover:text-ash-graphite"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

          {categorias.length === 0 && (
            <EmptyState
              icon="menu_book"
              title="Tu carta está vacía"
              description="Creá tu primera categoría para empezar a cargar productos."
              actionLabel="+ Nueva categoría"
              onAction={() => setMostrarFormCat(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}
