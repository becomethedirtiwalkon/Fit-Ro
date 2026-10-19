"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Avatar, SectionTitle } from "@/components/ui";
import { IconCamera, IconFlame } from "@/components/icons";
import { LogoLockup } from "@/components/Logo";
import { api, fileToDataUrl } from "@/lib/client";
import { timeAgo } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

type Entry = { id: number; weight: string; note: string; createdAt: string };

export default function ProfileClient({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [profile, setProfile] = useState(user);
  const [name, setName] = useState(user.name);
  const [goal, setGoal] = useState(user.goal ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [workouts, setWorkouts] = useState(0);
  const [plans, setPlans] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ entries: Entry[] }>("/api/progress")
      .then((data) => setEntries(data.entries))
      .catch(() => undefined);
    api<{ total: number }>("/api/checkins")
      .then((data) => setWorkouts(data.total))
      .catch(() => undefined);
    api<{ plans: { assigned: boolean }[] }>("/api/plans")
      .then((data) => setPlans(data.plans.filter((plan) => plan.assigned).length))
      .catch(() => undefined);
  }, []);

  async function save() {
    setSaving(true);
    try {
      const data = await api<{ user: SessionUser }>("/api/me", {
        method: "PATCH",
        body: { name, goal, bio },
      });
      setProfile(data.user);
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function pickAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file, 512, 0.8).catch(() => null);
    if (!dataUrl) return;
    const data = await api<{ user: SessionUser }>("/api/me", {
      method: "PATCH",
      body: { name: profile.name, goal, bio, avatar: dataUrl },
    });
    setProfile(data.user);
    router.refresh();
  }

  async function addEntry() {
    if (!weight && !note) return;
    const data = await api<{ entry: Entry }>("/api/progress", { body: { weight, note } });
    setEntries((current) => [data.entry, ...current]);
    setWeight("");
    setNote("");
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  const isAdmin = profile.role === "admin";

  return (
    <div className="px-4 pt-4">
      <section className="brand-grain animate-fade-up relative overflow-hidden rounded-[28px] border border-ink/8 bg-cream-soft p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={profile.name} src={profile.avatar} size={74} ring />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickAvatar}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-ink text-cream"
            >
              <IconCamera size={15} />
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[20px] font-semibold leading-tight text-ink">
              {profile.name}
            </p>
            <p className="truncate text-[12px] text-ink-mute">{profile.email}</p>
            <p className="mt-1.5 inline-flex rounded-full bg-ink px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-cream">
              {isAdmin ? "Coach · Personal Trainer" : profile.goal || "Alumna"}
            </p>
          </div>
        </div>

        {profile.bio && !editing && (
          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft/85">{profile.bio}</p>
        )}

        {editing ? (
          <div className="mt-4 space-y-2.5">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre"
              className="h-12 w-full rounded-[16px] border border-ink/12 bg-white px-4 text-[14px] outline-none focus:border-ink/35"
            />
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="Tu objetivo"
              className="h-12 w-full rounded-[16px] border border-ink/12 bg-white px-4 text-[14px] outline-none focus:border-ink/35"
            />
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={3}
              placeholder="Contanos algo sobre vos"
              className="w-full resize-none rounded-[16px] border border-ink/12 bg-white px-4 py-3 text-[14px] outline-none focus:border-ink/35"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="h-11 flex-1 rounded-[16px] border border-ink/15 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-soft/80"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="h-11 flex-1 rounded-[16px] bg-ink text-[12px] font-bold uppercase tracking-[0.12em] text-cream disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="mt-4 h-11 w-full rounded-[16px] border border-ink/15 text-[12px] font-bold uppercase tracking-[0.12em] text-ink"
          >
            Editar perfil
          </button>
        )}
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { label: "Planes", value: plans },
          { label: "Sesiones", value: workouts },
          { label: "Registros", value: entries.length },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="animate-fade-up rounded-[20px] border border-ink/8 bg-cream-soft px-3 py-4 text-center shadow-soft"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="text-[24px] font-semibold leading-none text-ink">{stat.value}</p>
            <p className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-mute">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6">
        <SectionTitle title="Mi progreso" />
        <div className="rounded-[24px] border border-ink/8 bg-cream-soft p-4 shadow-soft">
          <div className="flex gap-2">
            <input
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="Peso (kg)"
              inputMode="decimal"
              className="h-12 w-28 rounded-[16px] border border-ink/12 bg-white px-3 text-[14px] outline-none focus:border-ink/35"
            />
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="¿Cómo te sentís?"
              className="h-12 flex-1 rounded-[16px] border border-ink/12 bg-white px-3 text-[14px] outline-none focus:border-ink/35"
            />
            <button
              onClick={addEntry}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-ink text-cream"
            >
              <IconFlame size={18} />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {entries.length === 0 && (
              <p className="py-2 text-center text-[12px] text-ink-mute">
                Registrá tu peso cada semana para ver tu evolución.
              </p>
            )}
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-[16px] bg-cream px-3 py-2.5"
              >
                <span className="flex h-10 w-14 items-center justify-center rounded-[12px] bg-ink text-[13px] font-bold text-cream">
                  {entry.weight || "—"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-ink">{entry.note || "Registro"}</p>
                  <p className="text-[10.5px] text-ink-mute">{timeAgo(entry.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-ink/8 bg-cream-soft p-5 text-center shadow-soft">
        <LogoLockup size={62} />
        <p className="mt-4 text-[11.5px] leading-relaxed text-ink-mute">
          Instalá la app en tu teléfono: desde Safari tocá <strong>Compartir → Agregar a
          inicio</strong>; en Android, menú <strong>⋮ → Instalar aplicación</strong>.
        </p>
      </section>

      <button
        onClick={logout}
        className="mt-5 h-13 w-full rounded-[18px] border border-clay/35 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-clay"
      >
        Cerrar sesión
      </button>

      <p className="mt-6 text-center text-[10px] uppercase tracking-[0.24em] text-ink-mute/70">
        Ro Alcalá Fit · 2026
      </p>
    </div>
  );
}
