"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar, EmptyState, Spinner } from "@/components/ui";
import { IconChevron } from "@/components/icons";
import { api } from "@/lib/client";
import { timeAgo } from "@/lib/format";

type Client = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  goal: string | null;
  createdAt: string;
  planCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

export default function ChatListClient() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<{ clients: Client[] }>("/api/clients")
      .then((data) => setClients(data.clients))
      .catch(() => setClients([]));
  }, []);

  const filtered = clients?.filter((client) =>
    client.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="px-4 pt-4">
      <section className="animate-fade-up rounded-[28px] bg-ink px-5 py-6 text-cream shadow-lift">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/55">
          Mensajes
        </p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight">Tus alumnas</h1>
        <p className="mt-2 text-[12.5px] leading-relaxed text-cream/70">
          Respondé consultas, ajustá rutinas y enviá planes de comidas en privado.
        </p>
      </section>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar alumna…"
        className="mt-4 h-12 w-full rounded-[18px] border border-ink/12 bg-cream-soft px-4 text-[14px] outline-none focus:border-ink/35"
      />

      <div className="mt-4 space-y-2.5">
        {clients === null && <Spinner label="Cargando conversaciones" />}
        {filtered?.length === 0 && (
          <EmptyState
            icon="👥"
            title="Sin alumnas todavía"
            text="Cuando alguien se registre en la app, va a aparecer acá para que le escribas."
          />
        )}
        {filtered?.map((client, index) => (
          <Link
            key={client.id}
            href={`/chat/${client.id}`}
            className="animate-fade-up flex items-center gap-3 rounded-[22px] border border-ink/8 bg-cream-soft px-4 py-3.5 shadow-soft transition active:scale-[0.99]"
            style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
          >
            <Avatar name={client.name} src={client.avatar} size={46} ring />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-ink">{client.name}</p>
                <span className="shrink-0 text-[10.5px] text-ink-mute">
                  {client.lastMessageAt ? timeAgo(client.lastMessageAt) : ""}
                </span>
              </div>
              <p className="truncate text-[12px] text-ink-mute">
                {client.lastMessage ?? client.goal ?? "Nueva alumna"}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-clay">
                {client.planCount} {client.planCount === 1 ? "plan" : "planes"} asignados
              </p>
            </div>
            <IconChevron size={18} className="text-ink/35" />
          </Link>
        ))}
      </div>
    </div>
  );
}
