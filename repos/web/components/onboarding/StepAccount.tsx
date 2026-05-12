import React from "react";

interface StepAccountProps {
  onNext: () => void;
}

export default function StepAccount({ onNext }: StepAccountProps) {
  return (
    <div className="space-y-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
        className="space-y-20"
      >
        <div className="space-y-8">
          <label
            htmlFor="email"
            className="text-13 font-mono text-sage-green uppercase tracking-wider px-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="admin@workbench.com"
            className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
          />
        </div>

        <div className="space-y-8">
          <label
            htmlFor="password"
            className="text-13 font-mono text-sage-green uppercase tracking-wider px-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full h-40 px-12 bg-canvas-white border border-ash-graphite rounded-md focus:border-plain-green outline-none transition-all text-15"
          />
        </div>

        <button
          type="submit"
          className="w-full h-40 bg-plain-green text-ash-graphite font-medium rounded-md hover:bg-plain-green-muted transition-all flex items-center justify-center gap-8 mt-40"
        >
          Crear Cuenta
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </form>

      <div className="flex items-center py-8">
        <div className="flex-grow border-t border-ghost-fog"></div>
        <span className="px-12 text-13 font-mono text-sage-green uppercase">
          O
        </span>
        <div className="flex-grow border-t border-ghost-fog"></div>
      </div>

      <button className="w-full flex items-center justify-center gap-8 bg-ghost-fog border border-plain-green text-plain-green h-40 rounded-md hover:bg-plain-green/5 transition-colors text-13 font-medium uppercase tracking-wider">
        <span className="material-symbols-outlined text-[16px]">auto_fix</span>
        Magic Link
      </button>

      <p className="text-center text-12 text-sage-green px-24 pt-24 leading-relaxed">
        By continuing, you agree to our terms of service and privacy policy.
      </p>
    </div>
  );
}
