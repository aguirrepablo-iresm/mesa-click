import { useEffect, useMemo, useState, type ReactNode } from "react";

type IconName =
  | "bell"
  | "book"
  | "brand"
  | "card"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "grid"
  | "help"
  | "kitchen"
  | "menu"
  | "more"
  | "qr"
  | "search"
  | "settings"
  | "spark"
  | "table"
  | "users";

const iconPaths: Record<IconName, ReactNode> = {
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M8 7h8M8 11h6"/></>,
  brand: <><path d="M5 3v8a3 3 0 0 0 6 0V3M8 3v18M16 3v18M16 3c4 2 4 8 0 10"/></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.4 2.1c-1.1.8-1.9 1.3-1.9 2.9M12 18h.01"/></>,
  kitchen: <><path d="M4 5h16v10H4zM7 15v4M17 15v4M8 9h8"/><path d="M7 3v2M12 3v2M17 3v2"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M15 14h2v3h-3v4M19 14h2v2M19 19h2v2"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  spark: <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/>,
  table: <><path d="M4 10h16M6 10l-1 10M18 10l1 10M8 10V5h8v5"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconPaths[name]}</svg>;
}

type TableStatus = "Cuenta solicitada" | "Listo para retirar" | "En preparación";

type TableData = {
  id: number;
  area: string;
  guests: number;
  status: TableStatus;
  time: string;
  amount: string;
  detail: string;
};

const initialTables: TableData[] = [
  { id: 12, area: "Salón", guests: 4, status: "Cuenta solicitada", time: "Hace 2 min", amount: "$ 48.600", detail: "3 rondas · 9 productos" },
  { id: 7, area: "Terraza", guests: 2, status: "Cuenta solicitada", time: "Hace 6 min", amount: "$ 21.900", detail: "2 rondas · 5 productos" },
  { id: 18, area: "Patio", guests: 5, status: "Listo para retirar", time: "Listo hace 1 min", amount: "$ 64.200", detail: "Comanda #18B4 · 6 platos" },
  { id: 4, area: "Salón", guests: 3, status: "Listo para retirar", time: "Listo hace 4 min", amount: "$ 37.800", detail: "Comanda #04C2 · 4 platos" },
  { id: 9, area: "Terraza", guests: 2, status: "En preparación", time: "14 min", amount: "$ 28.400", detail: "3 de 5 platos en preparación" },
  { id: 15, area: "Patio", guests: 6, status: "En preparación", time: "9 min", amount: "$ 72.100", detail: "4 de 8 platos en preparación" },
  { id: 2, area: "Salón", guests: 2, status: "En preparación", time: "6 min", amount: "$ 18.700", detail: "1 de 3 platos en preparación" },
];

const navItems: { label: string; icon: IconName; badge?: string }[] = [
  { label: "Salón en vivo", icon: "grid", badge: "4" },
  { label: "Cocina KDS", icon: "kitchen" },
  { label: "Carta", icon: "book" },
  { label: "Mesas & QR", icon: "qr" },
  { label: "Métricas", icon: "card" },
  { label: "Configuración", icon: "settings" },
];

const statusLabels: Record<TableStatus, string> = {
  "Cuenta solicitada": "Cuenta",
  "Listo para retirar": "Listo",
  "En preparación": "En curso",
};

function TableCard({ table, onOpen }: { table: TableData; onOpen: () => void }) {
  const statusClass = table.status === "Cuenta solicitada" ? "bill" : table.status === "Listo para retirar" ? "ready" : "progress";
  return (
    <button className={`table-card ${statusClass}`} onClick={onOpen}>
      <span className="table-card-top">
        <span className="table-number">Mesa {table.id}</span>
        <span className={`status-pill ${statusClass}`}>
          {table.status === "Listo para retirar" && <span className="status-dot" />}
          {statusLabels[table.status]}
        </span>
      </span>
      <span className="table-meta"><Icon name="users" size={16} /> {table.guests} personas <span>·</span> {table.area}</span>
      <span className="table-detail">{table.detail}</span>
      <span className="table-card-bottom">
        <span className="table-time"><Icon name="clock" size={15} />{table.time}</span>
        <strong>{table.amount}</strong>
      </span>
      {table.status === "Listo para retirar" && <span className="ready-action">Ver pedido <Icon name="chevron" size={16} /></span>}
    </button>
  );
}

const menuItems = [
  {
    name: "Smash Limonero",
    description: "Doble carne, cheddar, cebolla crispy y salsa de la casa.",
    price: 9200,
    tag: "Más pedido",
    image: "https://images.unsplash.com/photo-1643757343278-5d50309dfa44?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Ensalada tibia",
    description: "Vegetales de estación, queso grillado, verdes y almendras.",
    price: 7800,
    tag: "Vegetariano",
    image: "https://images.unsplash.com/photo-1778690103044-88ad0e274e32?auto=format&fit=crop&w=700&q=82",
  },
  {
    name: "Pesca del día",
    description: "Filet grillado, crema de coliflor y vegetales crocantes.",
    price: 12600,
    tag: "Sin TACC",
    image: "https://images.unsplash.com/photo-1692197275931-0793e08efcc1?auto=format&fit=crop&w=700&q=82",
  },
];

const faqs = [
  {
    question: "¿Necesito instalar equipos especiales?",
    answer: "No. Mesa CLICK funciona desde cualquier navegador en celulares, tablets y computadoras. Podés empezar con los dispositivos que ya tenés en el local.",
  },
  {
    question: "¿El comensal tiene que descargar una app?",
    answer: "No. Escanea el QR de la mesa y accede directamente a la carta desde su navegador, sin registros obligatorios ni descargas.",
  },
  {
    question: "¿Puedo actualizar precios y marcar platos agotados?",
    answer: "Sí. Los cambios de precio, descripción o disponibilidad se reflejan en tiempo real en todos los celulares que tengan la carta abierta.",
  },
  {
    question: "¿Cómo llegan los pedidos a cocina?",
    answer: "Cada pedido aparece instantáneamente en el KDS de cocina, ordenado por antigüedad y con variantes, notas y alertas claramente visibles.",
  },
  {
    question: "¿Funciona para varias sucursales?",
    answer: "Sí. Podés administrar sucursales, cartas, horarios, mesas y equipos desde una misma cuenta, manteniendo cada operación separada.",
  },
];

function AuthBrand() {
  return <button className="auth-brand" onClick={() => { window.location.href = "/"; }}><span><Icon name="brand" size={21} /></span>Mesa <strong>CLICK</strong></button>;
}

function RegisterApp() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const valid = name.trim().length > 2 && email.includes("@") && password.length >= 8;

  const continueToOnboarding = () => {
    setSubmitted(true);
    if (!valid) return;
    window.localStorage.setItem("mesa-click-owner", name.trim());
    window.location.href = "/onboarding";
  };

  const googleContinue = () => {
    window.localStorage.setItem("mesa-click-owner", "Martina");
    window.location.href = "/onboarding";
  };

  return (
    <div className="auth-page">
      <header className="auth-header"><AuthBrand /><span>¿Ya tenés una cuenta? <button>Ingresar</button></span></header>
      <main className="auth-layout">
        <section className="auth-form-panel">
          <div className="auth-form">
            <span className="auth-eyebrow">Empezá gratis</span>
            <h1>Creá tu cuenta</h1>
            <p>Primero, tus datos de acceso. La información de tu restaurante la configuramos después, paso a paso.</p>
            <button className="google-button" onClick={googleContinue}><span className="google-g">G</span><strong>Continuar con Google</strong></button>
            <div className="auth-divider"><span>o registrate con tu correo</span></div>
            <label className="auth-field"><span>Nombre y apellido</span><div className={submitted && name.trim().length <= 2 ? "invalid" : ""}><Icon name="users" size={18} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: Martina López" autoComplete="name" /></div>{submitted && name.trim().length <= 2 && <small>Ingresá tu nombre completo.</small>}</label>
            <label className="auth-field"><span>Correo electrónico</span><div className={submitted && !email.includes("@") ? "invalid" : ""}><span className="field-at">@</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vos@turestaurante.com" type="email" autoComplete="email" /></div>{submitted && !email.includes("@") && <small>Ingresá un correo válido.</small>}</label>
            <label className="auth-field"><span>Contraseña</span><div className={submitted && password.length < 8 ? "invalid" : ""}><Icon name="settings" size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 8 caracteres" type={showPassword ? "text" : "password"} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Ver"}</button></div>{submitted && password.length < 8 ? <small>Usá al menos 8 caracteres.</small> : <em>Usá 8 caracteres o más.</em>}</label>
            <button className="auth-submit" onClick={continueToOnboarding}>Crear cuenta <Icon name="chevron" /></button>
            <small className="auth-terms">Al continuar, aceptás nuestros <button>Términos de uso</button> y la <button>Política de privacidad</button>.</small>
          </div>
        </section>
        <aside className="auth-story">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1300&q=86" alt="Salón de restaurante preparado para el servicio" />
          <div className="auth-story-overlay">
            <span className="story-label"><i /> Configuración simple</span>
            <blockquote>“En menos de diez minutos tenés tu salón listo para recibir el primer pedido.”</blockquote>
            <div><span className="story-avatar">MC</span><p><strong>Tu operación, conectada</strong><small>Salón · Cocina · Comensales</small></p></div>
          </div>
          <div className="story-card"><span><Icon name="check" /></span><div><small>Siguiente paso</small><strong>Contanos sobre tu negocio</strong></div></div>
        </aside>
      </main>
    </div>
  );
}

function OnboardingApp() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Restaurante");
  const [branchName, setBranchName] = useState("Casa central");
  const [tables, setTables] = useState(12);
  const [submitted, setSubmitted] = useState(false);
  const owner = window.localStorage.getItem("mesa-click-owner") || "Martina";
  const slug = businessName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "tu-negocio";

  const nextStep = () => {
    setSubmitted(true);
    if (step === 1 && businessName.trim().length < 2) return;
    setSubmitted(false);
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <AuthBrand />
        <div className="onboarding-save"><span><i /> Guardado automáticamente</span><button onClick={() => { window.location.href = "/"; }}>Salir</button></div>
      </header>
      <div className="onboarding-progress-mobile"><span style={{ width: `${step * 33.33}%` }} /></div>
      <main className="onboarding-layout">
        <aside className="onboarding-aside">
          <div>
            <span className="onboarding-welcome">Hola, {owner.split(" ")[0]}</span>
            <h2>Preparemos tu espacio de trabajo</h2>
            <p>Solo necesitamos lo esencial. Después vas a poder personalizar todo desde Configuración.</p>
          </div>
          <nav className="onboarding-steps">
            {[["Negocio", "Nombre y tipo de local"], ["Primera sucursal", "Datos básicos del local"], ["Todo listo", "Revisá y empezá"]].map(([title, caption], index) => {
              const number = index + 1;
              return <button key={title} className={step === number ? "active" : step > number ? "done" : ""} onClick={() => number < step && setStep(number)}><span>{step > number ? <Icon name="check" size={16} /> : number}</span><div><strong>{title}</strong><small>{caption}</small></div></button>;
            })}
          </nav>
          <div className="onboarding-help"><Icon name="help" /><span><strong>¿Te trabaste en algo?</strong><button>Chatear con soporte</button></span></div>
        </aside>

        <section className="onboarding-main">
          <div className="onboarding-step-label">Paso {step} de 3</div>
          {step === 1 && (
            <div className="onboarding-form">
              <div className="onboarding-title"><span className="onboarding-icon"><Icon name="brand" /></span><div><h1>Contanos sobre tu negocio</h1><p>Esto es lo que verán tus clientes cuando ingresen a la carta.</p></div></div>
              <label className="onboarding-field"><span>Nombre del restaurante</span><input className={submitted && businessName.trim().length < 2 ? "invalid" : ""} value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Ej: Bajo Limonero" autoFocus />{submitted && businessName.trim().length < 2 && <small>Ingresá el nombre de tu negocio.</small>}</label>
              <fieldset className="business-types"><legend>¿Qué tipo de negocio tenés?</legend><div>{[["Restaurante", "brand"], ["Cafetería", "clock"], ["Bar o cervecería", "card"], ["Otro", "more"]].map(([label, icon]) => <button type="button" key={label} className={category === label ? "active" : ""} onClick={() => setCategory(label)}><span><Icon name={icon as IconName} /></span><strong>{label}</strong>{category === label && <i><Icon name="check" size={14} /></i>}</button>)}</div></fieldset>
              <div className="slug-preview"><span className="onboarding-icon small"><Icon name="book" size={18} /></span><div><small>Tu carta estará disponible en</small><strong>mesaclick.com/<b>{slug}</b></strong></div><span className="available"><i /> Disponible</span></div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-form">
              <div className="onboarding-title"><span className="onboarding-icon"><Icon name="table" /></span><div><h1>Tu primera sucursal</h1><p>Creá el local desde el que vas a empezar a operar.</p></div></div>
              <label className="onboarding-field"><span>Nombre de la sucursal</span><input value={branchName} onChange={(event) => setBranchName(event.target.value)} placeholder="Ej: Casa central" autoFocus /></label>
              <div className="onboarding-field-row"><label className="onboarding-field"><span>WhatsApp <em>Opcional</em></span><input placeholder="+54 9 11 1234 5678" inputMode="tel" /></label><label className="onboarding-field"><span>Correo del local <em>Opcional</em></span><input placeholder="local@turestaurante.com" type="email" /></label></div>
              <div className="tables-question"><div><span className="onboarding-icon small"><Icon name="table" size={18} /></span><div><strong>¿Cuántas mesas tenés?</strong><p>Vamos a crearlas automáticamente. Podés cambiarlas después.</p></div></div><div className="table-counter"><button onClick={() => setTables(Math.max(1, tables - 1))}>−</button><strong>{tables}</strong><button onClick={() => setTables(tables + 1)}>+</button></div></div>
              <div className="schedule-choice"><div><span className="onboarding-icon small"><Icon name="clock" size={18} /></span><div><strong>Horarios de atención</strong><p>Podés configurar turnos y días específicos más adelante.</p></div></div><button><Icon name="check" size={16} /> Usar horario estándar <span>12:00 — 00:00</span></button></div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-complete">
              <span className="complete-mark"><Icon name="check" size={32} /></span>
              <span className="auth-eyebrow">Configuración completa</span>
              <h1>Todo listo para empezar</h1>
              <p>Ya creamos la base de <strong>{businessName}</strong>. Ahora podés cargar tu carta y hacer una prueba con la Mesa 1.</p>
              <div className="setup-summary">
                <div><span><Icon name="brand" /></span><p><small>Negocio</small><strong>{businessName}</strong><em>{category}</em></p><button onClick={() => setStep(1)}>Editar</button></div>
                <div><span><Icon name="table" /></span><p><small>Sucursal</small><strong>{branchName || "Casa central"}</strong><em>{tables} mesas creadas</em></p><button onClick={() => setStep(2)}>Editar</button></div>
                <div><span><Icon name="qr" /></span><p><small>QR de prueba</small><strong>Mesa 1 preparada</strong><em>Listo para escanear</em></p><i><Icon name="check" /></i></div>
              </div>
              <button className="onboarding-primary finish" onClick={() => { window.location.href = "/dashboard"; }}>Ir a mi dashboard <Icon name="chevron" /></button>
              <small>Te guiamos dentro del producto para cargar tu primer plato.</small>
            </div>
          )}

          {step < 3 && <footer className="onboarding-actions"><button className="onboarding-back" disabled={step === 1} onClick={() => setStep(step - 1)}>Atrás</button><span>Podés modificar estos datos cuando quieras.</span><button className="onboarding-primary" onClick={nextStep}>Continuar <Icon name="chevron" size={17} /></button></footer>}
        </section>

        <aside className="onboarding-preview">
          <div className="preview-orbit one" /><div className="preview-orbit two" />
          <span className="preview-label">Vista previa</span>
          <div className="onboarding-phone">
            <div className="phone-top"><span className="phone-logo">{businessName ? businessName.slice(0, 2).toUpperCase() : "MC"}</span><span><strong>{businessName || "Tu restaurante"}</strong><small>{step >= 2 ? branchName : "Tu primera sucursal"}</small></span><Icon name="menu" size={18} /></div>
            <div className="phone-hero"><img src={menuItems[0].image} alt="" /><span><small>Bienvenidos</small><strong>{businessName || "Tu restaurante"}</strong></span></div>
            <div className="phone-categories"><span className="active">Recomendados</span><span>Entradas</span><span>Principales</span></div>
            <div className="phone-dish"><span><small>Muy pronto</small><strong>Tu carta empieza acá</strong><em>Cargá tus primeros platos</em></span><b>+</b></div>
          </div>
          <div className="preview-note"><span><Icon name="spark" /></span><p><strong>Así te verán tus clientes</strong><small>La vista se actualiza mientras completás los datos.</small></p></div>
        </aside>
      </main>
    </div>
  );
}

function LandingApp() {
  const [openFaq, setOpenFaq] = useState(0);
  const goTo = (path: string) => { window.location.href = path; };

  return (
    <div className="landing">
      <header className="landing-header">
        <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span><Icon name="brand" size={22} /></span>Mesa <strong>CLICK</strong>
        </button>
        <nav className="landing-nav">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#faq">Preguntas frecuentes</a>
        </nav>
        <div className="landing-header-actions">
          <button className="landing-login" onClick={() => goTo("/dashboard")}>Ingresar</button>
          <button className="landing-cta small" onClick={() => goTo("/registro")}>Probar gratis <Icon name="chevron" size={16} /></button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-kicker"><i /> El servicio de tu restaurante, conectado</span>
            <h1>Más mesas atendidas.<br /><em>Menos esperas.</em></h1>
            <p>Conectá salón, cocina y comensales en un solo lugar. Pedidos por QR, comandas en vivo y cuentas más simples para que tu equipo se enfoque en atender.</p>
            <div className="hero-actions">
              <button className="landing-cta" onClick={() => goTo("/registro")}>Empezar prueba gratis <Icon name="chevron" /></button>
              <button className="landing-demo" onClick={() => goTo("/mesa/demo")}><span><Icon name="qr" /></span> Ver experiencia del comensal</button>
            </div>
            <div className="hero-proof">
              <div className="proof-faces"><span>ML</span><span>RD</span><span>CP</span></div>
              <div><strong>Hecho con restaurantes, para restaurantes</strong><small>Configuración simple · Sin instalaciones</small></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo"><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85" alt="Salón de restaurante moderno" /></div>
            <div className="hero-order-card">
              <span className="landing-mini-icon"><Icon name="bell" size={18} /></span>
              <span><small>Pedido listo</small><strong>Mesa 12 · Terraza</strong></span>
              <i><Icon name="check" size={14} /></i>
            </div>
            <div className="hero-metric-card">
              <small>Tiempo promedio</small>
              <strong>−32%</strong>
              <span>en toma de pedidos</span>
              <div><i /><i /><i /><i /><i /></div>
            </div>
            <div className="hero-dots"><span /><span /><span /></div>
          </div>
        </section>

        <section className="trusted-strip">
          <span>Una operación más simple para</span>
          <div><b>CAFETERÍAS</b><b>RESTAURANTES</b><b>CERVECERÍAS</b><b>HOTELERÍA</b><b>FOOD HALLS</b></div>
        </section>

        <section className="landing-section how-section" id="como-funciona">
          <div className="section-intro">
            <span className="landing-eyebrow">Todo conectado</span>
            <h2>Una experiencia fluida,<br />de la mesa a la cocina</h2>
            <p>Cada persona recibe la información que necesita, en el momento indicado. Sin gritos, papeles ni pasos innecesarios.</p>
          </div>
          <div className="flow-grid">
            <article className="flow-card guest-flow">
              <span className="flow-number">01</span>
              <span className="flow-icon"><Icon name="qr" /></span>
              <h3>El comensal pide</h3>
              <p>Escanea el QR, explora la carta y envía su pedido desde el celular.</p>
              <div className="mini-phone">
                <div><span>Bajo Limonero</span><b>Mesa 14</b></div>
                <img src={menuItems[0].image} alt="" />
                <span>Smash Limonero <b>$ 9.200</b></span>
              </div>
            </article>
            <article className="flow-card kitchen-flow">
              <span className="flow-number">02</span>
              <span className="flow-icon"><Icon name="kitchen" /></span>
              <h3>Cocina se organiza</h3>
              <p>La comanda aparece al instante, con tiempos, notas y prioridades claras.</p>
              <div className="mini-kds">
                <span><i /> EN PREPARACIÓN <b>08:42</b></span>
                <strong>Mesa 14</strong>
                <small>2× Smash Limonero</small>
                <small>1× Ensalada tibia</small>
                <button>Marcar como listo</button>
              </div>
            </article>
            <article className="flow-card team-flow">
              <span className="flow-number">03</span>
              <span className="flow-icon"><Icon name="bell" /></span>
              <h3>El equipo entrega</h3>
              <p>Salón recibe la alerta, entrega a tiempo y cobra sin demoras.</p>
              <div className="mini-ready">
                <span><Icon name="bell" /></span>
                <div><small>LISTO PARA RETIRAR</small><strong>Mesa 14</strong><p>3 platos · Terraza</p></div>
                <i><Icon name="chevron" size={16} /></i>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-section benefits-section" id="beneficios">
          <div className="benefit-visual">
            <img src="https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1100&q=84" alt="Personas disfrutando en un restaurante" />
            <div className="benefit-stat"><strong>4.9</strong><span>Experiencia del cliente<br /><b>+24% este mes</b></span></div>
          </div>
          <div className="benefit-copy">
            <span className="landing-eyebrow">Menos fricción, más servicio</span>
            <h2>Tu equipo recupera tiempo para lo que realmente importa</h2>
            <p>Mesa CLICK no reemplaza la hospitalidad: elimina las tareas repetitivas que se interponen en el camino.</p>
            <ul>
              <li><span><Icon name="check" /></span><div><strong>Pedidos claros, desde el inicio</strong><p>Menos errores de carga y notas que llegan completas a cocina.</p></div></li>
              <li><span><Icon name="check" /></span><div><strong>Información en tiempo real</strong><p>Todos saben qué está pasando, sin depender de recorridas o gritos.</p></div></li>
              <li><span><Icon name="check" /></span><div><strong>Decisiones basadas en datos</strong><p>Entendé tus tiempos, productos y ventas desde un panel simple.</p></div></li>
            </ul>
            <button className="text-cta" onClick={() => goTo("/dashboard")}>Explorar el dashboard <Icon name="chevron" /></button>
          </div>
        </section>

        <section className="quote-section">
          <span className="quote-mark">“</span>
          <blockquote>Antes perdíamos tiempo confirmando comandas entre salón y cocina. Ahora todo el equipo ve lo mismo y podemos enfocarnos en que la gente la pase bien.</blockquote>
          <div><span>FP</span><p><strong>Florencia Paredes</strong><small>Fundadora, Casa Clara</small></p></div>
        </section>

        <section className="landing-section faq-section" id="faq">
          <div className="faq-intro">
            <span className="landing-eyebrow">Preguntas frecuentes</span>
            <h2>Todo lo que necesitás saber antes de empezar</h2>
            <p>¿Tenés otra pregunta? Escribinos y te ayudamos a evaluar Mesa CLICK para tu operación.</p>
            <button className="landing-demo"><span><Icon name="help" /></span> Hablar con una persona</button>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article className={openFaq === index ? "faq-item open" : "faq-item"} key={faq.question}>
                <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                  <span>{faq.question}</span><i>{openFaq === index ? "−" : "+"}</i>
                </button>
                <div><p>{faq.answer}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <span className="hero-kicker light"><i /> Empezá hoy</span>
            <h2>Tu próximo servicio puede ser más simple</h2>
            <p>Probá Mesa CLICK con tu equipo y descubrí una operación más ágil, clara y conectada.</p>
          </div>
          <div><button className="landing-cta light-button" onClick={() => goTo("/registro")}>Probar gratis por 14 días <Icon name="chevron" /></button><small>Sin tarjeta · Configuración asistida</small></div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><button className="landing-brand"><span><Icon name="brand" size={22} /></span>Mesa <strong>CLICK</strong></button><p>Tecnología simple para restaurantes que quieren brindar un mejor servicio.</p></div>
        <div><strong>Producto</strong><a href="#como-funciona">Cómo funciona</a><a href="#beneficios">Beneficios</a><button onClick={() => goTo("/mesa/demo")}>Demo QR</button></div>
        <div><strong>Compañía</strong><a href="#faq">Preguntas frecuentes</a><button>Contacto</button><button>Privacidad</button></div>
        <div className="footer-status"><span><i /> Todos los sistemas operativos</span><small>© 2025 Mesa CLICK</small></div>
      </footer>
    </div>
  );
}

function CustomerApp() {
  const [joined, setJoined] = useState(() => Boolean(window.localStorage.getItem("mesa-click-guest")));
  const [name, setName] = useState(() => window.localStorage.getItem("mesa-click-guest") || "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Recomendados");
  const [selectedItem, setSelectedItem] = useState<(typeof menuItems)[number] | null>(null);
  const [cart, setCart] = useState<(typeof menuItems)[number][]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const join = (anonymous = false) => {
    const guest = anonymous ? "Invitado" : name.trim();
    if (!guest) return;
    window.localStorage.setItem("mesa-click-guest", guest);
    setName(guest);
    setJoined(true);
  };

  const formatPrice = (price: number) => `$ ${price.toLocaleString("es-AR")}`;
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const filteredItems = menuItems.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  if (!joined) {
    return (
      <div className="guest-page">
        <div className="guest-phone welcome-view">
          <div className="welcome-photo">
            <img src="https://images.unsplash.com/photo-1764397514690-82da4d4c40ed?auto=format&fit=crop&w=900&q=84" alt="Platos de Bajo Limonero" />
            <button className="guest-demo-exit" onClick={() => { window.location.href = "/"; }}><Icon name="close" /></button>
            <div className="welcome-overlay">
              <span className="guest-logo"><Icon name="brand" size={22} /></span>
              <span>Bajo Limonero</span>
            </div>
          </div>
          <div className="welcome-content">
            <span className="table-chip"><Icon name="table" size={16} /> Mesa 14 · Terraza</span>
            <h1>Qué bueno tenerte acá</h1>
            <p>Sumate a la mesa para empezar a pedir. No necesitás registrarte ni descargar nada.</p>
            <label className="guest-field">
              <span>¿Cómo te llamás?</span>
              <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && join()} placeholder="Tu nombre o apodo" autoFocus />
            </label>
            <div className="guest-active">
              <span className="guest-faces"><i>MS</i><i>JL</i></span>
              <span><strong>Martina y Juli</strong> ya están pidiendo</span>
            </div>
            <button className="guest-primary" disabled={!name.trim()} onClick={() => join()}>Unirme a la mesa <Icon name="chevron" /></button>
            <button className="guest-link" onClick={() => join(true)}>Continuar sin nombre</button>
            <small className="secure-note"><Icon name="check" size={14} /> Sesión privada y segura para esta mesa</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="guest-page">
      <div className="guest-phone menu-view">
        <header className="guest-header">
          <div><button className="guest-venue">Bajo Limonero <Icon name="chevron" size={14} /></button><span>Mesa 14 · Terraza</span></div>
          <div className="guest-header-actions">
            <button aria-label="Ver cuenta" onClick={() => setSent(true)}><Icon name="card" /></button>
            <button className="guest-avatar" onClick={() => { window.localStorage.removeItem("mesa-click-guest"); setJoined(false); }}>{name.slice(0, 1).toUpperCase()}</button>
          </div>
        </header>

        {sent ? (
          <section className="order-status">
            <span className="status-check"><Icon name="check" size={30} /></span>
            <span className="table-chip">Comanda #14A4</span>
            <h1>Tu pedido ya está en cocina</h1>
            <p>Te avisamos cuando esté listo. Mientras tanto, podés seguir agregando lo que quieras.</p>
            <div className="order-stepper">
              <div className="done"><i><Icon name="check" size={14} /></i><span><strong>Pedido recibido</strong><small>20:42</small></span></div>
              <div className="active"><i /><span><strong>En preparación</strong><small>Cocina comenzó tu pedido</small></span></div>
              <div><i /><span><strong>Listo para servir</strong><small>Te avisaremos</small></span></div>
            </div>
            <button className="guest-primary" onClick={() => setSent(false)}>Pedir algo más</button>
            <button className="guest-secondary"><Icon name="card" /> Ver cuenta acumulada</button>
          </section>
        ) : (
          <>
            <div className="guest-sticky">
              <label className="guest-search"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="¿Qué te gustaría comer?" /></label>
              <div className="category-scroll">
                {["Recomendados", "Entradas", "Principales", "Bebidas", "Postres"].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
            </div>
            <main className="guest-menu-content">
              <div className="lunch-note"><Icon name="clock" size={17} /><span><strong>Menú noche</strong> · Disponible hasta las 00:30</span></div>
              <div className="guest-section-title"><div><span>Nuestra selección</span><h1>{category}</h1></div><small>{filteredItems.length} platos</small></div>
              <div className="food-list">
                {filteredItems.map((item) => (
                  <article className="food-card" key={item.name}>
                    <button className="food-info" onClick={() => setSelectedItem(item)}>
                      <span className="food-tag">{item.tag}</span>
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                      <strong>{formatPrice(item.price)}</strong>
                    </button>
                    <button className="food-image" onClick={() => setSelectedItem(item)} aria-label={`Ver ${item.name}`}>
                      <img src={item.image} alt={item.name} />
                      <span>+</span>
                    </button>
                  </article>
                ))}
              </div>
            </main>
          </>
        )}

        {!sent && (
          <nav className="guest-bottom-nav">
            <button className="active"><Icon name="book" /><span>Carta</span></button>
            <button><Icon name="clock" /><span>Mi pedido</span></button>
            <button onClick={() => setSent(true)}><Icon name="card" /><span>Cuenta</span></button>
          </nav>
        )}

        {cart.length > 0 && !sent && <button className="cart-bar" onClick={() => setCartOpen(true)}><span><b>{cart.length}</b> Ver pedido</span><strong>{formatPrice(cartTotal)}</strong></button>}

        {selectedItem && (
          <div className="guest-sheet-layer" onMouseDown={(event) => event.currentTarget === event.target && setSelectedItem(null)}>
            <section className="guest-sheet">
              <span className="sheet-handle" />
              <button className="sheet-close" aria-label="Cerrar" onClick={() => setSelectedItem(null)}><Icon name="close" /></button>
              <img className="sheet-photo" src={selectedItem.image} alt={selectedItem.name} />
              <div className="sheet-content">
                <span className="food-tag">{selectedItem.tag}</span>
                <h2>{selectedItem.name}</h2>
                <p>{selectedItem.description}</p>
                <div className="option-title"><span><strong>Elegí el punto</strong><small>Obligatorio</small></span><b>Elegí 1</b></div>
                {["Jugoso", "A punto", "Bien cocido"].map((option, index) => <label className="radio-row" key={option}><span>{option}</span><input type="radio" name="cook" defaultChecked={index === 1} /></label>)}
                <button className="guest-primary sheet-add" onClick={() => { setCart((current) => [...current, selectedItem]); setSelectedItem(null); }}>Agregar al pedido · {formatPrice(selectedItem.price)}</button>
              </div>
            </section>
          </div>
        )}

        {cartOpen && (
          <div className="guest-sheet-layer">
            <section className="guest-sheet cart-sheet">
              <span className="sheet-handle" />
              <div className="cart-title"><div><small>Mesa 14</small><h2>Tu pedido</h2></div><button className="sheet-close static" onClick={() => setCartOpen(false)}><Icon name="close" /></button></div>
              <div className="cart-person"><span>{name.slice(0, 1).toUpperCase()}</span><strong>Tus elecciones ({name})</strong></div>
              {cart.map((item, index) => <div className="cart-item" key={`${item.name}-${index}`}><b>1×</b><span><strong>{item.name}</strong><small>A punto</small></span><em>{formatPrice(item.price)}</em><button onClick={() => setCart((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Icon name="close" size={15} /></button></div>)}
              <div className="cart-total"><span>Subtotal de esta ronda</span><strong>{formatPrice(cartTotal)}</strong></div>
              <button className="guest-primary" onClick={() => { setCart([]); setCartOpen(false); setSent(true); }}><Icon name="kitchen" /> Confirmar y enviar a cocina</button>
              <button className="guest-link" onClick={() => setCartOpen(false)}>Seguir agregando platos</button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  available: boolean;
  variants: number;
  image: string;
};

const catalogSeed: CatalogProduct[] = [
  { id: 1, name: "Smash Limonero", category: "Principales", price: 9200, available: true, variants: 3, image: menuItems[0].image },
  { id: 2, name: "Ensalada tibia", category: "Principales", price: 7800, available: true, variants: 2, image: menuItems[1].image },
  { id: 3, name: "Pesca del día", category: "Principales", price: 12600, available: false, variants: 2, image: menuItems[2].image },
  { id: 4, name: "Burrata de estación", category: "Entradas", price: 8400, available: true, variants: 0, image: "https://images.unsplash.com/photo-1761315631508-eb81f826e6c3?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Limonada de menta", category: "Bebidas", price: 3900, available: true, variants: 2, image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=300&q=80" },
];

function CatalogModule({ onNotice }: { onNotice: (message: string) => void }) {
  const [products, setProducts] = useState(catalogSeed);
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"table" | "grid">("table");
  const [newName, setNewName] = useState("");
  const categories = ["Todos", "Entradas", "Principales", "Bebidas", "Postres"];
  const visible = products.filter((product) => (category === "Todos" || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()));

  const toggleStock = (product: CatalogProduct) => {
    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, available: !item.available } : item));
    onNotice(product.available ? `${product.name} marcado como agotado` : `${product.name} disponible nuevamente`);
  };

  const addProduct = () => {
    if (!newName.trim()) return;
    setProducts((current) => [...current, { id: Date.now(), name: newName.trim(), category: "Principales", price: 8500, available: true, variants: 0, image: menuItems[0].image }]);
    setNewName("");
    setCreateOpen(false);
    onNotice("Artículo creado correctamente");
  };

  return (
    <div className="catalog-page">
      <section className="catalog-heading">
        <div><span className="eyebrow">Gestión de carta</span><h1>Tu carta</h1><p>Administrá productos, precios y disponibilidad en tiempo real.</p></div>
        <div className="catalog-main-actions">
          <button className="secondary-button"><span className="button-plus">%</span> Ajustar precios</button>
          <button className="secondary-button"><Icon name="grid" /> Carga masiva</button>
          <button className="primary-button" onClick={() => setCreateOpen(true)}><span className="button-plus">+</span> Nuevo artículo</button>
        </div>
      </section>

      <section className="catalog-summary">
        <div><span className="metric-icon coral"><Icon name="book" /></span><span><small>Artículos publicados</small><strong>{products.length}</strong></span></div>
        <div><span className="metric-icon green"><Icon name="check" /></span><span><small>Disponibles ahora</small><strong>{products.filter((product) => product.available).length}</strong></span></div>
        <div><span className="metric-icon amber"><Icon name="bell" /></span><span><small>Agotados / 86</small><strong>{products.filter((product) => !product.available).length}</strong></span></div>
        <button><span><Icon name="clock" /></span><div><small>Franja activa</small><strong>Menú noche</strong><em>18:00 — 00:30</em></div><Icon name="chevron" size={16} /></button>
      </section>

      <section className="catalog-toolbar">
        <label className="catalog-search"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o categoría..." /></label>
        <div className="catalog-categories">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}{item !== "Todos" && <span>{products.filter((product) => product.category === item).length}</span>}</button>)}</div>
        <div className="view-toggle"><button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon name="menu" size={17} /></button><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><Icon name="grid" size={17} /></button></div>
      </section>

      <section className="catalog-panel">
        <div className="catalog-panel-heading"><div><h2>{category === "Todos" ? "Todos los artículos" : category}</h2><p>{visible.length} artículos · Los cambios se guardan automáticamente</p></div><button className="secondary-button"><span className="button-plus">+</span> Nueva categoría</button></div>
        {view === "table" ? (
          <div className="catalog-table">
            <div className="catalog-table-head"><span>Artículo</span><span>Categoría</span><span>Precio</span><span>Disponibilidad</span><span>Variantes</span><span /></div>
            {visible.map((product) => (
              <div className={product.available ? "catalog-row" : "catalog-row unavailable"} key={product.id}>
                <div className="catalog-product"><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{product.available ? "Visible en la carta digital" : "Oculto temporalmente para clientes"}</small></span></div>
                <span className="catalog-category">{product.category}</span>
                <strong className="catalog-price">$ {product.price.toLocaleString("es-AR")}</strong>
                <label className="stock-control"><button className={product.available ? "stock-switch on" : "stock-switch"} onClick={() => toggleStock(product)} aria-label={`Cambiar disponibilidad de ${product.name}`}><i /></button><span>{product.available ? "Disponible" : "Agotado"}</span></label>
                <button className="variant-button">{product.variants ? `${product.variants} grupos` : "Sin variantes"} <Icon name="chevron" size={14} /></button>
                <button className="row-menu" aria-label="Más acciones"><Icon name="more" /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="catalog-grid">
            {visible.map((product) => (
              <article className={!product.available ? "catalog-grid-card unavailable" : "catalog-grid-card"} key={product.id}>
                <div><img src={product.image} alt={product.name} /><span className={product.available ? "availability-badge" : "availability-badge off"}>{product.available ? "Disponible" : "Agotado"}</span><button className="row-menu"><Icon name="more" /></button></div>
                <section><small>{product.category}</small><h3>{product.name}</h3><strong>$ {product.price.toLocaleString("es-AR")}</strong><label className="stock-control"><span>Stock en vivo</span><button className={product.available ? "stock-switch on" : "stock-switch"} onClick={() => toggleStock(product)}><i /></button></label></section>
              </article>
            ))}
          </div>
        )}
        {visible.length === 0 && <div className="catalog-empty"><Icon name="search" /><strong>No encontramos artículos</strong><p>Probá con otra búsqueda o categoría.</p></div>}
      </section>

      {createOpen && (
        <div className="modal-layer catalog-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setCreateOpen(false)}>
          <div className="catalog-modal" role="dialog" aria-modal="true" aria-label="Nuevo artículo">
            <div className="catalog-modal-heading"><div><span className="eyebrow">Carta digital</span><h2>Nuevo artículo</h2><p>Completá la información que verá el comensal.</p></div><button className="icon-button" onClick={() => setCreateOpen(false)}><Icon name="close" /></button></div>
            <label className="catalog-field"><span>Nombre del plato</span><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ej: Milanesa de hongos" autoFocus /></label>
            <div className="catalog-field-row">
              <label className="catalog-field"><span>Categoría</span><select defaultValue="Principales"><option>Entradas</option><option>Principales</option><option>Bebidas</option><option>Postres</option></select></label>
              <label className="catalog-field"><span>Precio</span><input defaultValue="8500" inputMode="numeric" /></label>
            </div>
            <label className="catalog-field"><span>Descripción</span><textarea placeholder="Ingredientes y una descripción breve para el comensal" rows={3} /></label>
            <button className="catalog-upload"><span><Icon name="card" /></span><strong>Agregar una foto</strong><small>PNG o JPG · Hasta 5 MB</small></button>
            <div className="catalog-modal-actions"><button className="secondary-button" onClick={() => setCreateOpen(false)}>Cancelar</button><button className="primary-button" disabled={!newName.trim()} onClick={addProduct}>Crear artículo</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsModule({ onNotice }: { onNotice: (message: string) => void }) {
  const [tab, setTab] = useState("Negocio");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [connected, setConnected] = useState(false);
  const [accent, setAccent] = useState("coral");
  const [days, setDays] = useState<Record<string, boolean>>({ Lunes: true, Martes: true, Miércoles: true, Jueves: true, Viernes: true, Sábado: true, Domingo: false });
  const tabs: { name: string; icon: IconName; caption: string }[] = [
    { name: "Negocio", icon: "brand", caption: "Identidad y datos" },
    { name: "Sucursales y horarios", icon: "table", caption: "Turnos y atención" },
    { name: "Pagos", icon: "card", caption: "Mercado Pago" },
    { name: "Equipo", icon: "users", caption: "Usuarios y permisos" },
  ];
  const notify = (message: string) => { onNotice(message); };

  return (
    <div className="settings-page">
      <section className="settings-heading">
        <div><span className="eyebrow">Administración</span><h1>Configuración</h1><p>Gestioná la identidad, operación y accesos de tu negocio.</p></div>
        <button className="primary-button" onClick={() => notify("Cambios guardados correctamente")}><Icon name="check" /> Guardar cambios</button>
      </section>

      <div className="settings-layout">
        <aside className="settings-tabs">
          {tabs.map((item) => <button key={item.name} className={tab === item.name ? "active" : ""} onClick={() => setTab(item.name)}><span><Icon name={item.icon} /></span><div><strong>{item.name}</strong><small>{item.caption}</small></div><Icon name="chevron" size={15} /></button>)}
          <div className="settings-help"><span><Icon name="help" /></span><strong>¿Necesitás ayuda?</strong><p>Nuestro equipo puede ayudarte a configurar tu cuenta.</p><button>Contactar soporte</button></div>
        </aside>

        <main className="settings-content">
          {tab === "Negocio" && (
            <>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Perfil del negocio</h2><p>Esta información identifica al restaurante dentro de Mesa CLICK.</p></div><span className="settings-complete"><Icon name="check" size={14} /> Perfil completo</span></div>
                <div className="business-profile">
                  <button className="logo-upload"><span>BL</span><i>+</i></button>
                  <div><strong>Logo del negocio</strong><p>PNG o JPG, fondo cuadrado. Máximo 2 MB.</p><button>Cambiar logo</button><button className="remove">Eliminar</button></div>
                </div>
                <div className="settings-form-grid">
                  <label className="settings-field"><span>Nombre de fantasía</span><input defaultValue="Bajo Limonero" /></label>
                  <label className="settings-field"><span>Slug público</span><div className="prefixed-input"><em>mesaclick.com/</em><input defaultValue="bajo-limonero" /></div></label>
                  <label className="settings-field full-span"><span>Descripción breve</span><textarea rows={3} defaultValue="Cocina de estación, productos frescos y encuentros que se alargan." /><small>Visible en la carta digital del comensal.</small></label>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Identidad visual</h2><p>Personalizá la experiencia móvil con los colores de tu marca.</p></div></div>
                <div className="brand-colors">
                  <div><strong>Color principal</strong><p>Se usa en botones, enlaces y acciones destacadas.</p><div className="color-options">{["coral", "green", "blue", "ochre", "navy"].map((color) => <button key={color} className={`${color} ${accent === color ? "active" : ""}`} onClick={() => setAccent(color)}>{accent === color && <Icon name="check" size={15} />}</button>)}</div></div>
                  <div className={`brand-preview ${accent}`}><span>Vista previa</span><div><b>BL</b><section><small>Bajo Limonero</small><strong>¿Qué te gustaría pedir?</strong><button>Ver la carta</button></section></div></div>
                </div>
              </section>

              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Datos fiscales y contacto</h2><p>Información privada utilizada para facturación y comunicaciones.</p></div></div>
                <div className="settings-form-grid">
                  <label className="settings-field"><span>Razón social</span><input defaultValue="Bajo Limonero Gastronomía S.A.S." /></label>
                  <label className="settings-field"><span>CUIT</span><input defaultValue="30-71845632-1" /></label>
                  <label className="settings-field"><span>Correo administrativo</span><input defaultValue="administracion@bajolimonero.com" /></label>
                  <label className="settings-field"><span>Teléfono</span><input defaultValue="+54 11 4855 0192" /></label>
                </div>
              </section>
            </>
          )}

          {tab === "Sucursales y horarios" && (
            <>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Sucursales</h2><p>Configurá cada local y su operación de forma independiente.</p></div><button className="secondary-button"><span className="button-plus">+</span> Nueva sucursal</button></div>
                <article className="branch-card"><span className="branch-icon"><Icon name="table" /></span><div><span className="branch-status"><i /> Activa</span><h3>Casa central · Palermo</h3><p>Gorriti 4821, Ciudad Autónoma de Buenos Aires</p><small>24 mesas · 4 sectores · Zona horaria GMT−3</small></div><button><Icon name="more" /></button></article>
              </section>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Días y horarios de atención</h2><p>Definí cuándo los clientes pueden acceder a la carta y realizar pedidos.</p></div><span className="settings-branch-select">Casa central <Icon name="chevron" size={14} /></span></div>
                <div className="hours-list">
                  {Object.entries(days).map(([day, enabled]) => <div className={!enabled ? "hours-row disabled" : "hours-row"} key={day}><button className={enabled ? "stock-switch on" : "stock-switch"} onClick={() => setDays((current) => ({ ...current, [day]: !enabled }))}><i /></button><strong>{day}</strong>{enabled ? <><label><span>Abre</span><input defaultValue={day === "Viernes" || day === "Sábado" ? "18:00" : "12:00"} /></label><span>—</span><label><span>Cierra</span><input defaultValue={day === "Viernes" || day === "Sábado" ? "01:00" : "00:00"} /></label><button className="hours-add">+ Agregar turno</button></> : <em>Cerrado</em>}</div>)}
                </div>
              </section>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Franjas de carta</h2><p>Mostrá categorías diferentes según el momento del día.</p></div><button className="secondary-button"><span className="button-plus">+</span> Nueva franja</button></div>
                <div className="schedule-cards"><article><span className="schedule-icon morning"><Icon name="clock" /></span><div><strong>Almuerzo</strong><p>12:00 — 16:00</p><small>4 categorías · 18 artículos</small></div><button><Icon name="more" /></button></article><article><span className="schedule-icon night"><Icon name="clock" /></span><div><strong>Menú noche</strong><p>18:00 — 00:30</p><small>5 categorías · 26 artículos</small></div><button><Icon name="more" /></button></article></div>
              </section>
            </>
          )}

          {tab === "Pagos" && (
            <>
              <section className="settings-card payment-hero">
                <div className="mp-mark"><span>mp</span></div>
                <div><span className={connected ? "integration-state connected" : "integration-state"}><i /> {connected ? "Cuenta conectada" : "Configuración pendiente"}</span><h2>Mercado Pago</h2><p>Permití que tus clientes paguen la cuenta o su parte directamente desde el celular.</p></div>
                <button className={connected ? "secondary-button" : "primary-button"} onClick={() => { setConnected(!connected); notify(connected ? "Cuenta de Mercado Pago desconectada" : "Mercado Pago conectado correctamente"); }}>{connected ? "Desconectar" : "Conectar cuenta"}</button>
              </section>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Cómo funciona el cobro digital</h2><p>Un flujo seguro para tu negocio y simple para el comensal.</p></div></div>
                <div className="payment-steps"><div><span>1</span><strong>El mozo habilita el pago</strong><p>Desde el panel de salón cuando la mesa solicita la cuenta.</p></div><Icon name="chevron" /><div><span>2</span><strong>El cliente paga</strong><p>Abona con cualquier medio disponible en Mercado Pago.</p></div><Icon name="chevron" /><div><span>3</span><strong>Recibís la confirmación</strong><p>El dashboard se actualiza automáticamente en tiempo real.</p></div></div>
              </section>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Preferencias de cobro</h2><p>Estas opciones se activarán al conectar una cuenta.</p></div></div>
                <div className={connected ? "payment-options" : "payment-options locked"}><label><span><strong>Permitir división por persona</strong><small>Cada comensal puede pagar exactamente su consumo.</small></span><button className="stock-switch on"><i /></button></label><label><span><strong>Aceptar propinas digitales</strong><small>Ofrecé porcentajes sugeridos al finalizar el pago.</small></span><button className="stock-switch on"><i /></button></label><label><span><strong>Cerrar mesa automáticamente</strong><small>Libera la mesa cuando el pago total fue confirmado.</small></span><button className="stock-switch"><i /></button></label></div>
              </section>
            </>
          )}

          {tab === "Equipo" && (
            <>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Equipo y permisos</h2><p>Administrá quién puede acceder y qué acciones puede realizar.</p></div><button className="primary-button" onClick={() => setInviteOpen(true)}><span className="button-plus">+</span> Invitar persona</button></div>
                <div className="team-table">
                  <div className="team-table-head"><span>Persona</span><span>Rol</span><span>Sucursal</span><span>Estado</span><span /></div>
                  {[
                    ["ML", "Martina López", "martina@bajolimonero.com", "Administradora", "Todas"],
                    ["FP", "Federico Paz", "fede@bajolimonero.com", "Encargado", "Casa central"],
                    ["LS", "Lucía Soto", "lucia@bajolimonero.com", "Mozo", "Casa central"],
                    ["RC", "Ramiro Costa", "ramiro@bajolimonero.com", "Cocina", "Casa central"],
                  ].map((person, index) => <div className="team-row" key={person[1]}><div><span className={`team-avatar a${index}`}>{person[0]}</span><span><strong>{person[1]}</strong><small>{person[2]}</small></span></div><span className="role-chip">{person[3]}</span><span>{person[4]}</span><span className="active-user"><i /> Activo</span><button><Icon name="more" /></button></div>)}
                </div>
              </section>
              <section className="settings-card">
                <div className="settings-card-head"><div><h2>Roles disponibles</h2><p>Cada rol tiene permisos pensados para su función.</p></div></div>
                <div className="roles-grid">{[["Administradora", "Acceso total a operación, configuración y métricas."], ["Encargado", "Gestiona salón, carta, mesas y equipo operativo."], ["Mozo", "Accede al salón en vivo, mesas y cobros."], ["Cocina", "Acceso exclusivo al KDS y stock en vivo."]].map(([role, description]) => <article key={role}><span><Icon name={role === "Cocina" ? "kitchen" : "users"} /></span><strong>{role}</strong><p>{description}</p></article>)}</div>
              </section>
            </>
          )}
        </main>
      </div>

      {inviteOpen && (
        <div className="modal-layer catalog-modal-layer" onMouseDown={(event) => event.target === event.currentTarget && setInviteOpen(false)}>
          <div className="catalog-modal invite-modal">
            <div className="catalog-modal-heading"><div><span className="eyebrow">Gestión de equipo</span><h2>Invitar una persona</h2><p>Le enviaremos un enlace seguro para crear su acceso.</p></div><button className="icon-button" onClick={() => setInviteOpen(false)}><Icon name="close" /></button></div>
            <label className="catalog-field"><span>Correo electrónico</span><input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="nombre@restaurante.com" autoFocus /></label>
            <div className="catalog-field-row"><label className="catalog-field"><span>Rol</span><select defaultValue="Mozo"><option>Administrador</option><option>Encargado</option><option>Mozo</option><option>Cocina</option></select></label><label className="catalog-field"><span>Sucursal</span><select><option>Casa central</option><option>Todas</option></select></label></div>
            <div className="invite-note"><Icon name="help" /><span><strong>Acceso sin contraseña</strong><small>La persona ingresará mediante un enlace mágico enviado a su correo.</small></span></div>
            <div className="catalog-modal-actions"><button className="secondary-button" onClick={() => setInviteOpen(false)}>Cancelar</button><button className="primary-button" disabled={!inviteEmail.includes("@")} onClick={() => { setInviteOpen(false); setInviteEmail(""); notify("Invitación enviada correctamente"); }}>Enviar invitación</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

type KitchenItem = { id: number; quantity: number; name: string; detail?: string; note?: string; guest: string; done: boolean };
type KitchenOrder = { id: string; table: number; area: string; minutes: number; status: "pending" | "cooking" | "ready"; items: KitchenItem[] };

const kitchenSeed: KitchenOrder[] = [
  { id: "12A4", table: 12, area: "Terraza", minutes: 23, status: "pending", items: [
    { id: 1, quantity: 2, name: "Smash Limonero", detail: "A punto · Papas rústicas", note: "Una sin cebolla", guest: "Martina", done: false },
    { id: 2, quantity: 1, name: "Ensalada tibia", detail: "Aderezo aparte", guest: "Juli", done: false },
  ] },
  { id: "07C2", table: 7, area: "Salón", minutes: 14, status: "pending", items: [
    { id: 3, quantity: 1, name: "Pesca del día", detail: "Vegetales grillados", note: "Sin sal agregada", guest: "Nicolás", done: false },
    { id: 4, quantity: 2, name: "Papas rústicas", guest: "Mesa", done: false },
  ] },
  { id: "18B4", table: 18, area: "Patio", minutes: 9, status: "cooking", items: [
    { id: 5, quantity: 3, name: "Smash Limonero", detail: "2 a punto · 1 bien cocida", guest: "Tomás", done: true },
    { id: 6, quantity: 1, name: "Burrata de estación", note: "Alérgico al maní", guest: "Clara", done: false },
    { id: 7, quantity: 2, name: "Ensalada tibia", guest: "Sofía", done: false },
  ] },
  { id: "04A8", table: 4, area: "Salón", minutes: 17, status: "cooking", items: [
    { id: 8, quantity: 2, name: "Pesca del día", detail: "Una sin coliflor", guest: "Pablo", done: true },
    { id: 9, quantity: 1, name: "Smash Limonero", detail: "Jugosa · Extra queso", guest: "Agus", done: false },
  ] },
  { id: "09D1", table: 9, area: "Terraza", minutes: 11, status: "ready", items: [
    { id: 10, quantity: 2, name: "Smash Limonero", guest: "Mesa", done: true },
    { id: 11, quantity: 1, name: "Ensalada tibia", guest: "Luz", done: true },
  ] },
];

function KitchenApp() {
  const [orders, setOrders] = useState(kitchenSeed);
  const [sound, setSound] = useState(true);
  const [time, setTime] = useState(new Date());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const cycleItem = (orderId: string, itemId: number) => {
    setOrders((current) => current.map((order) => order.id === orderId ? {
      ...order,
      status: order.status === "pending" ? "cooking" : order.status,
      items: order.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item),
    } : order));
  };

  const completeOrder = (orderId: string) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: "ready", items: order.items.map((item) => ({ ...item, done: true })) } : order));
  };

  const dispatchOrder = (orderId: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (order) setHistory((current) => [order, ...current]);
    setOrders((current) => current.filter((item) => item.id !== orderId));
  };

  const reopenOrder = (orderId: string) => {
    const order = history.find((item) => item.id === orderId);
    if (!order) return;
    setOrders((current) => [...current, { ...order, status: "ready" }]);
    setHistory((current) => current.filter((item) => item.id !== orderId));
  };

  const columns = [
    { status: "pending" as const, title: "Pendientes", subtitle: "Orden de llegada" },
    { status: "cooking" as const, title: "En preparación", subtitle: "En cocina ahora" },
    { status: "ready" as const, title: "Listos para retirar", subtitle: "Esperando al salón" },
  ];

  return (
    <div className="kds-app">
      <header className="kds-header">
        <button className="kds-brand" onClick={() => { window.location.href = "/dashboard"; }}><span><Icon name="brand" /></span><strong>Mesa CLICK</strong><small>KDS Cocina</small></button>
        <div className="kds-station"><span>Cocina principal</span><button>Casa central <Icon name="chevron" size={14} /></button></div>
        <div className="kds-clock"><small>Viernes 08 MAR</small><strong>{time.toLocaleTimeString("es-AR", { hour12: false })}</strong></div>
        <div className="kds-header-actions">
          <span className="kds-live"><i /> En vivo</span>
          <button onClick={() => setSound(!sound)}><Icon name={sound ? "bell" : "close"} /><span>{sound ? "Sonido activo" : "Sin sonido"}</span></button>
          <button onClick={() => setHistoryOpen(true)}><Icon name="clock" /><span>Historial</span>{history.length > 0 && <b>{history.length}</b>}</button>
          <button aria-label="Pantalla completa" onClick={() => document.documentElement.requestFullscreen?.()}><Icon name="grid" /></button>
        </div>
      </header>

      <section className="kds-summary">
        <div><span>Servicio noche</span><strong>{orders.length} comandas activas</strong></div>
        <div><span>Tiempo promedio</span><strong>12:34 min</strong></div>
        <div className="kds-warning"><span><i /> Atención</span><strong>{orders.filter((order) => order.minutes >= 20).length} pedido demorado</strong></div>
      </section>

      <main className="kds-board">
        {columns.map((column) => {
          const columnOrders = orders.filter((order) => order.status === column.status);
          return (
            <section className={`kds-column ${column.status}`} key={column.status}>
              <div className="kds-column-heading">
                <span className="kds-column-dot" />
                <div><h2>{column.title}</h2><p>{column.subtitle}</p></div>
                <b>{columnOrders.length}</b>
              </div>
              <div className="kds-orders">
                {columnOrders.map((order) => {
                  const urgency = order.minutes >= 20 ? "critical" : order.minutes >= 10 ? "warning" : "normal";
                  return (
                    <article className={`kds-ticket ${urgency}`} key={order.id}>
                      <div className="kds-ticket-head">
                        <div><small>{order.area}</small><h3>Mesa {order.table}</h3><span>#{order.id}</span></div>
                        <span className={`kds-timer ${urgency}`}><Icon name="clock" size={17} /><strong>{String(order.minutes).padStart(2, "0")}:{order.id.slice(-2)}</strong></span>
                      </div>
                      <div className="kds-item-list">
                        {order.items.map((item) => (
                          <button className={item.done ? "kds-item done" : "kds-item"} key={item.id} onClick={() => cycleItem(order.id, item.id)}>
                            <span className="kds-qty">{item.quantity}×</span>
                            <span className="kds-item-copy"><strong>{item.name}</strong>{item.detail && <small>{item.detail}</small>}{item.note && <em><Icon name="bell" size={13} /> {item.note}</em>}<i>Pedido por {item.guest}</i></span>
                            <span className="kds-check">{item.done && <Icon name="check" size={17} />}</span>
                          </button>
                        ))}
                      </div>
                      <div className="kds-ticket-actions">
                        {order.status !== "ready" ? <button onClick={() => completeOrder(order.id)}><Icon name="check" /> Comanda completa lista</button> : <button className="dispatch" onClick={() => dispatchOrder(order.id)}><Icon name="bell" /> Despachar al salón</button>}
                      </div>
                    </article>
                  );
                })}
                {columnOrders.length === 0 && <div className="kds-empty"><span><Icon name="check" /></span><strong>Todo al día</strong><p>No hay comandas en esta etapa.</p></div>}
              </div>
            </section>
          );
        })}
      </main>

      {historyOpen && (
        <div className="kds-drawer-layer" onMouseDown={(event) => event.target === event.currentTarget && setHistoryOpen(false)}>
          <aside className="kds-history">
            <div className="kds-history-head"><div><small>Últimos despachos</small><h2>Historial de cocina</h2></div><button onClick={() => setHistoryOpen(false)}><Icon name="close" /></button></div>
            <p>Podés recuperar una comanda despachada por error.</p>
            {history.length === 0 ? <div className="kds-history-empty"><Icon name="clock" /><strong>Todavía no hay despachos</strong><span>Las comandas finalizadas aparecerán acá.</span></div> : history.map((order) => (
              <div className="kds-history-row" key={order.id}><span><small>#{order.id} · {order.area}</small><strong>Mesa {order.table}</strong><em>Despachado recién</em></span><button onClick={() => reopenOrder(order.id)}>Reabrir</button></div>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}

function DashboardApp() {
  const [activeNav, setActiveNav] = useState(() => window.location.pathname.includes("/configuracion") ? "Configuración" : window.location.pathname.includes("/carta") ? "Carta" : "Salón en vivo");
  const [mobileNav, setMobileNav] = useState(false);
  const [filter, setFilter] = useState<"Todas" | "Salón" | "Terraza" | "Patio">("Todas");
  const [tables, setTables] = useState(initialTables);
  const [selected, setSelected] = useState<TableData | null>(null);
  const [notice, setNotice] = useState("");

  const visibleTables = useMemo(() => filter === "Todas" ? tables : tables.filter((table) => table.area === filter), [filter, tables]);
  const count = (status: TableStatus) => visibleTables.filter((table) => table.status === status).length;

  const updateTable = (id: number, message: string, remove = false) => {
    setNotice(message);
    if (remove) setTables((current) => current.filter((table) => table.id !== id));
    else setTables((current) => current.map((table) => table.id === id ? { ...table, status: "En preparación", detail: "Pedido entregado · Mesa consumiendo", time: "Ahora" } : table));
    setSelected(null);
    window.setTimeout(() => setNotice(""), 2800);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark"><Icon name="brand" size={23} /></span>
          <span className="brand-name">Mesa <strong>CLICK</strong></span>
          <button className="sidebar-close" aria-label="Cerrar menú" onClick={() => setMobileNav(false)}><Icon name="close" /></button>
        </div>
        <div className="venue-card">
          <span className="venue-avatar">BL</span>
          <span><strong>Bajo Limonero</strong><small>Palermo · Casa central</small></span>
          <Icon name="chevron" size={16} />
        </div>
        <nav className="nav">
          <span className="nav-label">Operación</span>
          {navItems.slice(0, 2).map((item) => (
            <button key={item.label} className={activeNav === item.label ? "nav-item active" : "nav-item"} onClick={() => { if (item.label === "Cocina KDS") { window.location.href = "/kds"; return; } setActiveNav(item.label); window.history.pushState({}, "", item.label === "Carta" ? "/dashboard/carta" : "/dashboard"); setMobileNav(false); }}>
              <Icon name={item.icon} /><span>{item.label}</span>{item.badge && <b>{item.badge}</b>}
            </button>
          ))}
          <span className="nav-label second">Administración</span>
          {navItems.slice(2).map((item) => (
            <button key={item.label} className={activeNav === item.label ? "nav-item active" : "nav-item"} onClick={() => { setActiveNav(item.label); window.history.pushState({}, "", item.label === "Carta" ? "/dashboard/carta" : item.label === "Configuración" ? "/dashboard/configuracion" : "/dashboard"); setMobileNav(false); }}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="tour-button"><span><Icon name="spark" /></span><span><strong>Recorrido guiado</strong><small>Conocé todas las funciones</small></span></button>
          <button className="profile-button"><span className="profile-avatar">ML</span><span><strong>Martina López</strong><small>Administradora</small></span><Icon name="more" /></button>
        </div>
      </aside>

      {mobileNav && <button className="scrim" aria-label="Cerrar navegación" onClick={() => setMobileNav(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="menu-button" aria-label="Abrir menú" onClick={() => setMobileNav(true)}><Icon name="menu" /></button>
          <div className="live-state"><span /><strong>En vivo</strong><small>Actualizado ahora</small></div>
          <div className="top-actions">
            <button className="search-button"><Icon name="search" /><span>Buscar mesa</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" aria-label="Ayuda"><Icon name="help" /></button>
            <button className="icon-button notification" aria-label="Notificaciones"><Icon name="bell" /><span /></button>
            <span className="top-avatar">ML</span>
          </div>
        </header>

        <div className="content">
          {activeNav === "Configuración" ? <SettingsModule onNotice={(message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }} /> : activeNav === "Carta" ? <CatalogModule onNotice={(message) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); }} /> : <>
          <section className="page-heading">
            <div><span className="eyebrow">Viernes, 8 de marzo</span><h1>Buenas noches, Martina</h1><p>Esto está pasando en tu salón ahora.</p></div>
            <div className="heading-actions">
              <button className="secondary-button qr-demo-button" onClick={() => { window.location.href = "/mesa/demo"; }}><Icon name="qr" /> Vista comensal</button>
              <button className="secondary-button"><Icon name="kitchen" /> Abrir cocina KDS <Icon name="chevron" size={16} /></button>
              <button className="primary-button"><Icon name="table" /> Nueva mesa</button>
            </div>
          </section>

          <section className="metrics-grid">
            <div className="metric-card"><span className="metric-icon coral"><Icon name="table" /></span><span><small>Mesas activas</small><strong>7 <em>de 24</em></strong></span><span className="trend">+2 esta hora</span></div>
            <div className="metric-card"><span className="metric-icon amber"><Icon name="clock" /></span><span><small>Pedidos en curso</small><strong>5</strong></span><span className="metric-caption">Prom. 12 min</span></div>
            <div className="metric-card ready-metric"><span className="metric-icon green"><Icon name="bell" /></span><span><small>Listos para retirar</small><strong>{count("Listo para retirar")}</strong></span><span className="pulse-label"><i /> Requiere atención</span></div>
            <div className="metric-card"><span className="metric-icon blue"><Icon name="card" /></span><span><small>Ventas del turno</small><strong>$ 286.4k</strong></span><span className="trend">+12,4%</span></div>
          </section>

          {count("Listo para retirar") > 0 && (
            <section className="ready-banner">
              <span className="banner-beacon"><Icon name="bell" /></span>
              <div><strong>{count("Listo para retirar")} pedidos listos para retirar</strong><p>Cocina está esperando que un mozo los lleve a la mesa.</p></div>
              <button onClick={() => document.getElementById("ready-orders")?.scrollIntoView({ behavior: "smooth" })}>Ver pedidos <Icon name="chevron" size={17} /></button>
            </section>
          )}

          <section className="section-header">
            <div><h2>Salón en vivo</h2><p>{tables.length} mesas activas · 21 comensales</p></div>
            <div className="filters">
              {(["Todas", "Salón", "Terraza", "Patio"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}
            </div>
          </section>

          {count("Cuenta solicitada") > 0 && (
            <section className="status-section">
              <div className="status-heading"><span className="heading-icon bill"><Icon name="card" size={18} /></span><div><h3>Solicitudes de cuenta</h3><p>Atender primero</p></div><span className="count bill">{count("Cuenta solicitada")}</span></div>
              <div className="cards-grid">{visibleTables.filter((table) => table.status === "Cuenta solicitada").map((table) => <TableCard key={table.id} table={table} onOpen={() => setSelected(table)} />)}</div>
            </section>
          )}

          {count("Listo para retirar") > 0 && (
            <section className="status-section" id="ready-orders">
              <div className="status-heading"><span className="heading-icon ready"><Icon name="bell" size={18} /></span><div><h3>Listos para retirar</h3><p>Llevar a la mesa</p></div><span className="count ready">{count("Listo para retirar")}</span></div>
              <div className="cards-grid">{visibleTables.filter((table) => table.status === "Listo para retirar").map((table) => <TableCard key={table.id} table={table} onOpen={() => setSelected(table)} />)}</div>
            </section>
          )}

          {count("En preparación") > 0 && (
            <section className="status-section">
              <div className="status-heading"><span className="heading-icon progress"><Icon name="clock" size={18} /></span><div><h3>En preparación</h3><p>Pedidos activos en cocina</p></div><span className="count progress">{count("En preparación")}</span></div>
              <div className="cards-grid">{visibleTables.filter((table) => table.status === "En preparación").map((table) => <TableCard key={table.id} table={table} onOpen={() => setSelected(table)} />)}</div>
            </section>
          )}
          </>}
        </div>
      </main>

      {selected && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="table-drawer" role="dialog" aria-modal="true" aria-label={`Detalle de mesa ${selected.id}`}>
            <div className="drawer-header"><div><span className={`status-pill ${selected.status === "Cuenta solicitada" ? "bill" : selected.status === "Listo para retirar" ? "ready" : "progress"}`}>{selected.status}</span><h2>Mesa {selected.id}</h2><p>{selected.area} · {selected.guests} comensales</p></div><button className="icon-button" aria-label="Cerrar" onClick={() => setSelected(null)}><Icon name="close" /></button></div>
            <div className="drawer-summary"><span><small>Total acumulado</small><strong>{selected.amount}</strong></span><span><small>Tiempo de mesa</small><strong>01:24 h</strong></span></div>
            <div className="order-block">
              <div className="order-title"><span>Comanda activa</span><small>#0{selected.id}B4</small></div>
              <div className="order-item"><b>2×</b><span><strong>Smash Limonero</strong><small>Una sin cebolla · Papas rústicas</small></span><em>$ 18.400</em></div>
              <div className="order-item"><b>1×</b><span><strong>Ensalada Tibia</strong><small>Aderezo aparte</small></span><em>$ 9.200</em></div>
              <div className="order-item"><b>2×</b><span><strong>Limonada de menta</strong><small>Sin azúcar</small></span><em>$ 7.800</em></div>
            </div>
            <div className="drawer-note"><Icon name="users" /><span><strong>Pedido de Martina y Tomás</strong><small>Última actualización {selected.time.toLowerCase()}</small></span></div>
            <div className="drawer-actions">
              {selected.status === "Listo para retirar" && <button className="primary-button full" onClick={() => updateTable(selected.id, `Pedido de Mesa ${selected.id} marcado como entregado`)}><Icon name="check" /> Marcar como entregado</button>}
              {selected.status === "Cuenta solicitada" && <><button className="primary-button full" onClick={() => updateTable(selected.id, `Pago digital habilitado para Mesa ${selected.id}`)}><Icon name="card" /> Habilitar Mercado Pago</button><button className="secondary-button full" onClick={() => updateTable(selected.id, `Mesa ${selected.id} cerrada correctamente`, true)}>Cerrar cuenta en efectivo / POS</button></>}
              {selected.status === "En preparación" && <button className="secondary-button full"><Icon name="kitchen" /> Ver detalle en cocina</button>}
            </div>
          </div>
        </div>
      )}

      {notice && <div className="toast"><span><Icon name="check" size={16} /></span>{notice}</div>}
    </div>
  );
}

function App() {
  if (window.location.pathname.startsWith("/registro")) return <RegisterApp />;
  if (window.location.pathname.startsWith("/onboarding")) return <OnboardingApp />;
  if (window.location.pathname.startsWith("/mesa/")) return <CustomerApp />;
  if (window.location.pathname.startsWith("/kds")) return <KitchenApp />;
  if (window.location.pathname.startsWith("/dashboard")) return <DashboardApp />;
  return <LandingApp />;
}

export default App;
