import { redirect } from "next/navigation";

import ChatRoom from "@/components/ChatRoom";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  if (user.role !== "admin" && id !== "me") redirect("/chat/me");
  return <ChatRoom user={user} clientId={id} />;
}
