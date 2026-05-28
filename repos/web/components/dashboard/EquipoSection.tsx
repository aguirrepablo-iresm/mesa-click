"use client";
import { useState } from "react";
import { mockEquipo, UsuarioEquipo } from "@/lib/mock/equipo";

type RolInvitable = 'encargado' | 'mozo';
type FormState = { nombre: string; email: string; rol: RolInvitable };

const ROL_LABELS: Record<UsuarioEquipo['rol'], string> = {
  admin: 'Admin',
  encargado: 'Encargado',
  mozo: 'Mozo',
};

export default function EquipoSection() {
  const [equipo, setEquipo] = useState<UsuarioEquipo[]>(mockEquipo);
  const [form, setForm] = useState<FormState>({ nombre: '', email: '', rol: 'mozo' });
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleInvitar = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim()) { setError('El nombre es requerido.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Email inválido.'); return; }

    setEquipo(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
        estado: 'invitado',
      },
    ]);
    setForm({ nombre: '', email: '', rol: 'mozo' });
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <div className="p-24 md:p-32 space-y-32">
      <div>
        <h2 className="text-20 font-medium text-ash-graphite">Equipo</h2>
        <p className="text-13 text-sage-green mt-4">{equipo.length} miembros</p>
      </div>

      <div className="border border-ash-graphite rounded-lg overflow-hidden">
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
              <div className="flex items-center gap-8">
                <span className="px-8 py-2 text-11 font-medium text-sage-green bg-vanilla-cream border border-ghost-fog rounded-md">
                  {ROL_LABELS[u.rol]}
                </span>
                {u.estado === 'invitado' && (
                  <span className="px-8 py-2 text-11 font-medium text-plain-green-muted bg-ghost-fog border border-plain-green-muted rounded-md">
                    Invitado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-ash-graphite rounded-lg overflow-hidden">
        <div className="px-20 py-10 bg-vanilla-cream border-b border-ash-graphite">
          <p className="text-11 font-mono text-sage-green uppercase tracking-wider">Invitar usuario</p>
        </div>
        <form onSubmit={handleInvitar} className="p-20 space-y-12">
          <div className="flex gap-12">
            <input
              className="flex-1 px-12 py-8 text-13 rounded-md"
              placeholder="Nombre completo *"
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            />
            <input
              type="email"
              className="flex-1 px-12 py-8 text-13 rounded-md"
              placeholder="Email *"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-12">
            <select
              className="px-12 py-8 text-13 rounded-md bg-canvas-white"
              value={form.rol}
              onChange={e => setForm(p => ({ ...p, rol: e.target.value as RolInvitable }))}
            >
              <option value="encargado">Encargado</option>
              <option value="mozo">Mozo</option>
            </select>
            <button
              type="submit"
              className="px-16 py-8 bg-plain-green text-ash-graphite text-13 font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Enviar invitación
            </button>
          </div>
          {error && <p className="text-12 text-alert-red">{error}</p>}
          {enviado && <p className="text-12 text-plain-green-muted">✓ Invitación enviada correctamente.</p>}
        </form>
      </div>
    </div>
  );
}
