"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type: "standard";
          theme: "outline";
          size: "large";
          text: "continue_with";
          shape: "pill";
          logo_alignment: "left";
          width: number;
          locale: string;
        },
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

type Props = {
  clientID: string;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

export default function GoogleSignInButton({ clientID, disabled = false, onCredential, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  const renderButton = useCallback(() => {
    const google = window.google;
    const container = containerRef.current;
    if (!google || !container || !clientID) return;

    container.replaceChildren();
    google.accounts.id.initialize({
      client_id: clientID,
      cancel_on_tap_outside: true,
      callback: (response) => {
        if (!response.credential) {
          onErrorRef.current("Google no devolvió una credencial válida. Intentá nuevamente.");
          return;
        }
        onCredentialRef.current(response.credential);
      },
    });
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left",
      width: Math.min(container.clientWidth || 400, 400),
      locale: "es",
    });
  }, [clientID]);

  useEffect(() => {
    renderButton();
  }, [renderButton]);

  if (!clientID) {
    return (
      <div className="rounded-lg border border-alert-red/30 bg-warm-pink/20 p-12 text-12 text-alert-red">
        El inicio con Google todavía no está configurado en este entorno.
      </div>
    );
  }

  return (
    <>
      <Script
        id="google-identity-services"
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={renderButton}
        onError={() => onErrorRef.current("No pudimos cargar el acceso de Google. Revisá tu conexión.")}
      />
      <div className={`relative min-h-44 w-full ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <div ref={containerRef} className="flex min-h-44 w-full justify-center" />
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-canvas-white/70">
            <span className="material-symbols-outlined animate-spin text-20 text-ash-graphite">progress_activity</span>
          </div>
        )}
      </div>
    </>
  );
}
