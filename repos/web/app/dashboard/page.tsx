"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartaSection from "@/components/dashboard/CartaSection";
import MesasSection from "@/components/dashboard/MesasSection";
import RecepcionistaSection from "@/components/dashboard/RecepcionistaSection";
import ConfiguracionSection from "@/components/dashboard/ConfiguracionSection";
import Logo from "@/components/brand/Logo";
import { api, cerrarSesion, estaAutenticado, Tenant } from "@/lib/api";

type Section = 'carta' | 'mesas' | 'recepcionista' | 'configuracion';

const SECTIONS: { id: Section; icon: string; label: string }[] = [
  { id: 'carta', icon: 'restaurant_menu', label: 'Carta' },
  { id: 'mesas', icon: 'table_restaurant', label: 'Mesas & QR' },
  { id: 'recepcionista', icon: 'receipt_long', label: 'Recepcionista' },
];

function renderSection(section: Section) {
  switch (section) {
    case 'carta': return <CartaSection />;
    case 'mesas': return <MesasSection />;
    case 'recepcionista': return <RecepcionistaSection />;
    case 'configuracion': return <ConfiguracionSection />;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('carta');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    async function loadTenant() {
      if (estaAutenticado()) {
        try {
          const t = await api.obtenerMiTenant();
          setTenant(t);
        } catch (err) {
          console.warn("No se pudo cargar tenant:", err);
        }
      }
    }
    loadTenant();
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    router.push("/login");
  };

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
          <span className="flex items-center gap-8 text-ash-graphite">
            <Logo className="w-20 h-20" />
            <h1 className="text-15 font-bold uppercase tracking-tight">Mesa CLICK</h1>
          </span>
          <span className="text-11 font-mono text-sage-green uppercase tracking-wider border-l border-concrete pl-8">
            {tenant ? tenant.nombre : "Admin"}
          </span>
          {tenant && (
            <span className="hidden sm:inline-block px-6 py-1 bg-ghost-fog border border-ash-graphite/20 text-10 font-mono text-sage-green rounded">
              /{tenant.slug}
            </span>
          )}
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
                    <p className="text-11 font-medium text-ash-graphite">{tenant ? tenant.nombre : "Administrador"}</p>
                    <p className="text-11 font-mono text-sage-green truncate">Sesión activa</p>
                  </div>
                  <UserMenuItem icon="account_circle" label="Perfil" />
                  <div className="mt-8 pt-8 border-t border-ghost-fog">
                    <div onClick={handleLogout}>
                      <UserMenuItem icon="logout" label="Salir" isDanger />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-system-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Mobile Drawer (Slide-out) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-240 bg-canvas-white border-r border-system-black flex flex-col py-16 transition-transform duration-300 ease-in-out md:hidden ${
            isExpanded ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-16 pb-16 flex items-center justify-between border-b border-ghost-fog mb-8">
            <div className="flex items-center gap-8 text-ash-graphite">
              <Logo className="w-22 h-22" />
              <span className="font-bold uppercase text-14">Menú Principal</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="material-symbols-outlined text-ash-graphite p-4 hover:text-plain-green"
            >
              close
            </button>
          </div>
          <nav className="space-y-4 flex-1 px-8">
            {SECTIONS.map((s) => (
              <NavItem
                key={s.id}
                icon={s.icon}
                label={s.label}
                active={activeSection === s.id}
                expanded={true}
                onClick={() => {
                  setActiveSection(s.id);
                  setIsExpanded(false);
                }}
              />
            ))}
          </nav>
          <div className="pt-16 border-t border-ghost-fog space-y-4 px-8">
            <NavItem
              icon="settings"
              label="Configuración"
              active={activeSection === "configuracion"}
              expanded={true}
              onClick={() => {
                setActiveSection("configuracion");
                setIsExpanded(false);
              }}
            />
            <NavItem icon="help_outline" label="Ayuda" expanded={true} />
          </div>
        </aside>

        {/* Desktop Sidebar */}
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
            <NavItem
              icon="settings"
              label="Configuración"
              active={activeSection === "configuracion"}
              expanded={isExpanded}
              onClick={() => setActiveSection("configuracion")}
            />
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
      } ${active ? "bg-ash-graphite text-canvas-white" : "text-ash-graphite hover:bg-vanilla-cream"}`}
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
