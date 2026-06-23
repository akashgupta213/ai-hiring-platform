"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import type { Message } from "@repo/shared-types/messages";

let socket: Socket | null = null;
function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      withCredentials: true,
      transports: ["websocket"],
    });
  }
  return socket;
}

export function useMessagesSocket(conversationId: string | null) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId) return;
    const s = getSocket();
    s.emit("conversation:join", { conversationId });

    const onNew = (m: Message) => {
      qc.setQueryData<Message[]>(["messages", m.conversationId], (old = []) => [
        ...old,
        m,
      ]);
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };
    s.on("message:new", onNew);
    return () => {
      s.off("message:new", onNew);
      s.emit("conversation:leave", { conversationId });
    };
  }, [conversationId, qc]);
}
