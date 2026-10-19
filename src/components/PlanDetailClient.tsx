"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, Pill, Spinner } from "@/components/ui";
import { IconBack, IconCheck, IconDumbbell, IconLeaf } from "@/components/icons";
import { api } from "@/lib/client";
import type { PlanData } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

type PlanResponse = {
  plan: {
    id: number;
    title: string;
    summary: string;
    kind: string;
    level: string;
    weeks: number;
    cover: string | null;
    isPublic: boolean;
    data: PlanData;
  };
  note: string | null;
  assigned: boolean;
  completedDays: string[];
  assignedTo: { id: number; name: string; avatar: string | null; note: string }[];
};

type Client = { id: number; name: string; avatar: string | null; goal: string | null };

export default function PlanDetailClient({
  planId,
  user,
}: {
  planId: number;
  user: SessionUser;
}) {
  const router = useRouter();
  const [data, setData] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignNote, setAssignNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<PlanResponse>(`/api/plans/${planId}`)
      .then((payload) => {
        setData(payload);
        setDone(payload.completedDays);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"));
  }, [planId]);

  useEffect(() => {
    if (user.role !== "admin") return;
    api<{ clients: Client[] }>("/api/clients")
      .then((payload) => setClients(payload.clients))
      .catch(() => undefined);
  }, [user.role]);

  async function toggleDay(day: string) {
    setDone((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
    await api("/api/checkins", { body: { planId, day } }).catch(() => undefined);
  }

  async function assign(clientId: number) {
    setBusy(true);
    try {
      await api(`/api/plans/${planId}/assign`, {
        body: { userId: clientId, note: assignNote },
      });
      const payload = await api<PlanResponse>(`/api/plans/${planId}`);
      setData(payload);
      setAssignNote("");
    } finally {
      setBusy(false);
    }
  }

  async function unassign(clientId: number) {
    setBusy(true);
    try {
      await api(`/api/plans/${planId}/assign?userId=${clientId}`, { method: "DELETE" });
      const payload = await api<PlanResponse>(`/api/plans/${planId}`);
      setData(payload);
    } finally {
      setBusy(false);
    }
  }

  async function removePlan() {
    await api(`/api/plans/${planId}`, { method: "DELETE" }).catch(() => undefined);
    router.replace("/rutinas");
    router.refresh();
  }

  if (error) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-[14px] font-semibold text-ink">{error}</p>
        <Link
          href="/rutinas"
          className="mt-4 inline-block rounded-full bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-cream"
        >
          Volver
        </Link>
      </div>
    );
  }

  if (!data) return <Spinner label="Abriendo tu plan" />;

  const { plan } = data;
  const isDiet = plan.kind === "dieta";
  const blocks = plan.data?.blocks ?? [];
  const progressPct = blocks.length
    ? Math.round((done.filter((day) => blocks.some((b) => b.title === day)).length / blocks.length) * 100)
    : 0;

  return (
    <div className="pb-6">
      <div className="relative h-60 w-full overflow-hidden bg-sand/40">
        {plan.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plan.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/25">
            {isDiet ? <IconLeaf size={60} /> : <IconDumbbell size={60} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/30" />
        <Link
          href="/rutinas"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-ink"
        >
          <IconBack />
        </Link>
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <div className="flex gap-1.5">
            <Pill tone="ink">{isDiet ? "Nutrición" : "Rutina"}</Pill>
            {data.assigned && <Pill tone="clay">Asignado a vos</Pill>}
          </div>
          <h1 className="mt-2 text-[26px] font-semibold leading-tight text-cream">
            {plan.title}
          </h1>
          <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-cream/70">
            {plan.level} · {plan.weeks} semanas · {blocks.length} bloques
          </p>
        </div>
      </div>

      <div className="px-4">
        {plan.summary && (
          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft/85">{plan.summary}</p>
        )}

        {data.note && (
          <div className="animate-fade-up mt-4 rounded-[22px] bg-ink px-5 py-4 text-cream shadow-lift">
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-cream/55">
              Nota de Rocío
            </p>
            <p className="mt-2 text-[13.5px] italic leading-relaxed text-cream/90">
              “{data.note}”
            </p>
          </div>
        )}

        {user.role !== "admin" && blocks.length > 0 && (
          <div className="mt-5 rounded-[20px] border border-ink/8 bg-cream-soft p-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-ink-mute">
              <span>Progreso del plan</span>
              <span className="text-ink">{progressPct}%</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-sand/40">
              <div
                className="h-full rounded-full bg-ink transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {blocks.map((block, index) => {
            const isDone = done.includes(block.title);
            return (
              <section
                key={`${block.title}-${index}`}
                className="animate-fade-up overflow-hidden rounded-[24px] border border-ink/8 bg-cream-soft shadow-soft"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-center gap-3 border-b border-ink/8 px-4 py-3.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-cream">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-[14.5px] font-semibold leading-tight text-ink">
                      {block.title}
                    </p>
                    {block.subtitle && (
                      <p className="text-[11.5px] text-ink-mute">{block.subtitle}</p>
                    )}
                  </div>
                  {user.role !== "admin" && (
                    <button
                      onClick={() => toggleDay(block.title)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90 ${
                        isDone
                          ? "border-moss bg-moss text-white"
                          : "border-ink/20 text-ink/35"
                      }`}
                      aria-label="Marcar como completado"
                    >
                      <IconCheck size={18} />
                    </button>
                  )}
                </div>

                <ul className="divide-y divide-ink/6">
                  {block.items.map((item, itemIndex) => (
                    <li key={`${item.name}-${itemIndex}`} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13.5px] font-medium text-ink">{item.name}</p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.sets && (
                            <span className="rounded-full bg-sand/35 px-2 py-1 text-[10px] font-bold tracking-wide text-ink">
                              {isDiet ? item.sets : `${item.sets}×`}
                            </span>
                          )}
                          {item.reps && (
                            <span className="rounded-full bg-ink/8 px-2 py-1 text-[10px] font-bold tracking-wide text-ink-soft">
                              {item.reps}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-[11.5px] italic leading-relaxed text-ink-mute">
                          {item.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {user.role === "admin" && (
          <div className="mt-6 rounded-[24px] border border-ink/10 bg-cream-soft p-4 shadow-soft">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-ink-mute">
              Enviar en privado
            </p>
            <input
              value={assignNote}
              onChange={(event) => setAssignNote(event.target.value)}
              placeholder="Nota para la alumna (opcional)"
              className="mt-3 h-12 w-full rounded-[16px] border border-ink/12 bg-white px-4 text-[13px] outline-none focus:border-ink/35"
            />
            <div className="mt-3 space-y-2">
              {clients.map((client) => {
                const already = data.assignedTo.some((item) => item.id === client.id);
                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 rounded-[16px] border border-ink/8 bg-white px-3 py-2.5"
                  >
                    <Avatar name={client.name} src={client.avatar} size={34} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-ink">{client.name}</p>
                      <p className="text-[11px] text-ink-mute">{client.goal}</p>
                    </div>
                    <button
                      disabled={busy}
                      onClick={() => (already ? unassign(client.id) : assign(client.id))}
                      className={`rounded-full px-3 py-2 text-[10.5px] font-bold uppercase tracking-[0.1em] transition ${
                        already
                          ? "border border-ink/20 text-ink-mute"
                          : "bg-ink text-cream"
                      }`}
                    >
                      {already ? "Quitar" : "Enviar"}
                    </button>
                  </div>
                );
              })}
              {clients.length === 0 && (
                <p className="text-[12px] text-ink-mute">
                  Todavía no hay alumnas registradas.
                </p>
              )}
            </div>

            <button
              onClick={removePlan}
              className="mt-4 w-full rounded-[16px] border border-clay/40 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-clay"
            >
              Eliminar plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
