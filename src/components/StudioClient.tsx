"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Avatar, SectionTitle } from "@/components/ui";
import { IconCamera, IconPlus } from "@/components/icons";
import { api, fileToDataUrl } from "@/lib/client";
import type { PlanBlock } from "@/db/schema";

type Client = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  goal: string | null;
  planCount: number;
};

const LEVELS = ["Inicial", "Intermedio", "Avanzado", "Todos los niveles"];

const emptyBlock = (): PlanBlock => ({
  title: "",
  subtitle: "",
  items: [{ name: "", sets: "", reps: "", notes: "" }],
});

export default function StudioClient() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [planCount, setPlanCount] = useState(0);
  const [kind, setKind] = useState<"rutina" | "dieta">("rutina");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [level, setLevel] = useState(LEVELS[0]);
  const [weeks, setWeeks] = useState(4);
  const [isPublic, setIsPublic] = useState(true);
  const [cover, setCover] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<PlanBlock[]>([emptyBlock()]);
  const [sendTo, setSendTo] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ clients: Client[] }>("/api/clients")
      .then((data) => setClients(data.clients))
      .catch(() => undefined);
    api<{ plans: unknown[] }>("/api/plans")
      .then((data) => setPlanCount(data.plans.length))
      .catch(() => undefined);
  }, []);

  function updateBlock(index: number, patch: Partial<PlanBlock>) {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  }

  function updateItem(
    blockIndex: number,
    itemIndex: number,
    patch: Partial<PlanBlock["items"][number]>,
  ) {
    setBlocks((current) =>
      current.map((block, bIndex) =>
        bIndex === blockIndex
          ? {
              ...block,
              items: block.items.map((item, iIndex) =>
                iIndex === itemIndex ? { ...item, ...patch } : item,
              ),
            }
          : block,
      ),
    );
  }

  async function pickCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file, 1200, 0.7).catch(() => null);
    if (dataUrl) setCover(dataUrl);
  }

  async function publish() {
    setMessage(null);
    if (!title.trim()) {
      setMessage("Poné un título");
      return;
    }
    setSaving(true);
    try {
      const cleaned = blocks
        .map((block) => ({
          ...block,
          title: block.title.trim() || "Bloque",
          items: block.items.filter((item) => item.name.trim()),
        }))
        .filter((block) => block.items.length > 0);

      const created = await api<{ plan: { id: number } }>("/api/plans", {
        body: {
          title,
          summary,
          kind,
          level,
          weeks,
          isPublic,
          cover,
          data: { blocks: cleaned },
        },
      });

      for (const clientId of sendTo) {
        await api(`/api/plans/${created.plan.id}/assign`, {
          body: { userId: clientId, note: "" },
        }).catch(() => undefined);
      }

      setMessage("¡Plan publicado! 🎉");
      setTitle("");
      setSummary("");
      setCover(null);
      setBlocks([emptyBlock()]);
      setSendTo([]);
      setPlanCount((current) => current + 1);
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "No se pudo publicar");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-[16px] border border-ink/12 bg-white px-4 text-[14px] outline-none focus:border-ink/35";

  return (
    <div className="px-4 pt-4">
      <section className="animate-fade-up rounded-[28px] bg-ink px-5 py-6 text-cream shadow-lift">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/55">
          Estudio de Rocío
        </p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight">Crear un plan</h1>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-[18px] bg-cream/10 px-3 py-3 text-center">
            <p className="text-[22px] font-semibold leading-none">{clients.length}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cream/60">
              Alumnas
            </p>
          </div>
          <div className="flex-1 rounded-[18px] bg-cream/10 px-3 py-3 text-center">
            <p className="text-[22px] font-semibold leading-none">{planCount}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-cream/60">
              Planes
            </p>
          </div>
          <Link
            href="/feed"
            className="flex flex-1 flex-col items-center justify-center rounded-[18px] bg-cream text-ink"
          >
            <IconPlus />
            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em]">
              Publicar
            </span>
          </Link>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <div className="flex gap-2">
          {(["rutina", "dieta"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setKind(item)}
              className={`flex-1 rounded-[16px] py-3 text-[11.5px] font-bold uppercase tracking-[0.12em] transition ${
                kind === item
                  ? "bg-ink text-cream shadow-soft"
                  : "border border-ink/12 bg-cream-soft text-ink-soft/70"
              }`}
            >
              {item === "rutina" ? "🏋️ Rutina" : "🥗 Nutrición"}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={kind === "dieta" ? "Nombre del plan de comidas" : "Nombre de la rutina"}
          className={inputClass}
        />
        <textarea
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={3}
          placeholder="Descripción corta"
          className="w-full resize-none rounded-[16px] border border-ink/12 bg-white px-4 py-3 text-[14px] outline-none focus:border-ink/35"
        />

        <div className="flex gap-2">
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {LEVELS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={52}
            value={weeks}
            onChange={(event) => setWeeks(Number(event.target.value))}
            className={`${inputClass} w-24`}
          />
        </div>

        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickCover} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] border border-ink/12 bg-cream-soft text-[12px] font-bold uppercase tracking-[0.12em] text-ink"
          >
            <IconCamera size={16} /> {cover ? "Cambiar portada" : "Subir portada"}
          </button>
          <button
            onClick={() => setIsPublic((current) => !current)}
            className={`h-12 rounded-[16px] px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
              isPublic ? "bg-moss/20 text-moss" : "bg-ink text-cream"
            }`}
          >
            {isPublic ? "Público" : "Privado"}
          </button>
        </div>

        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-36 w-full rounded-[18px] object-cover" />
        )}
      </div>

      <section className="mt-6">
        <SectionTitle
          title={kind === "dieta" ? "Comidas" : "Bloques de entrenamiento"}
          action={
            <button
              onClick={() => setBlocks((current) => [...current, emptyBlock()])}
              className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream"
            >
              + Bloque
            </button>
          }
        />

        <div className="space-y-3">
          {blocks.map((block, blockIndex) => (
            <div
              key={blockIndex}
              className="animate-pop rounded-[22px] border border-ink/10 bg-cream-soft p-4"
            >
              <div className="flex gap-2">
                <input
                  value={block.title}
                  onChange={(event) => updateBlock(blockIndex, { title: event.target.value })}
                  placeholder={kind === "dieta" ? "Desayuno" : "Día 1 · Tren inferior"}
                  className="h-11 flex-1 rounded-[14px] border border-ink/12 bg-white px-3 text-[13.5px] outline-none focus:border-ink/35"
                />
                {blocks.length > 1 && (
                  <button
                    onClick={() =>
                      setBlocks((current) => current.filter((_, i) => i !== blockIndex))
                    }
                    className="h-11 rounded-[14px] border border-clay/35 px-3 text-[10px] font-bold uppercase text-clay"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <input
                value={block.subtitle}
                onChange={(event) => updateBlock(blockIndex, { subtitle: event.target.value })}
                placeholder={kind === "dieta" ? "≈ 450 kcal" : "Fuerza + core"}
                className="mt-2 h-10 w-full rounded-[14px] border border-ink/10 bg-white px-3 text-[12.5px] outline-none focus:border-ink/35"
              />

              <div className="mt-3 space-y-2">
                {block.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="rounded-[14px] bg-cream p-2.5">
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateItem(blockIndex, itemIndex, { name: event.target.value })
                      }
                      placeholder={kind === "dieta" ? "Avena con leche" : "Sentadilla goblet"}
                      className="h-10 w-full rounded-[10px] border border-ink/10 bg-white px-3 text-[13px] outline-none focus:border-ink/35"
                    />
                    <div className="mt-2 flex gap-2">
                      <input
                        value={item.sets}
                        onChange={(event) =>
                          updateItem(blockIndex, itemIndex, { sets: event.target.value })
                        }
                        placeholder={kind === "dieta" ? "60 g" : "Series"}
                        className="h-9 flex-1 rounded-[10px] border border-ink/10 bg-white px-2.5 text-[12px] outline-none"
                      />
                      <input
                        value={item.reps}
                        onChange={(event) =>
                          updateItem(blockIndex, itemIndex, { reps: event.target.value })
                        }
                        placeholder={kind === "dieta" ? "320 kcal" : "Reps"}
                        className="h-9 flex-1 rounded-[10px] border border-ink/10 bg-white px-2.5 text-[12px] outline-none"
                      />
                    </div>
                    <input
                      value={item.notes}
                      onChange={(event) =>
                        updateItem(blockIndex, itemIndex, { notes: event.target.value })
                      }
                      placeholder="Nota (opcional)"
                      className="mt-2 h-9 w-full rounded-[10px] border border-ink/10 bg-white px-2.5 text-[12px] outline-none"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  updateBlock(blockIndex, {
                    items: [...block.items, { name: "", sets: "", reps: "", notes: "" }],
                  })
                }
                className="mt-2.5 w-full rounded-[12px] border border-dashed border-ink/20 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute"
              >
                + {kind === "dieta" ? "Alimento" : "Ejercicio"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle title="Enviar en privado al publicar" />
        <div className="space-y-2">
          {clients.map((client) => {
            const selected = sendTo.includes(client.id);
            return (
              <button
                key={client.id}
                onClick={() =>
                  setSendTo((current) =>
                    selected
                      ? current.filter((id) => id !== client.id)
                      : [...current, client.id],
                  )
                }
                className={`flex w-full items-center gap-3 rounded-[18px] border px-3 py-3 text-left transition ${
                  selected
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/10 bg-cream-soft text-ink"
                }`}
              >
                <Avatar name={client.name} src={client.avatar} size={36} />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">{client.name}</p>
                  <p
                    className={`text-[11px] ${selected ? "text-cream/65" : "text-ink-mute"}`}
                  >
                    {client.goal}
                  </p>
                </div>
                <span className="text-[16px]">{selected ? "✓" : "+"}</span>
              </button>
            );
          })}
          {clients.length === 0 && (
            <p className="text-[12px] text-ink-mute">Aún no hay alumnas registradas.</p>
          )}
        </div>
      </section>

      {message && (
        <p className="mt-4 rounded-[16px] bg-moss/15 px-4 py-3 text-center text-[12.5px] font-semibold text-moss">
          {message}
        </p>
      )}

      <button
        onClick={publish}
        disabled={saving}
        className="mt-5 h-14 w-full rounded-[20px] bg-ink text-[12.5px] font-bold uppercase tracking-[0.18em] text-cream shadow-lift disabled:opacity-60"
      >
        {saving ? "Publicando…" : "Publicar plan"}
      </button>
    </div>
  );
}
