"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001", {
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

    const onNew = (m: any) => {
      qc.setQueryData<any[]>(["messages", m.conversationId], (old = []) => [
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