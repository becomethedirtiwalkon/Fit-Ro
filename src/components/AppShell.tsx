"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/Logo";
import InstallPrompt from "@/components/InstallPrompt";
import { Avatar } from "@/components/ui";
import {
  IconChat,
  IconDumbbell,
  IconFeed,
  IconSpark,
  IconUser,
} from "@/components/icons";
import type { SessionUser } from "@/lib/auth";

const TABS = [
  { href: "/feed", label: "Feed", Icon: IconFeed },
  { href: "/rutinas", label: "Rutinas", Icon: IconDumbbell },
  { href: "/chat", label: "Chat", Icon: IconChat },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
];

export default function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = user.role === "admin";
  const tabs = isAdmin
    ? [...TABS.slice(0, 3), { href: "/estudio", label: "Estudio", Icon: IconSpark }, TABS[3]]
    : TABS;

  const hideChrome = /^\/chat\/[^/]+$/.test(pathname);

  return (
    <div className="relative flex min-h-dvh flex-col bg-cream">
      {!hideChrome && (
        <header className="glass sticky top-0 z-30 border-b border-ink/5 px-5 pb-3 pt-safe">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2.5">
              <LogoMark size={34} />
              <span className="leading-tight">
                <span className="block text-[11px] font-bold uppercase tracking-[0.26em] text-ink">
                  Ro Alcalá
                </span>
                <span className="block text-[8px] font-semibold uppercase tracking-[0.38em] text-ink-mute">
                  Personal Trainer
                </span>
              </span>
            </Link>
            <Link href="/perfil" className="flex items-center gap-2">
              {isAdmin && (
                <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cream">
                  Coach
                </span>
              )}
              <Avatar name={user.name} src={user.avatar} size={34} ring />
            </Link>
          </div>
        </header>
      )}

      <main className={`flex-1 ${hideChrome ? "" : "pb-28"}`}>{children}</main>

      {!hideChrome && <InstallPrompt />}

      {!hideChrome && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[520px] px-4 pb-safe">
          <div className="ink-glass flex items-center justify-between gap-1 rounded-[26px] px-2.5 py-2 shadow-lift">
            {tabs.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex flex-1 flex-col items-center gap-1 rounded-[20px] px-2 py-2 transition-all duration-300 ${
                    active ? "bg-cream text-ink" : "text-cream/55 hover:text-cream"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
