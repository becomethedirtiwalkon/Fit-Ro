"use client";

import { useEffect, useState } from "react";

import { LogoMark } from "@/components/Logo";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const KEY = "rafit-install-dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY) === "1") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    if (isIos) {
      const timer = setTimeout(() => setIosHint(true), 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setDeferred(null);
    setIosHint(false);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    dismiss();
  }

  if (!deferred && !iosHint) return null;

  return (
    <div className="animate-fade-up fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-[520px] px-4">
      <div className="flex items-center gap-3 rounded-[22px] border border-ink/10 bg-cream-soft px-4 py-3 shadow-lift">
        <LogoMark size={34} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold leading-tight text-ink">
            Instalá RO ALCALÁ FIT
          </p>
          <p className="text-[11px] leading-snug text-ink-mute">
            {deferred
              ? "Tenela en tu pantalla de inicio"
              : "Compartir → «Agregar a inicio»"}
          </p>
        </div>
        {deferred && (
          <button
            onClick={install}
            className="rounded-full bg-ink px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-cream"
          >
            Instalar
          </button>
        )}
        <button
          onClick={dismiss}
          className="text-[16px] leading-none text-ink-mute"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}
