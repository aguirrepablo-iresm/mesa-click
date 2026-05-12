"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de autenticación
    setTimeout(() => {
      // Credenciales de prueba
      if (email === "admin@mesaclick.com" && password === "admin123") {
        router.push("/dashboard");
      } else {
        alert("Credenciales incorrectas (Usa admin@mesaclick.com / admin123 para probar)");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-canvas-white flex flex-col items-center justify-center p-24 font-inter">
      <div className="w-full max-w-sm space-y-32">
        {/* Logo/Brand */}
        <div className="text-center space-y-8">
          <Link href="/" className="inline-flex items-center gap-8 group">
            <span className="material-symbols-outlined text-plain-green text-32 group-hover:scale-110 transition-transform">restaurant</span>
            <h1 className="text-24 font-medium tracking-tight text-ash-graphite">Mesa CLICK</h1>
          </Link>
          <p className="text-14 text-sage-green uppercase tracking-widest font-mono">
            Acceso Administración
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-vanilla-cream p-32 rounded-xl border border-system-black shadow-sm space-y-24">
          <form onSubmit={handleSubmit} className="space-y-20">
            <div className="space-y-8">
              <label 
                htmlFor="email" 
                className="text-11 font-mono text-sage-green uppercase tracking-widest px-4"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mesaclick.com"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green transition-all text-14 outline-none"
              />
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <label 
                  htmlFor="password" 
                  className="text-11 font-mono text-sage-green uppercase tracking-widest"
                >
                  Contraseña
                </label>
                <button type="button" className="text-10 font-medium text-plain-green hover:underline uppercase tracking-tighter">
                  Olvidé mi clave
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green transition-all text-14 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-44 bg-plain-green text-ash-graphite font-bold rounded-md hover:bg-plain-green-muted active:scale-95 transition-all shadow-lg shadow-plain-green/10 flex items-center justify-center gap-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <>
                  Entrar al Panel
                  <span className="material-symbols-outlined text-18">login</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center py-8">
            <div className="flex-grow border-t border-ghost-fog"></div>
            <span className="px-12 text-11 font-mono text-sage-green">O</span>
            <div className="flex-grow border-t border-ghost-fog"></div>
          </div>

          <button className="w-full h-40 bg-ghost-fog border border-ash-graphite/10 text-ash-graphite text-13 font-medium rounded-md hover:bg-plain-green/5 transition-all flex items-center justify-center gap-8">
            <span className="material-symbols-outlined text-18">auto_fix</span>
            Entrar con Magic Link
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-13 text-sage-green">
          ¿No tienes una cuenta?{" "}
          <Link href="/onboarding" className="text-plain-green font-semibold hover:underline">
            Regístrate ahora
          </Link>
        </p>
      </div>
    </div>
  );
}
