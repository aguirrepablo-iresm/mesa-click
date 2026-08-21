"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState<"cargando" | "exito" | "error">("cargando");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setErrorMsg("No se proporcionó ningún token de autenticación.");
      return;
    }

    let isMounted = true;

    async function verificar() {
      try {
        await api.verificarToken(token!);
        if (isMounted) {
          setEstado("exito");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        }
      } catch (err: any) {
        if (isMounted) {
          setEstado("error");
          setErrorMsg(err.message || "El token es inválido o ha expirado.");
        }
      }
    }

    verificar();

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  return (
    <div className="w-full max-w-sm bg-vanilla-cream p-32 rounded-xl border border-system-black shadow-sm text-center space-y-20 font-inter">
      {estado === "cargando" && (
        <div className="space-y-16 py-12">
          <span className="material-symbols-outlined text-40 text-plain-green animate-spin">
            progress_activity
          </span>
          <h2 className="text-16 font-medium text-ash-graphite">Verificando acceso...</h2>
          <p className="text-13 text-sage-green">Estamos validando tu enlace mágico.</p>
        </div>
      )}

      {estado === "exito" && (
        <div className="space-y-16 py-12">
          <span className="material-symbols-outlined text-40 text-plain-green">
            check_circle
          </span>
          <h2 className="text-16 font-medium text-ash-graphite">¡Acceso concedido!</h2>
          <p className="text-13 text-sage-green">Redirigiendo a tu panel de control...</p>
        </div>
      )}

      {estado === "error" && (
        <div className="space-y-16 py-12">
          <span className="material-symbols-outlined text-40 text-alert-red">
            error
          </span>
          <h2 className="text-16 font-medium text-ash-graphite">Error de autenticación</h2>
          <p className="text-13 text-alert-red">{errorMsg}</p>
          <div className="pt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-6 px-16 py-8 bg-plain-green text-ash-graphite font-medium text-13 rounded-md hover:bg-plain-green-muted transition-all"
            >
              <span className="material-symbols-outlined text-16">arrow_back</span>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-canvas-white flex flex-col items-center justify-center p-24">
      <Suspense fallback={<div className="text-sage-green font-mono text-13">Cargando...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
