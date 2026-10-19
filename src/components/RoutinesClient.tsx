"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, Pill, SectionTitle, Spinner } from "@/components/ui";
import { IconChevron, IconDumbbell, IconLeaf } from "@/components/icons";
import { api } from "@/lib/client";
import type { SessionUser } from "@/lib/auth";

export type PlanCard = {
  id: number;
  title: string;
  summary: string;
  kind: string;
  level: string;
  weeks: number;
  cover: string | null;
  isPublic: boolean;
  blockCount: number;
  assigned: boolean;
  assignedNote: string | null;
  assignedCount: number;
};

const TABS = [
  { id: "mine", label: "Para mí" },
  { id: "rutina", label: "Rutinas" },
  { id: "dieta", label: "Nutrición" },
];

export default function RoutinesClient({ user }: { user: SessionUser }) {
  const [plans, setPlans] = useState<PlanCard[] | null>(null);
  const [tab, setTab] = useState(user.role === "admin" ? "rutina" : "mine");

  useEffect(() => {
    api<{ plans: PlanCard[] }>("/api/plans")
      .then((data) => setPlans(data.plans))
      .catch(() => setPlans([]));
  }, []);

  const filtered = useMemo(() => {
    if (!plans) return null;
    if (tab === "mine") return plans.filter((plan) => plan.assigned);
    return plans.filter((plan) => plan.kind === tab);
  }, [plans, tab]);

  const assignedCount = plans?.filter((plan) => plan.assigned).length ?? 0;

  return (
    <div className="px-4 pt-4">
      <section className="animate-fade-up rounded-[28px] border border-ink/8 bg-cream-soft p-5 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-ink-mute">
              Entrenamiento
            </p>
            <h1 className="mt-1.5 text-[26px] font-semibold leading-tight text-ink">
              Rutinas & Nutrición
            </h1>
            <p className="mt-1.5 max-w-[250px] text-[12.5px] leading-relaxed text-ink-mute">
              {user.role === "admin"
                ? "Creá planes y enviálos en privado a cada alumna."
                : `Tenés ${assignedCount} ${assignedCount === 1 ? "plan asignado" : "planes asignados"} por Rocío.`}
            </p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream">
            <IconDumbbell />
          </span>
        </div>

        {user.role === "admin" && (
          <Link
            href="/estudio"
            className="mt-4 flex h-12 w-full items-center justify-center rounded-[16px] bg-ink text-[12px] font-bold uppercase tracking-[0.16em] text-cream"
          >
            Crear nuevo plan
          </Link>
        )}
      </section>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition ${
              tab === item.id
                ? "bg-ink text-cream shadow-soft"
                : "border border-ink/12 bg-cream-soft text-ink-soft/70"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {filtered === null && <Spinner label="Buscando tus planes" />}
        {filtered !== null && filtered.length === 0 && (
          <EmptyState
            icon={tab === "dieta" ? "🥗" : "🏋️"}
            title={tab === "mine" ? "Todavía no tenés planes" : "Sin planes acá"}
            text={
              tab === "mine"
                ? "Escribile a Rocío por el chat y te arma una rutina a medida."
                : "Pronto vas a encontrar nuevos planes publicados."
            }
          />
        )}
        {filtered?.map((plan, index) => (
          <Link
            key={plan.id}
            href={`/rutinas/${plan.id}`}
            className="animate-fade-up block overflow-hidden rounded-[26px] border border-ink/8 bg-cream-soft shadow-soft transition active:scale-[0.99]"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <div className="relative h-36 w-full overflow-hidden bg-sand/40">
              {plan.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={plan.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink/30">
                  {plan.kind === "dieta" ? <IconLeaf size={42} /> : <IconDumbbell size={42} />}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-10">
                <p className="text-[17px] font-semibold leading-tight text-cream">
                  {plan.title}
                </p>
              </div>
              <div className="absolute left-3 top-3 flex gap-1.5">
                <Pill tone="ink">{plan.kind === "dieta" ? "Nutrición" : "Rutina"}</Pill>
                {plan.assigned && <Pill tone="clay">Para vos</Pill>}
                {!plan.isPublic && user.role === "admin" && <Pill tone="outline">Privado</Pill>}
              </div>
            </div>

            <div className="px-4 py-3.5">
              <p className="text-[12.5px] leading-relaxed text-ink-mute">{plan.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft/70">
                <span>{plan.level}</span>
                <span className="h-1 w-1 rounded-full bg-ink/20" />
                <span>{plan.weeks} sem</span>
                <span className="h-1 w-1 rounded-full bg-ink/20" />
                <span>{plan.blockCount} bloques</span>
                {user.role === "admin" && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-ink/20" />
                    <span>{plan.assignedCount} alumnas</span>
                  </>
                )}
                <IconChevron size={16} className="ml-auto text-ink/40" />
              </div>
              {plan.assigned && plan.assignedNote && (
                <p className="mt-3 rounded-[14px] bg-sand/25 px-3 py-2.5 text-[12px] italic leading-relaxed text-ink-soft">
                  “{plan.assignedNote}”
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {user.role !== "admin" && (
        <div className="mt-6">
          <SectionTitle title="¿Necesitás otra cosa?" />
          <Link
            href="/chat"
            className="flex items-center justify-between rounded-[22px] bg-ink px-5 py-4 text-cream shadow-lift"
          >
            <span>
              <span className="block text-[14px] font-semibold">Pedile un ajuste a Ro</span>
              <span className="block text-[11.5px] text-cream/65">
                Cambios de rutina, dieta o lesiones
              </span>
            </span>
            <IconChevron />
          </Link>
        </div>
      )}
    </div>
  );
}
