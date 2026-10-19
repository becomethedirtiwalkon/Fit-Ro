"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui";
import { IconBack, IconCamera, IconSend } from "@/components/icons";
import { LogoMark } from "@/components/Logo";
import { api, fileToDataUrl } from "@/lib/client";
import { clockTime } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

type Message = {
  id: number;
  body: string;
  image: string | null;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderRole: string;
  senderAvatar: string | null;
};

type Partner = { id: number; name: string; avatar: string | null; goal: string | null };

const QUICK = [
  "Quiero actualizar mi rutina 💪",
  "Necesito cambiar mi dieta 🥗",
  "Terminé la semana ✅",
  "Tengo una molestia, ¿qué hago?",
];

export default function ChatRoom({
  user,
  clientId,
}: {
  user: SessionUser;
  clientId: string;
}) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const query = clientId === "me" ? "" : `?clientId=${clientId}`;

  const load = useCallback(
    async (scroll = false) => {
      const data = await api<{ messages: Message[]; partner: Partner | null }>(
        `/api/messages${query}`,
      );
      setMessages(data.messages);
      setPartner(data.partner);
      if (scroll) {
        requestAnimationFrame(() =>
          bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
        );
      }
    },
    [query],
  );

  useEffect(() => {
    load(true).catch(() => setMessages([]));
    const timer = setInterval(() => {
      load().catch(() => undefined);
    }, 5000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages?.length]);

  async function send(preset?: string) {
    const body = preset ?? text;
    if (!body.trim() && !image) return;
    setSending(true);
    try {
      await api("/api/messages", {
        body: {
          body,
          image,
          ...(clientId === "me" ? {} : { clientId: Number(clientId) }),
        },
      });
      setText("");
      setImage(null);
      await load(true);
    } finally {
      setSending(false);
    }
  }

  async function pickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file, 1080, 0.68).catch(() => null);
    if (dataUrl) setImage(dataUrl);
  }

  const headerName = partner?.name ?? (user.role === "admin" ? "Alumna" : "Rocío Alcalá");

  return (
    <div className="flex h-dvh flex-col bg-cream">
      <header className="glass sticky top-0 z-20 flex items-center gap-3 border-b border-ink/8 px-4 pb-3 pt-safe">
        <Link
          href={user.role === "admin" ? "/chat" : "/feed"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/12 text-ink"
        >
          <IconBack size={18} />
        </Link>
        {user.role === "admin" ? (
          <Avatar name={headerName} src={partner?.avatar} size={38} ring />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-soft">
            <LogoMark size={28} />
          </span>
        )}
        <div className="flex-1">
          <p className="text-[14px] font-semibold leading-tight text-ink">{headerName}</p>
          <p className="text-[11px] text-ink-mute">
            {user.role === "admin" ? partner?.goal ?? "Alumna" : "Tu entrenadora · responde a diario"}
          </p>
        </div>
        <span className="h-2 w-2 rounded-full bg-moss" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages === null && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="skeleton h-16 w-3/4 rounded-[20px]" />
            ))}
          </div>
        )}

        {messages?.length === 0 && (
          <div className="mx-auto mt-10 max-w-[280px] rounded-[24px] border border-dashed border-ink/15 p-5 text-center">
            <LogoMark size={44} className="mx-auto" />
            <p className="mt-3 text-[13px] font-semibold text-ink">
              {user.role === "admin" ? "Todavía no hablaron" : "Escribile a Rocío"}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-mute">
              Contale cómo venís, pedí cambios de rutina o ajustes en tu plan de comidas.
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {messages?.map((message, index) => {
            const mine = message.senderId === user.id;
            const prev = messages[index - 1];
            const showDate =
              !prev ||
              new Date(prev.createdAt).toDateString() !==
                new Date(message.createdAt).toDateString();
            return (
              <div key={message.id}>
                {showDate && (
                  <p className="my-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-ink-mute">
                    {new Date(message.createdAt).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`animate-pop max-w-[82%] overflow-hidden rounded-[20px] px-3.5 py-2.5 shadow-soft ${
                      mine
                        ? "rounded-br-md bg-ink text-cream"
                        : "rounded-bl-md border border-ink/8 bg-cream-soft text-ink"
                    }`}
                  >
                    {message.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={message.image}
                        alt=""
                        className="mb-2 max-h-72 w-full rounded-[14px] object-cover"
                      />
                    )}
                    {message.body && (
                      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                        {message.body}
                      </p>
                    )}
                    <p
                      className={`mt-1 text-right text-[9.5px] ${
                        mine ? "text-cream/50" : "text-ink-mute"
                      }`}
                    >
                      {clockTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {user.role !== "admin" && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {QUICK.map((item) => (
            <button
              key={item}
              onClick={() => send(item)}
              className="shrink-0 rounded-full border border-ink/15 bg-cream-soft px-3.5 py-2 text-[11.5px] font-medium text-ink-soft/85"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {image && (
        <div className="mx-4 mb-2 flex items-center gap-3 rounded-[16px] border border-ink/10 bg-cream-soft p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-12 w-12 rounded-[10px] object-cover" />
          <p className="flex-1 text-[12px] text-ink-mute">Foto lista para enviar</p>
          <button
            onClick={() => setImage(null)}
            className="rounded-full border border-ink/15 px-3 py-1.5 text-[10px] font-bold uppercase text-ink-mute"
          >
            Quitar
          </button>
        </div>
      )}

      <div className="glass flex items-end gap-2 border-t border-ink/8 px-3 pb-safe pt-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/12 text-ink"
        >
          <IconCamera />
        </button>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Escribí un mensaje…"
          className="mb-1 max-h-28 min-h-11 flex-1 resize-none rounded-[20px] border border-ink/12 bg-white px-4 py-3 text-[14px] outline-none focus:border-ink/35"
        />
        <button
          onClick={() => send()}
          disabled={sending}
          className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-cream shadow-lift disabled:opacity-50"
        >
          <IconSend />
        </button>
      </div>
    </div>
  );
}
