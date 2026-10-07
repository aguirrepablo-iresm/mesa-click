"use client";
/* eslint-disable @next/next/no-img-element -- imagen de referencia de la maqueta (Unsplash) */

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import LandingIcon from "@/components/landing/LandingIcon";
import RegistroBrand from "@/components/registro/RegistroBrand";
import "@/components/registro/registro.css";
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
    <div className="registro">
      <header className="auth-header">
        <RegistroBrand />
        <span className="auth-header-link">¿No tenés cuenta? <Link href="/registro">Registrar mi negocio</Link></span>
      </header>
      <main className="auth-layout">
        <section className="auth-form-panel">
          <div className="auth-form">
            <span className="auth-eyebrow">Acceso administración</span>
            <h1>Ingresá a tu cuenta</h1>
            <p>Usá el correo registrado y tu contraseña de Mesa CLICK, o tu cuenta de Google.</p>

            <div className="google-slot">
              <GoogleSignInButton
                clientID={googleClientID}
                disabled={loading || googleLoading}
                onCredential={handleGoogleCredential}
                onError={setError}
              />
            </div>
            <div className="auth-divider"><span>o ingresá con tu correo</span></div>

            <form onSubmit={handlePasswordLogin} noValidate>
              <label className="auth-field">
                <span>Correo electrónico</span>
                <div>
                  <span className="field-at">@</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="vos@turestaurante.com"
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>Contraseña</span>
                <div>
                  <LandingIcon name="lock" size={18} />
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Tu contraseña de Mesa CLICK"
                  />
                  <button type="button" onClick={() => setMostrarPassword((actual) => !actual)}>
                    {mostrarPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </label>

              {error && <div role="alert" className="auth-alert">{error}</div>}

              <button type="submit" className="auth-submit" disabled={loading || googleLoading}>
                {loading ? "Ingresando…" : "Iniciar sesión"}
              </button>
            </form>

            <small className="auth-terms">
              Mesa CLICK nunca te pedirá la contraseña de tu cuenta de Google. Al ingresar aceptás los{" "}
              <Link href="/terminos">Términos de uso</Link> y la <Link href="/privacidad">Política de privacidad</Link>.
            </small>
          </div>
        </section>

        <aside className="auth-story" aria-hidden="true">
          <img src="https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?auto=format&fit=crop&w=1300&q=86" alt="" />
          <div className="auth-story-overlay">
            <span className="story-label"><i /> Todo tu servicio, en un lugar</span>
            <blockquote>“Gestioná sucursales, mesas, carta y pedidos en vivo desde un único panel.”</blockquote>
            <div><span className="story-avatar">MC</span><p><strong>Tu operación, conectada</strong><small>Salón · Cocina · Comensales</small></p></div>
          </div>
          <div className="story-card">
            <span><LandingIcon name="bell" /></span>
            <div><small>Pedido listo</small><strong>Mesa 12 · Terraza</strong></div>
          </div>
        </aside>
      </main>
    </div>
  );
}
