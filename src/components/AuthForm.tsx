"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/Logo";
import { api } from "@/lib/client";

type Mode = "login" | "register";

const GOALS = [
  "Tonificar y ganar fuerza",
  "Bajar grasa corporal",
  "Ganar masa muscular",
  "Volver a entrenar",
  "Mejorar mi salud",
];

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(isRegister ? "/api/auth/register" : "/api/auth/login", {
        body: isRegister ? { name, email, password, goal } : { email, password },
      });
      router.replace("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  async function quickLogin(demoEmail: string, demoPassword: string) {
    setError(null);
    setLoading(true);
    try {
      await api("/api/auth/login", { body: { email: demoEmail, password: demoPassword } });
      router.replace("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  }

  const inputClass =
    "h-13 w-full rounded-[18px] border border-ink/12 bg-cream-soft px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-ink-mute/60 focus:border-ink/40 focus:bg-white";

  return (
    <div className="brand-grain min-h-dvh px-6 pb-14 pt-safe">
      <div className="pt-6">
        <Link
          href="/"
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-mute"
        >
          ← Volver
        </Link>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <LogoMark size={76} />
        <h1 className="mt-6 text-[30px] font-semibold leading-tight tracking-tight text-ink">
          {isRegister ? "Sumate al equipo" : "Hola de nuevo"}
        </h1>
        <p className="mt-2 max-w-[280px] text-center text-[13px] leading-relaxed text-ink-mute">
          {isRegister
            ? "Creá tu cuenta y recibí rutinas, planes y seguimiento directo de Rocío."
            : "Ingresá para ver tus rutinas, tu plan y hablar con tu coach."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        {isRegister && (
          <input
            className={inputClass}
            placeholder="Tu nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        )}
        <input
          className={inputClass}
          placeholder="Email"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <input
          className={inputClass}
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
        />

        {isRegister && (
          <div className="rounded-[18px] border border-ink/12 bg-cream-soft p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-mute">
              Tu objetivo
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGoal(item)}
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold transition ${
                    goal === item
                      ? "bg-ink text-cream"
                      : "border border-ink/15 text-ink-soft/80"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="animate-pop rounded-[16px] bg-clay/12 px-4 py-3 text-[12.5px] font-medium text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center rounded-[20px] bg-ink text-[13px] font-bold uppercase tracking-[0.18em] text-cream shadow-lift transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Un segundo…" : isRegister ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-ink-mute">
        {isRegister ? "¿Ya tenés cuenta? " : "¿Primera vez? "}
        <Link
          href={isRegister ? "/login" : "/registro"}
          className="font-semibold text-ink underline underline-offset-4"
        >
          {isRegister ? "Ingresá" : "Creá tu cuenta"}
        </Link>
      </p>

      <div className="mt-10 rounded-[20px] border border-dashed border-ink/15 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-mute">
          Probar la app
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => quickLogin("rocio@roalcalafit.com", "rocio1234")}
            className="rounded-[14px] bg-ink/90 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-cream"
          >
            Entrar como Ro
          </button>
          <button
            type="button"
            onClick={() => quickLogin("demo@roalcalafit.com", "demo1234")}
            className="rounded-[14px] border border-ink/20 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink"
          >
            Entrar como alumna
          </button>
        </div>
      </div>
    </div>
  );
}
