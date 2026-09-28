"use client";
import { useState, useEffect, useCallback } from "react";
import { api, UsuarioAPI, getErrorMessage } from "@/lib/api";
import { EmptyState, Skeleton, useToast, useConfirm } from "@/components/ui";

type RolUsuario = 'admin' | 'encargado' | 'mozo' | 'cocina';
type RolInvitable = 'encargado' | 'mozo' | 'cocina';
type FormState = { nombre: string; email: string; rol: RolInvitable };

const ROL_DESCRIPTIONS: Record<RolInvitable, string> = {
  encargado: 'Puede gestionar la operación de una sucursal: carta, mesas y pedidos activos.',
  mozo: 'Puede ver pedidos en vivo, avanzar estados y atender solicitudes de cuenta.',
  cocina: 'Acceso a la pantalla Kitchen Display System (KDS) para despachar comandas.',
};

export default function EquipoSection({ embedded = false }: { embedded?: boolean }) {
  const toast = useToast();
  const confirmar = useConfirm();
  const [equipo, setEquipo] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ nombre: '', email: '', rol: 'mozo' });
  const [error, setError] = useState('');
  const [invitacionLink, setInvitacionLink] = useState('');
  const [copiado, setCopiado] = useState(false);

  const cargarEquipo = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.listarUsuarios();
      if (res && res.length > 0) {
        setEquipo(res);
      } else {
        setEquipo([]);
      }
    } catch (err: unknown) {
      console.error("Error al cargar usuarios desde la API:", err);
      setEquipo([]);
      setError(getErrorMessage(err, 'Error al conectar con la API de usuarios.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void cargarEquipo();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [cargarEquipo]);

  const handleInvitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInvitacionLink('');
    setCopiado(false);

    if (!form.nombre.trim()) { setError('El nombre es requerido.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Email inválido.'); return; }

    try {
      const resp = await api.invitarUsuario({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
      });

      if (resp.usuario) {
        setEquipo(prev => [...prev, resp.usuario]);
      }
      const linkInvitacion = resp.magic_link || resp.url_invitacion;
      if (linkInvitacion) {
        setInvitacionLink(linkInvitacion);
      }
      setForm({ nombre: '', email: '', rol: 'mozo' });
      toast.success('Invitación generada. Compartí el magic link con el nuevo miembro.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Error al invitar al usuario.');
      setError(msg);
      toast.error(msg);
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    const ok = await confirmar({
      titulo: 'Eliminar miembro',
      mensaje: '¿Eliminás a este miembro del equipo? Perderá acceso al dashboard.',
      labelAceptar: 'Sí, eliminar',
      variante: 'danger',
    });
    if (!ok) return;
    try {
      await api.eliminarUsuario(id);
      setEquipo(prev => prev.filter(u => u.id !== id));
      toast.success('Miembro eliminado del equipo.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'No se pudo eliminar el usuario.');
      toast.error(msg);
    }
  };

  const handleCambiarRol = async (id: string, nuevoRol: RolUsuario) => {
    try {
      setActualizandoId(id);
      await api.actualizarUsuario(id, { rol: nuevoRol });
      setEquipo(prev => prev.map(u => (u.id === id ? { ...u, rol: nuevoRol } : u)));
      toast.success('Rol actualizado.');
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'No se pudo actualizar el rol del usuario.');
      toast.error(msg);
    } finally {
      setActualizandoId(null);
    }
  };

  const handleCopiarLink = () => {
    if (!invitacionLink) return;
    navigator.clipboard.writeText(invitacionLink);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const miembrosLabel = `${equipo.length} ${
    equipo.length === 1 ? "miembro registrado" : "miembros registrados"
  }${loading ? " (cargando...)" : ""}`;

  return (
    <div className={`${embedded ? "space-y-20" : "h-full space-y-24 overflow-y-auto bg-ghost-fog/45 p-16 sm:p-24 md:p-32"} font-inter`}>
      <section className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm">
        <div className="flex items-center justify-between gap-12 border-b border-concrete/70 px-16 py-14 sm:px-20">
          <div className="flex items-center gap-8">
            <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-ghost-fog">
              <span className="material-symbols-outlined text-18 text-ash-graphite">groups</span>
            </span>
            <p className="text-13 font-semibold text-ash-graphite">Miembros actuales</p>
          </div>
          <p className="text-11 text-sage-green text-right whitespace-nowrap">{miembrosLabel}</p>
        </div>

        {/* Skeleton de carga */}
        {loading && (
          <div className="divide-y divide-ghost-fog">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between px-16 py-14 sm:px-20">
                <div className="space-y-6">
                  <Skeleton className="h-12 w-48" />
                  <Skeleton className="h-10 w-64" />
                </div>
                <Skeleton className="h-20 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Lista de miembros */}
        {!loading && (
          <div className="divide-y divide-ghost-fog">
            {equipo.map(u => (
              <div key={u.id} className="flex flex-col gap-12 px-16 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-20">
                <div className="min-w-0">
                  <p className="truncate text-14 font-semibold text-ash-graphite">{u.nombre}</p>
                  <p className="mt-2 truncate text-12 text-sage-green">{u.email}</p>
                </div>
                <div className="flex items-center justify-between gap-8 sm:justify-end">
                  {u.rol === 'admin' ? (
                    <span className="inline-flex h-32 items-center rounded-full border border-concrete bg-ghost-fog px-10 text-11 font-semibold text-sage-green">
                      Admin
                    </span>
                  ) : (
                    <select
                      value={u.rol}
                      disabled={actualizandoId === u.id}
                      onChange={(e) => void handleCambiarRol(u.id, e.target.value as RolUsuario)}
                      className="h-44 cursor-pointer rounded-lg border border-concrete bg-canvas-white px-10 text-11 outline-none focus:border-plain-green disabled:opacity-50"
                    >
                      <option value="encargado">Encargado</option>
                      <option value="mozo">Mozo / Recepcionista</option>
                      <option value="cocina">Cocina (KDS)</option>
                    </select>
                  )}
                  {u.rol !== 'admin' && (
                    <button
                      onClick={() => handleEliminarUsuario(u.id)}
                      className="flex h-44 w-44 items-center justify-center rounded-lg text-alert-red transition-colors hover:bg-warm-pink/20"
                      title="Eliminar usuario"
                      aria-label={`Eliminar a ${u.nombre}`}
                    >
                      <span className="material-symbols-outlined text-18">delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {equipo.length === 0 && !loading && (
          <EmptyState
            icon="group_add"
            title="No hay miembros en el equipo"
            description="Invitá a quienes atienden la sucursal para que entren con su magic link."
            actionLabel="Invitar miembro"
            onAction={() => document.getElementById('form-invitar')?.scrollIntoView({ behavior: 'smooth' })}
          />
        )}
      </section>

      <section id="form-invitar" className="overflow-hidden rounded-xl border border-concrete bg-canvas-white shadow-sm">
        <div className="flex items-center gap-8 border-b border-concrete/70 px-16 py-14 sm:px-20">
          <span className="flex h-32 w-32 items-center justify-center rounded-lg bg-ghost-fog">
            <span className="material-symbols-outlined text-18 text-ash-graphite">person_add</span>
          </span>
          <p className="text-13 font-semibold text-ash-graphite">Invitar nuevo miembro</p>
        </div>
        <form onSubmit={handleInvitar} className="p-16 sm:p-20 space-y-12">
          <div className="rounded-lg border border-concrete bg-ghost-fog/70 p-12 text-12 leading-normal text-sage-green">
            Invitá a quienes atienden la sucursal para que entren con su propio magic link. El rol define qué tareas puede realizar cada persona.
          </div>
          <div className="flex flex-col sm:flex-row gap-12">
            <input
              className="h-44 flex-1 rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green"
              placeholder="Nombre completo *"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            />
            <input
              type="email"
              className="h-44 flex-1 rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green"
              placeholder="Email *"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12">
            <select
              className="h-44 w-full rounded-lg border border-concrete bg-canvas-white px-12 text-13 outline-none focus:border-plain-green sm:w-auto"
              value={form.rol}
              onChange={e => setForm(p => ({ ...p, rol: e.target.value as RolInvitable }))}
            >
              <option value="encargado">Encargado de Sucursal</option>
              <option value="mozo">Mozo / Recepcionista</option>
              <option value="cocina">Cocina (KDS)</option>
            </select>
            <button
              type="submit"
              className="h-44 w-full rounded-lg bg-plain-green px-16 text-center text-13 font-semibold text-canvas-white transition-colors hover:bg-plain-green-muted sm:w-auto"
            >
              Generar Magic Link de Invitación
            </button>
          </div>
          <p className="text-12 text-sage-green leading-normal">
            {ROL_DESCRIPTIONS[form.rol]}
          </p>
          {error && <p className="text-12 text-alert-red">{error}</p>}
          {invitacionLink && (
            <div className="space-y-8 rounded-lg border border-success/40 bg-success/10 p-12">
              <p className="text-12 font-semibold text-[#087645]">✓ Invitación generada correctamente:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8">
                <input
                  type="text"
                  readOnly
                  value={invitacionLink}
                  className="h-44 flex-1 rounded-lg border border-concrete bg-canvas-white px-10 text-11 font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopiarLink}
                  className="h-44 rounded-lg bg-plain-green px-16 text-center text-12 font-semibold text-canvas-white hover:bg-plain-green-muted"
                >
                  {copiado ? "¡Copiado!" : "Copiar Link"}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
