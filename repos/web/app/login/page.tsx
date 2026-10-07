"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const googleClientID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setGoogleLoading(true);
    setError("");
    try {
      await api.autenticarConGoogle(credential);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No pudimos iniciar sesión con Google."));
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

  const handlePasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Ingresá tu correo y contraseña.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.autenticarConPassword(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No pudimos iniciar sesión."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85"
      imageAlt="Salón de restaurante moderno"
      visualTitle="Todo tu servicio, en un solo lugar"
      visualText="Gestioná sucursales, mesas, carta y pedidos en vivo desde un único panel."
      cardLabel="Pedido listo"
      cardTitle="Mesa 12 · Terraza"
    >
      <span className="hero-kicker"><i /> Acceso administración</span>
      <h1>Ingresá a tu cuenta</h1>
      <p className="auth-sub">Usá el correo registrado y tu contraseña de Mesa CLICK.</p>

      <form onSubmit={handlePasswordLogin} className="mt-28 space-y-16">
        <div className="space-y-7">
          <label htmlFor="email" className="block text-11 font-bold">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@minegocio.com"
            className="w-full px-16 outline-none"
          />
        </div>

        <div className="space-y-7">
          <label htmlFor="password" className="block text-11 font-bold">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tu contraseña de Mesa CLICK"
              className="w-full px-16 pr-52 outline-none"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((actual) => !actual)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex w-48 items-center justify-center text-stone hover:text-ash-graphite"
            >
              <span className="material-symbols-outlined text-20">
                {mostrarPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-12 border border-alert-red/30 rounded-xl text-12 text-alert-red">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="landing-cta w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-20">progress_activity</span>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>

      <div className="my-20 flex items-center gap-12" aria-hidden="true">
        <span className="h-px flex-1 bg-concrete" />
        <span className="text-10 font-bold uppercase tracking-wider text-stone">o continuá con</span>
        <span className="h-px flex-1 bg-concrete" />
      </div>

      <GoogleSignInButton
        clientID={googleClientID}
        disabled={loading || googleLoading}
        onCredential={handleGoogleCredential}
        onError={setError}
      />

      <p className="mt-12 text-11 leading-relaxed text-stone">
        Mesa CLICK nunca te pedirá la contraseña de tu cuenta de Google.
      </p>

      <p className="auth-switch">
        ¿No tenés un negocio registrado? <Link href="/onboarding">Registrar mi negocio</Link>
      </p>
    </AuthShell>
  );
}
