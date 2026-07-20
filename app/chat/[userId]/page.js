"use client";

import { use } from "react";
import { ChatScreen } from "@/components/screens/ChatScreen";

export default function ChatPage({ params }) {
  const { userId } = use(params);
  return <ChatScreen userId={userId} />;
}
