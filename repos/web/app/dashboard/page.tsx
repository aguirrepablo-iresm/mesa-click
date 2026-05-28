"use client";
import React, { useState } from "react";
import CartaSection from "@/components/dashboard/CartaSection";
import MesasSection from "@/components/dashboard/MesasSection";
import EquipoSection from "@/components/dashboard/EquipoSection";
import RecepcionistaSection from "@/components/dashboard/RecepcionistaSection";

type Section = 'carta' | 'mesas' | 'equipo' | 'recepcionista';

const SECTIONS: { id: Section; icon: string; label: string }[] = [
  { id: 'carta', icon: 'restaurant_menu', label: 'Carta' },
  { id: 'mesas', icon: 'table_restaurant', label: 'Mesas & QR' },
  { id: 'equipo', icon: 'group', label: 'Equipo' },
  { id: 'recepcionista', icon: 'receipt_long', label: 'Recepcionista' },
];

function renderSection(section: Section) {
  switch (section) {
    case 'carta': return <CartaSection />;
    case 'mesas': return <MesasSection />;
    case 'equipo': return <EquipoSection />;
    case 'recepcionista': return <RecepcionistaSection />;
  }
}

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>('carta');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-canvas-white font-inter overflow-hidden">
      <header className="h-44 border-b border-system-black px-16 flex items-center justify-between shrink-0 bg-canvas-white z-30">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="material-symbols-outlined text-ash-graphite hover:text-plain-green transition-colors text-20 mr-4"
          >
            {isExpanded ? 'menu_open' : 'menu'}
          </button>
          <h1 className="text-15 font-medium tracking-tight">Mesa CLICK</h1>
          <span className="text-11 font-mono text-sage-green uppercase tracking-wider border-l border-ghost-fog pl-8">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-16">
          <button className="material-symbols-outlined text-ash-graphite hover:text-plain-green transition-colors text-20">
            notifications
          </button>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-28 h-28 bg-vanilla-cream border border-ash-graphite rounded-md flex items-center justify-center hover:border-plain-green transition-all"
            >
              <span className="material-symbols-outlined text-18 text-ash-graphite">person</span>
            </button>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-8 w-90 bg-canvas-white border border-system-black rounded-md shadow-sm z-20 py-8 overflow-hidden">
                  <div className="px-16 py-8 border-b border-ghost-fog mb-4">
                    <p className="text-11 font-medium text-ash-graphite">Administrador</p>
                    <p className="text-11 font-mono text-sage-green truncate">admin@mesaclick.com</p>
                  </div>
                  <UserMenuItem icon="account_circle" label="Perfil" />
                  <div className="mt-8 pt-8 border-t border-ghost-fog">
                    <UserMenuItem icon="logout" label="Salir" isDanger />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`${
            isExpanded ? "w-200" : "w-64"
          } border-r border-system-black hidden md:flex flex-col py-16 transition-all duration-300 ease-in-out bg-canvas-white overflow-y-auto overflow-x-hidden shrink-0`}
        >
          <nav className={`space-y-4 flex-1 flex flex-col ${isExpanded ? "px-8" : "items-center"}`}>
            {SECTIONS.map((s) => (
              <NavItem
                key={s.id}
                icon={s.icon}
                label={s.label}
                active={activeSection === s.id}
                expanded={isExpanded}
                onClick={() => setActiveSection(s.id)}
              />
            ))}
          </nav>
          <div className={`pt-16 border-t border-ghost-fog space-y-4 flex flex-col ${isExpanded ? "px-8" : "items-center"}`}>
            <NavItem icon="settings" label="Configuración" expanded={isExpanded} />
            <NavItem icon="help_outline" label="Ayuda" expanded={isExpanded} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {renderSection(activeSection)}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  expanded = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      title={!expanded ? label : undefined}
      onClick={onClick}
      className={`flex items-center rounded-md cursor-pointer transition-all ${
        expanded ? "w-full px-12 py-8 gap-12" : "justify-center w-40 h-40"
      } ${active ? "bg-ghost-fog text-plain-green" : "text-ash-graphite hover:bg-vanilla-cream"}`}
    >
      <span className="material-symbols-outlined text-20">{icon}</span>
      {expanded && <span className="text-13 font-medium whitespace-nowrap">{label}</span>}
    </div>
  );
}

function UserMenuItem({
  icon,
  label,
  isDanger = false,
}: {
  icon: string;
  label: string;
  isDanger?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-12 px-16 py-8 cursor-pointer transition-colors ${
        isDanger ? "text-alert-red hover:bg-red-50" : "text-ash-graphite hover:bg-vanilla-cream"
      }`}
    >
      <span className="material-symbols-outlined text-18">{icon}</span>
      <span className="text-13 font-medium">{label}</span>
    </div>
  );
}
