import { redirect } from "next/navigation";

import ChatListClient from "@/components/ChatListClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/chat/me");
  return <ChatListClient />;
}
