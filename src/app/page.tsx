import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoMark } from "@/components/Logo";
import { getCurrentUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    emoji: "🏋️",
    title: "Rutinas a medida",
    text: "Bloques de entrenamiento con series, reps y notas de tu coach.",
  },
  {
    emoji: "🥗",
    title: "Nutrición simple",
    text: "Planes de comidas flexibles, con reemplazos reales.",
  },
  {
    emoji: "💬",
    title: "Chat privado",
    text: "Actualizá tu rutina y tu dieta hablando directo con Rocío.",
  },
  {
    emoji: "✨",
    title: "Feed motivador",
    text: "Frases, tips y avances de la comunidad todos los días.",
  },
];

export default async function LandingPage() {
  await ensureSeeded();
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <div className="brand-grain relative min-h-dvh overflow-hidden bg-cream px-6 pb-12 pt-safe">
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-ink/10" />
      <div className="pointer-events-none absolute -left-32 top-64 h-80 w-80 rounded-full border border-ink/[0.07]" />

      <header className="relative z-10 flex flex-col items-center pt-10">
        <div className="animate-float">
          <LogoMark size={128} animated />
        </div>
        <p className="tracking-brand mt-5 text-[15px] font-bold uppercase text-ink">
          Ro Alcalá Fit
        </p>
        <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.46em] text-ink-mute">
          Personal Trainer
        </p>
      </header>

      <section className="relative z-10 mt-10 text-center">
        <h1
          className="animate-fade-up text-[38px] font-semibold leading-[1.05] tracking-tight text-ink"
          style={{ animationDelay: "120ms" }}
        >
          Tu entrenadora
          <br />
          <span className="italic text-clay">en el bolsillo.</span>
        </h1>
        <p
          className="animate-fade-up mx-auto mt-4 max-w-[310px] text-[14px] leading-relaxed text-ink-soft/80"
          style={{ animationDelay: "220ms" }}
        >
          Rutinas, nutrición y seguimiento real. Entrená con método, constancia
          y alguien que te acompaña todos los días.
        </p>
      </section>

      <div
        className="animate-fade-up relative z-10 mt-8 space-y-3"
        style={{ animationDelay: "320ms" }}
      >
        <Link
          href="/registro"
          className="flex h-14 w-full items-center justify-center rounded-[20px] bg-ink text-[13px] font-bold uppercase tracking-[0.18em] text-cream shadow-lift transition active:scale-[0.98]"
        >
          Crear mi cuenta
        </Link>
        <Link
          href="/login"
          className="flex h-14 w-full items-center justify-center rounded-[20px] border border-ink/20 bg-cream-soft text-[13px] font-bold uppercase tracking-[0.18em] text-ink transition active:scale-[0.98]"
        >
          Ya entreno con Ro
        </Link>
      </div>

      <section className="relative z-10 mt-10 grid grid-cols-2 gap-3">
        {FEATURES.map((feature, index) => (
          <div
            key={feature.title}
            className="animate-fade-up rounded-[22px] border border-ink/8 bg-cream-soft/80 p-4 shadow-soft"
            style={{ animationDelay: `${380 + index * 80}ms` }}
          >
            <span className="text-xl">{feature.emoji}</span>
            <p className="mt-2 text-[13px] font-semibold text-ink">{feature.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-mute">{feature.text}</p>
          </div>
        ))}
      </section>

      <section
        className="animate-fade-up relative z-10 mt-8 rounded-[22px] bg-ink p-5 text-cream"
        style={{ animationDelay: "720ms" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/55">
          Instalá la app
        </p>
        <p className="mt-2 text-[12.5px] leading-relaxed text-cream/85">
          <strong className="font-semibold">iPhone:</strong> Compartir → «Agregar a
          inicio».
          <br />
          <strong className="font-semibold">Android:</strong> menú ⋮ → «Instalar
          aplicación».
        </p>
      </section>

      <p className="relative z-10 mt-6 text-center text-[10px] leading-relaxed text-ink-mute">
        Demo coach: rocio@roalcalafit.com / rocio1234
        <br />
        Demo alumna: demo@roalcalafit.com / demo1234
      </p>
    </div>
  );
}
