"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type CuentaRegistro = {
  nombre: string;
  email: string;
  // Solo una de las dos credenciales: contraseña propia o registro con Google.
  password: string;
  googleCredential: string;
};

type RegistroContextValue = {
  cuenta: CuentaRegistro | null;
  setCuenta: (cuenta: CuentaRegistro | null) => void;
};

const RegistroContext = createContext<RegistroContextValue | null>(null);

// Vive en el layout compartido de /registro y /onboarding: la cuenta pasa de una
// pantalla a la otra en memoria, sin guardar la contraseña en el navegador.
export function RegistroProvider({ children }: { children: React.ReactNode }) {
  const [cuenta, setCuenta] = useState<CuentaRegistro | null>(null);
  const value = useMemo(() => ({ cuenta, setCuenta }), [cuenta]);
  return <RegistroContext.Provider value={value}>{children}</RegistroContext.Provider>;
}

export function useRegistro(): RegistroContextValue {
  const ctx = useContext(RegistroContext);
  if (!ctx) throw new Error("useRegistro debe usarse dentro de RegistroProvider");
  return ctx;
}
