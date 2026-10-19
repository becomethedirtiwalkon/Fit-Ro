"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar, EmptyState, Pill, Spinner } from "@/components/ui";
import { IconCamera, IconHeart, IconPlus, IconSend } from "@/components/icons";
import { api, fileToDataUrl } from "@/lib/client";
import { KIND_LABEL, timeAgo } from "@/lib/format";
import type { SessionUser } from "@/lib/auth";

type Post = {
  id: number;
  kind: string;
  body: string;
  image: string | null;
  createdAt: string;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
};

type Comment = {
  id: number;
  body: string;
  createdAt: string;
  userId: number;
  userName: string;
  userAvatar: string | null;
  userRole: string;
};

const KINDS = [
  { id: "frase", label: "Frase", emoji: "✨" },
  { id: "avance", label: "Avance", emoji: "🔥" },
  { id: "tip", label: "Tip", emoji: "💡" },
  { id: "foto", label: "Foto", emoji: "📸" },
];

export default function FeedClient({ user }: { user: SessionUser }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [kind, setKind] = useState("frase");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const data = await api<{ posts: Post[] }>("/api/posts");
    setPosts(data.posts);
  }, []);

  useEffect(() => {
    load().catch(() => setPosts([]));
  }, [load]);

  async function toggleLike(post: Post) {
    setPosts((current) =>
      current?.map((item) =>
        item.id === post.id
          ? {
              ...item,
              liked: !item.liked,
              likeCount: item.likeCount + (item.liked ? -1 : 1),
            }
          : item,
      ) ?? current,
    );
    await api(`/api/posts/${post.id}/like`, { method: "POST" }).catch(() => undefined);
  }

  async function publish() {
    setError(null);
    if (!body.trim() && !image) {
      setError("Escribí algo o sumá una foto");
      return;
    }
    setSending(true);
    try {
      await api("/api/posts", { body: { body, image, kind } });
      setBody("");
      setImage(null);
      setComposerOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar");
    } finally {
      setSending(false);
    }
  }

  async function pickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setImage(dataUrl);
      if (kind === "frase") setKind("foto");
    } catch {
      setError("No pudimos procesar la imagen");
    }
  }

  async function removePost(id: number) {
    setPosts((current) => current?.filter((item) => item.id !== id) ?? current);
    await api(`/api/posts?id=${id}`, { method: "DELETE" }).catch(() => undefined);
  }

  const isAdmin = user.role === "admin";
  const firstName = user.name.split(" ")[0];

  return (
    <div className="px-4 pt-4">
      <section className="brand-grain animate-fade-up relative overflow-hidden rounded-[28px] bg-ink px-5 py-6 text-cream shadow-lift">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-cream/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full border border-cream/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cream/55">
          {isAdmin ? "Panel de la coach" : "Tu espacio"}
        </p>
        <h1 className="mt-2 text-[27px] font-semibold leading-tight">
          Hola, {firstName}.
        </h1>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-cream/75">
          {isAdmin
            ? "Compartí una frase, un tip o el avance de alguna alumna para mantener viva a la comunidad."
            : "Un día más entrenando por vos. Leé el feed, mirá tu rutina y escribime cuando quieras."}
        </p>
      </section>

      {isAdmin && (
        <div className="mt-4">
          {!composerOpen ? (
            <button
              onClick={() => setComposerOpen(true)}
              className="flex w-full items-center gap-3 rounded-[22px] border border-ink/10 bg-cream-soft px-4 py-4 text-left shadow-soft transition active:scale-[0.99]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream">
                <IconPlus />
              </span>
              <span className="text-[13.5px] text-ink-mute">
                Publicar una frase, foto o avance…
              </span>
            </button>
          ) : (
            <div className="animate-pop rounded-[24px] border border-ink/10 bg-cream-soft p-4 shadow-soft">
              <div className="flex flex-wrap gap-2">
                {KINDS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setKind(item.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] transition ${
                      kind === item.id
                        ? "bg-ink text-cream"
                        : "border border-ink/15 text-ink-soft/70"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </button>
                ))}
              </div>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Escribí algo que inspire…"
                rows={4}
                className="mt-3 w-full resize-none rounded-[16px] border border-ink/12 bg-white px-4 py-3 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-mute/60 focus:border-ink/35"
              />
              {image && (
                <div className="relative mt-3 overflow-hidden rounded-[18px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="preview" className="w-full object-cover" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-cream"
                  >
                    Quitar
                  </button>
                </div>
              )}
              {error && <p className="mt-2 text-[12px] font-medium text-clay">{error}</p>}
              <div className="mt-3 flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={pickImage}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink"
                >
                  <IconCamera />
                </button>
                <button
                  onClick={() => setComposerOpen(false)}
                  className="h-11 rounded-full border border-ink/15 px-4 text-[12px] font-semibold text-ink-soft/80"
                >
                  Cancelar
                </button>
                <button
                  onClick={publish}
                  disabled={sending}
                  className="ml-auto flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[12px] font-bold uppercase tracking-[0.14em] text-cream disabled:opacity-60"
                >
                  {sending ? "Publicando…" : "Publicar"}
                  <IconSend size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {posts === null && <Spinner label="Cargando el feed" />}
        {posts !== null && posts.length === 0 && (
          <EmptyState
            icon="✨"
            title="Todavía no hay publicaciones"
            text="Muy pronto Rocío va a compartir frases, tips y avances por acá."
          />
        )}
        {posts?.map((post, index) => (
          <article
            key={post.id}
            className="animate-fade-up overflow-hidden rounded-[26px] border border-ink/8 bg-cream-soft shadow-soft"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <div className="flex items-center gap-3 px-4 pt-4">
              <Avatar name={post.authorName} src={post.authorAvatar} size={42} ring />
              <div className="flex-1">
                <p className="text-[13.5px] font-semibold text-ink">
                  {post.authorName}
                  {post.authorRole === "admin" && (
                    <span className="ml-1.5 text-[11px] text-clay">· Coach</span>
                  )}
                </p>
                <p className="text-[11px] text-ink-mute">{timeAgo(post.createdAt)}</p>
              </div>
              <Pill tone={post.kind === "avance" ? "clay" : "sand"}>
                {KIND_LABEL[post.kind] ?? post.kind}
              </Pill>
            </div>

            {post.body && (
              <p
                className={`px-4 pt-3 text-ink ${
                  post.kind === "frase"
                    ? "text-[19px] font-medium italic leading-snug"
                    : "text-[14px] leading-relaxed"
                }`}
              >
                {post.body}
              </p>
            )}

            {post.image && (
              <div className="mt-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt=""
                  className="max-h-[420px] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex items-center gap-4 px-4 py-3.5">
              <button
                onClick={() => toggleLike(post)}
                className={`flex items-center gap-1.5 text-[12.5px] font-semibold transition active:scale-95 ${
                  post.liked ? "text-clay" : "text-ink-mute"
                }`}
              >
                <IconHeart filled={post.liked} />
                {post.likeCount}
              </button>
              <button
                onClick={() =>
                  setOpenComments((current) => (current === post.id ? null : post.id))
                }
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-mute"
              >
                💬 {post.commentCount}
              </button>
              {isAdmin && (
                <button
                  onClick={() => removePost(post.id)}
                  className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-ink-mute/70"
                >
                  Eliminar
                </button>
              )}
            </div>

            {openComments === post.id && (
              <CommentsBlock postId={post.id} user={user} onAdded={load} />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function CommentsBlock({
  postId,
  user,
  onAdded,
}: {
  postId: number;
  user: SessionUser;
  onAdded: () => Promise<void>;
}) {
  const [items, setItems] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api<{ comments: Comment[] }>(`/api/posts/${postId}/comments`);
    setItems(data.comments);
  }, [postId]);

  useEffect(() => {
    load().catch(() => setItems([]));
  }, [load]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      await api(`/api/posts/${postId}/comments`, { body: { body: text } });
      setText("");
      await load();
      await onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-pop border-t border-ink/8 bg-cream/60 px-4 py-3">
      {items === null ? (
        <p className="py-2 text-[12px] text-ink-mute">Cargando comentarios…</p>
      ) : items.length === 0 ? (
        <p className="py-1 text-[12px] text-ink-mute">Sé la primera en comentar 💬</p>
      ) : (
        <div className="space-y-3">
          {items.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar name={comment.userName} src={comment.userAvatar} size={30} />
              <div className="flex-1 rounded-[14px] bg-cream-soft px-3 py-2">
                <p className="text-[12px] font-semibold text-ink">
                  {comment.userName}
                  {comment.userRole === "admin" && (
                    <span className="ml-1 text-[10px] text-clay">· Coach</span>
                  )}
                </p>
                <p className="text-[12.5px] leading-relaxed text-ink-soft">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Avatar name={user.name} src={user.avatar} size={30} />
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          placeholder="Escribí un comentario…"
          className="h-10 flex-1 rounded-full border border-ink/12 bg-white px-4 text-[13px] outline-none focus:border-ink/35"
        />
        <button
          onClick={send}
          disabled={busy}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream disabled:opacity-50"
        >
          <IconSend size={16} />
        </button>
      </div>
    </div>
  );
}
