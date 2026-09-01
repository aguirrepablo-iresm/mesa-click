import React from "react";
import Logo from "@/components/brand/Logo";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  subtitle,
  onBack,
}: OnboardingLayoutProps) {
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-16 pb-40">
      {/* Header */}
      <header className="py-40 flex items-center justify-between border-b border-ash-graphite mb-40">
        <div className="flex items-center gap-8 text-ash-graphite">
          {onBack && (
            <button
              onClick={onBack}
              className="material-symbols-outlined hover:opacity-60 transition-opacity"
            >
              arrow_back
            </button>
          )}
          <Logo className="w-24 h-24" />
          <h1 className="font-bold text-18 uppercase tracking-tight">Mesa CLICK</h1>
        </div>
        <div className="flex items-center gap-8">
            <span className="text-13 font-mono text-sage-green uppercase tracking-wider">
                Paso {step}/{totalSteps}
            </span>
        </div>
      </header>

      {/* Progress Line (Minimalist) */}
      <div className="w-full bg-concrete h-[2px] mb-40 relative">
        <div
          className="bg-ash-graphite h-[2px] absolute top-0 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <main className="flex-1 space-y-40">
        <div className="space-y-12">
          <h2 className="text-24 font-semibold text-ash-graphite leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-sage-green text-15 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
