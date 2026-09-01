"use client";
import { useState, useEffect, useCallback } from "react";
import { api, UsuarioAPI, getErrorMessage } from "@/lib/api";

type RolInvitable = 'encargado' | 'mozo';
type FormState = { nombre: string; email: string; rol: RolInvitable };

const ROL_LABELS: Record<string, string> = {
  admin: 'Admin',
  encargado: 'Encargado',
  mozo: 'Mozo',
};

const ROL_DESCRIPTIONS: Record<RolInvitable, string> = {
  encargado: 'Puede gestionar la operación de una sucursal: carta, mesas y pedidos activos.',
  mozo: 'Puede ver pedidos en vivo, avanzar estados y atender solicitudes de cuenta.',
};

export default function EquipoSection({ embedded = false }: { embedded?: boolean }) {
  const [equipo, setEquipo] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Error al invitar al usuario.'));
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este miembro del equipo?')) return;
    try {
      await api.eliminarUsuario(id);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'No se pudo eliminar el usuario.'));
    }
    setEquipo(prev => prev.filter(u => u.id !== id));
  };

  const handleCopiarLink = () => {
    if (!invitacionLink) return;
    navigator.clipboard.writeText(invitacionLink);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <div className={`${embedded ? "space-y-24" : "p-24 md:p-32 space-y-32"} font-inter`}>
      <div>
        <h2 className="text-20 font-medium text-ash-graphite">Equipo de Trabajo</h2>
        <p className="text-13 text-sage-green mt-4">
          {equipo.length} miembros registrados {loading && "(cargando...)"}
        </p>
      </div>

      <div className="border border-ash-graphite rounded-lg overflow-hidden bg-canvas-white">
        <div className="px-20 py-10 bg-vanilla-cream border-b border-ash-graphite">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Miembros actuales</p>
        </div>
        <div className="divide-y divide-ghost-fog">
          {equipo.map(u => (
            <div key={u.id} className="flex items-center justify-between px-20 py-12">
              <div>
                <p className="text-13 font-medium text-ash-graphite">{u.nombre}</p>
                <p className="text-12 text-sage-green font-mono">{u.email}</p>
              </div>
              <div className="flex items-center gap-12">
                <span className="px-8 py-2 text-11 font-medium text-sage-green bg-vanilla-cream border border-ghost-fog rounded-md">
                  {ROL_LABELS[u.rol] || u.rol}
                </span>
                {u.rol !== 'admin' && (
                  <button
                    onClick={() => handleEliminarUsuario(u.id)}
                    className="text-12 text-alert-red hover:opacity-70"
                    title="Eliminar usuario"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-ash-graphite rounded-lg overflow-hidden bg-canvas-white">
        <div className="px-20 py-10 bg-vanilla-cream border-b border-ash-graphite">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Invitar nuevo miembro</p>
        </div>
        <form onSubmit={handleInvitar} className="p-16 sm:p-20 space-y-12">
          <div className="p-12 bg-ghost-fog border border-ghost-fog rounded-md text-12 text-sage-green leading-normal">
            Invitá a quienes atienden la sucursal para que entren con su propio magic link. El rol define qué tareas puede realizar cada persona.
          </div>
          <div className="flex flex-col sm:flex-row gap-12">
            <input
              className="flex-1 px-12 py-8 text-13 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-plain-green"
              placeholder="Nombre completo *"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            />
            <input
              type="email"
              className="flex-1 px-12 py-8 text-13 rounded-md border border-ash-graphite bg-canvas-white outline-none focus:border-plain-green"
              placeholder="Email *"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12">
            <select
              className="w-full sm:w-auto px-12 py-8 text-13 rounded-md bg-canvas-white border border-ash-graphite outline-none focus:border-plain-green"
              value={form.rol}
              onChange={e => setForm(p => ({ ...p, rol: e.target.value as RolInvitable }))}
            >
              <option value="encargado">Encargado de Sucursal</option>
              <option value="mozo">Mozo / Recepcionista</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-16 py-8 bg-plain-green text-canvas-white text-13 font-medium rounded-md hover:opacity-90 transition-opacity text-center"
            >
              Generar Magic Link de Invitación
            </button>
          </div>
          <p className="text-12 text-sage-green leading-normal">
            {ROL_DESCRIPTIONS[form.rol]}
          </p>
          {error && <p className="text-12 text-alert-red">{error}</p>}
          {invitacionLink && (
            <div className="p-12 bg-ghost-fog border border-plain-green rounded-md space-y-8">
              <p className="text-12 text-success-muted font-medium">✓ Invitación generada correctamente:</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8">
                <input
                  type="text"
                  readOnly
                  value={invitacionLink}
                  className="flex-1 px-10 py-6 text-11 font-mono bg-canvas-white border border-ash-graphite rounded"
                />
                <button
                  type="button"
                  onClick={handleCopiarLink}
                  className="px-16 py-6 text-12 font-medium bg-plain-green text-canvas-white rounded hover:opacity-90 text-center"
                >
                  {copiado ? "¡Copiado!" : "Copiar Link"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
