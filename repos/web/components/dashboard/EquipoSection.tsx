"use client";
import { useState, useEffect } from "react";
import { api, UsuarioAPI } from "@/lib/api";
import { mockEquipo } from "@/lib/mock/equipo";

type RolInvitable = 'encargado' | 'mozo';
type FormState = { nombre: string; email: string; rol: RolInvitable };

const ROL_LABELS: Record<string, string> = {
  admin: 'Admin',
  encargado: 'Encargado',
  mozo: 'Mozo',
};

export default function EquipoSection() {
  const [equipo, setEquipo] = useState<UsuarioAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({ nombre: '', email: '', rol: 'mozo' });
  const [error, setError] = useState('');
  const [invitacionLink, setInvitacionLink] = useState('');
  const [copiado, setCopiado] = useState(false);

  const cargarEquipo = async () => {
    try {
      setLoading(true);
      const res = await api.listarUsuarios();
      if (res && res.length > 0) {
        setEquipo(res);
      } else {
        // Fallback mock
        const fallback: UsuarioAPI[] = mockEquipo.map(m => ({
          id: m.id,
          tenant_id: 'default',
          nombre: m.nombre,
          email: m.email,
          rol: m.rol,
          activo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setEquipo(fallback);
      }
    } catch (err) {
      console.warn("API de usuarios no disponible, usando mocks:", err);
      const fallback: UsuarioAPI[] = mockEquipo.map(m => ({
        id: m.id,
        tenant_id: 'default',
        nombre: m.nombre,
        email: m.email,
        rol: m.rol,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setEquipo(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipo();
  }, []);

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
      if (resp.url_invitacion) {
        setInvitacionLink(resp.url_invitacion);
      }
      setForm({ nombre: '', email: '', rol: 'mozo' });
    } catch (err: any) {
      // Fallback local
      const uLocal: UsuarioAPI = {
        id: crypto.randomUUID(),
        tenant_id: 'local',
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setEquipo(prev => [...prev, uLocal]);
      setForm({ nombre: '', email: '', rol: 'mozo' });
    }
  };

  const handleEliminarUsuario = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar a este miembro del equipo?')) return;
    try {
      await api.eliminarUsuario(id);
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar el usuario.');
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
    <div className="p-24 md:p-32 space-y-32 font-inter">
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
              className="w-full sm:w-auto px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity text-center"
            >
              Generar Magic Link de Invitación
            </button>
          </div>
          {error && <p className="text-12 text-alert-red">{error}</p>}
          {invitacionLink && (
            <div className="p-12 bg-ghost-fog border border-plain-green rounded-md space-y-8">
              <p className="text-12 text-plain-green font-medium">✓ Invitación generada correctamente:</p>
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
                  className="px-16 py-6 text-12 font-medium bg-plain-green text-ash-graphite rounded hover:opacity-90 text-center"
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
