"use client";

import type { ReactNode } from "react";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  src,
  size = 40,
  ring = false,
}: {
  name: string;
  src?: string | null;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-cream ${
        ring ? "ring-2 ring-sand ring-offset-2 ring-offset-cream" : ""
      }`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span
          className="font-semibold"
          style={{ fontSize: Math.max(11, size * 0.36) }}
        >
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export function Pill({
  children,
  tone = "sand",
}: {
  children: ReactNode;
  tone?: "sand" | "ink" | "clay" | "moss" | "outline";
}) {
  const tones: Record<string, string> = {
    sand: "bg-sand/35 text-ink",
    ink: "bg-ink text-cream",
    clay: "bg-clay/18 text-clay",
    moss: "bg-moss/18 text-moss",
    outline: "border border-ink/20 text-ink/70",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-mute">
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-ink" />
      {label ? <span className="text-xs tracking-wide">{label}</span> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="animate-fade-up rounded-[26px] border border-dashed border-ink/15 bg-cream-soft px-6 py-10 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sand/30 text-xl">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-[240px] text-xs leading-relaxed text-ink-mute">
        {text}
      </p>
    </div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.26em] text-ink-mute">
        {title}
      </h2>
      {action}
    </div>
  );
}
