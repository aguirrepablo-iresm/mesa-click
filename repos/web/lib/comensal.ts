export interface ComensalIdentity {
  id: string;
  nombre: string;
  cuentaVersion: number;
  consentimientoVersion: number;
}

const COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;
const CONSENTIMIENTO_VERSION = 1;

function cookieName(mesaId: string) {
  return `mesa_click_comensal_${mesaId}`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split("; ").find(value => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getComensalIdentity(mesaId: string, cuentaVersion: number): ComensalIdentity | null {
  const raw = readCookie(cookieName(mesaId));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed)
      || typeof parsed.id !== "string"
      || !parsed.id.trim()
      || typeof parsed.nombre !== "string"
      || parsed.cuentaVersion !== cuentaVersion
      || parsed.consentimientoVersion !== CONSENTIMIENTO_VERSION
    ) {
      clearComensalIdentity(mesaId);
      return null;
    }

    return {
      id: parsed.id,
      nombre: parsed.nombre.trim(),
      cuentaVersion,
      consentimientoVersion: CONSENTIMIENTO_VERSION,
    };
  } catch {
    clearComensalIdentity(mesaId);
    return null;
  }
}

export function saveComensalIdentity(identity: ComensalIdentity, mesaId: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(cookieName(mesaId))}=${encodeURIComponent(JSON.stringify(identity))}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearComensalIdentity(mesaId: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(cookieName(mesaId))}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

export function createComensalIdentity(nombre: string, cuentaVersion: number): ComensalIdentity {
  return {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    cuentaVersion,
    consentimientoVersion: CONSENTIMIENTO_VERSION,
  };
}
