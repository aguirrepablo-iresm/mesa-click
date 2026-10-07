import React from "react";
import { RegistroProvider } from "@/components/registro/RegistroContext";
import "@/components/registro/registro.css";

// /registro y /onboarding comparten este layout para conservar la cuenta en
// memoria mientras se navega entre ambas pantallas.
export default function AltaLayout({ children }: { children: React.ReactNode }) {
  return <RegistroProvider>{children}</RegistroProvider>;
}
