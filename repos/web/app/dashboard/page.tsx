"use client";

import React, { useState } from "react";

export default function DashboardPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-canvas-white font-inter overflow-hidden">
      {/* Top Navigation - Slightly adjusted (h-44) */}
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
          
          {/* User Profile with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-28 h-28 bg-vanilla-cream border border-ash-graphite rounded-md flex items-center justify-center hover:border-plain-green transition-all overflow-hidden"
            >
              <span className="material-symbols-outlined text-18 text-ash-graphite">person</span>
            </button>

            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUserMenuOpen(false)}
                ></div>
                
                <div className="absolute right-0 mt-8 w-90 bg-canvas-white border border-system-black rounded-md shadow-sm z-20 py-8 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-16 py-8 border-b border-ghost-fog mb-4">
                    <p className="text-11 font-medium text-ash-graphite">Administrador</p>
                    <p className="text-11 font-mono text-sage-green truncate">admin@mesaclick.com</p>
                  </div>
                  
                  <UserMenuItem icon="info" label="Datos del plan" />
                  <UserMenuItem icon="upgrade" label="Actualizar plan" />
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
        {/* Sidebar - Collapsible (w-64 or w-75) */}
        <aside 
          className={`${
            isExpanded ? "w-60" : "w-64"
          } border-r border-system-black hidden md:flex flex-col py-16 transition-all duration-300 ease-in-out bg-canvas-white overflow-y-auto overflow-x-hidden shrink-0`}
        >
          <nav className={`space-y-4 flex-1 flex flex-col ${isExpanded ? "px-8" : "items-center"}`}>
            <NavItem icon="dashboard" label="General" active expanded={isExpanded} />
            <NavItem icon="restaurant_menu" label="Menú" expanded={isExpanded} />
            <NavItem icon="table_restaurant" label="Mesas" expanded={isExpanded} />
            <NavItem icon="list_alt" label="Pedidos" expanded={isExpanded} />
            <NavItem icon="analytics" label="Stats" expanded={isExpanded} />
          </nav>
          
          <div className={`pt-16 border-t border-ghost-fog space-y-4 flex flex-col ${isExpanded ? "px-8" : "items-center"}`}>
            <NavItem icon="settings" label="Configuración" expanded={isExpanded} />
            <NavItem icon="help_outline" label="Ayuda" expanded={isExpanded} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-24 md:p-32 space-y-32 overflow-y-auto">
          {/* Top Filter Bar - Compact Dropdown */}
          <div className="flex items-center justify-between border-b border-ghost-fog pb-16">
            <div className="flex items-center gap-12">
              <span className="text-11 font-mono text-sage-green uppercase tracking-widest">Filtrar:</span>
              <div className="relative">
                <select className="h-28 pl-8 pr-24 bg-vanilla-cream border border-ash-graphite rounded-md text-13 font-medium outline-none appearance-none focus:border-plain-green transition-all cursor-pointer">
                  <option>Todas las sucursales</option>
                  <option>Sucursal Principal</option>
                  <option>Sucursal Centro</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-ash-graphite text-14">
                  unfold_more
                </span>
              </div>
            </div>
            <div className="text-11 font-mono text-sage-green uppercase hidden sm:block">
              Update: 12:45 PM
            </div>
          </div>

          <header className="space-y-4">
            <h2 className="text-20 font-medium leading-tight text-ash-graphite">Vista General</h2>
            <p className="text-sage-green text-14">Indicadores de rendimiento en tiempo real.</p>
          </header>

          {/* Stats Grid - High Density */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
            <StatCard label="Pedidos de Hoy" value="24" icon="shopping_cart" />
            <StatCard label="Mesas Activas" value="12" icon="grid_view" />
            <StatCard label="Ventas Totales" value="$42.850" icon="payments" />
          </div>

          {/* Recent Orders Table */}
          <div className="space-y-16">
            <div className="flex items-center justify-between">
              <h3 className="text-12 font-mono text-ash-graphite uppercase tracking-widest font-medium">
                Últimos Pedidos
              </h3>
              <button className="text-11 font-medium text-plain-green hover:underline uppercase tracking-wider">
                Ver todos
              </button>
            </div>
            
            <div className="bg-canvas-white border border-system-black rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="bg-vanilla-cream border-b border-ash-graphite">
                    <tr>
                      <th className="px-16 py-10 text-12 font-mono text-sage-green uppercase tracking-wider">ID</th>
                      <th className="px-16 py-10 text-12 font-mono text-sage-green uppercase tracking-wider">Mesa</th>
                      <th className="px-16 py-10 text-12 font-mono text-sage-green uppercase tracking-wider">Sucursal</th>
                      <th className="px-16 py-10 text-12 font-mono text-sage-green uppercase tracking-wider">Estado</th>
                      <th className="px-16 py-10 text-12 font-mono text-sage-green uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ghost-fog">
                    <OrderRow id="#1204" table="Mesa 05" branch="S. Principal" status="Preparando" total="$3.400" />
                    <OrderRow id="#1203" table="Mesa 12" branch="S. Centro" status="Listo" total="$1.250" />
                    <OrderRow id="#1202" table="Mesa 01" branch="S. Principal" status="Entregado" total="$5.800" />
                    <OrderRow id="#1201" table="Mesa 08" branch="S. Centro" status="Pendiente" total="$2.100" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  expanded = false 
}: { 
  icon: string; 
  label: string; 
  active?: boolean;
  expanded?: boolean;
}) {
  return (
    <div 
      title={!expanded ? label : undefined}
      className={`flex items-center rounded-md cursor-pointer transition-all ${
        expanded ? "w-full px-12 py-8 gap-12" : "justify-center w-40 h-40"
      } ${
        active ? 'bg-ghost-fog text-plain-green' : 'text-ash-graphite hover:bg-vanilla-cream'
      }`}
    >
      <span className="material-symbols-outlined text-20">{icon}</span>
      {expanded && <span className="text-13 font-medium whitespace-nowrap">{label}</span>}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-canvas-white border border-ash-graphite rounded-lg p-20 space-y-12">
      <div className="flex items-center justify-between text-sage-green">
        <span className="text-12 font-mono uppercase tracking-wider">{label}</span>
        <span className="material-symbols-outlined text-20">{icon}</span>
      </div>
      <div className="text-24 font-medium text-ash-graphite">{value}</div>
    </div>
  );
}

function OrderRow({ id, table, branch, status, total }: { id: string, table: string, branch: string, status: string, total: string }) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Listo': return 'text-plain-green bg-ghost-fog border-plain-green';
      case 'Preparando': return 'text-ash-graphite bg-vanilla-cream border-ash-graphite';
      default: return 'text-sage-green bg-canvas-white border-ghost-fog';
    }
  };

  return (
    <tr className="hover:bg-ghost-fog transition-colors group">
      <td className="px-16 py-12 text-13 font-mono text-ash-graphite">{id}</td>
      <td className="px-16 py-12 text-13 text-ash-graphite">{table}</td>
      <td className="px-16 py-12 text-13 text-sage-green">{branch}</td>
      <td className="px-16 py-12">
        <span className={`px-8 py-2 rounded-md border text-10 font-bold uppercase tracking-tighter ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-16 py-12 text-13 font-medium text-ash-graphite text-right">{total}</td>
    </tr>
  );
}

function UserMenuItem({ 
  icon, 
  label, 
  isDanger = false 
}: { 
  icon: string; 
  label: string; 
  isDanger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-12 px-16 py-8 cursor-pointer transition-colors ${
      isDanger ? 'text-alert-red hover:bg-alert-red/5' : 'text-ash-graphite hover:bg-vanilla-cream'
    }`}>
      <span className="material-symbols-outlined text-18">{icon}</span>
      <span className="text-13 font-medium">{label}</span>
    </div>
  );
}
