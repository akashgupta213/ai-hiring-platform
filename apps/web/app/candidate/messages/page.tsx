"use client";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, Filter, Phone, Video, MoreVertical, Paperclip, Smile, Send,
  Sparkles, CheckCheck, Briefcase, MapPin, DollarSign, Calendar,
  ChevronRight, Bell, MessageSquare,
} from "lucide-react";
import { messagesApi } from "@/lib/api/messages";
import { useMessagesSocket } from "@/hooks/useMessagesSocket";

export default function MessagesPage() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Conversations list
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagesApi.listConversations,
  });

  // auto-select first conversation
  useEffect(() => {
    if (!activeId && conversations[0]) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  // 2. Messages in active conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => messagesApi.getMessages(activeId!),
    enabled: !!activeId,
  });

  // 3. AI smart replies
  const { data: smart } = useQuery({
    queryKey: ["smart-replies", activeId],
    queryFn: () => messagesApi.smartReplies(activeId!),
    enabled: !!activeId,
  });

  // 4. Live updates via socket.io
  useMessagesSocket(activeId);

  // 5. Send mutation
  const sendMut = useMutation({
    mutationFn: (body: string) => messagesApi.send(activeId!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["smart-replies", activeId] });
      setDraft("");
    },
  });

  // mark read when conversation opens
  useEffect(() => {
    if (activeId) messagesApi.markRead(activeId).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId);
  const send = (text: string) => text.trim() && sendMut.mutate(text.trim());

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top nav */}
      

      <main className="flex-1 flex overflow-hidden max-w-[1440px] mx-auto w-full px-6 py-4 gap-4">
        {/* Conversation list */}
        <aside className="w-[320px] flex flex-col bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Messages</h2>
              <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"><Filter className="w-4 h-4" /></button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input className="w-full h-9 pl-9 pr-3 rounded-md bg-muted text-sm outline-none focus:ring-2 focus:ring-ring" placeholder="Search conversations" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full flex gap-3 px-4 py-3 text-left border-b hover:bg-accent ${c.id === activeId ? "bg-accent" : ""}`}>
                <div className="relative shrink-0">
                  <img src={c.recruiterAvatar} alt={c.recruiterName} className="w-10 h-10 rounded-full object-cover" />
                  {c.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{c.recruiterName}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{c.recruiterRole}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{c.lastMessagePreview}</p>
                </div>
                {c.unreadCount > 0 && (
                  <span className="self-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">
                    {c.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Chat pane */}
        <section className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden">
          {/* Chat header */}
          {active && (
            <div className="h-16 px-5 border-b flex items-center gap-3">
              <img src={active.recruiterAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{active.recruiterName}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  {active.online ? "Active now" : "Offline"} · {active.recruiterRole}
                </p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="p-2 rounded-md hover:bg-accent"><Phone className="w-4 h-4" /></button>
                <button className="p-2 rounded-md hover:bg-accent"><Video className="w-4 h-4" /></button>
                <button className="p-2 rounded-md hover:bg-accent"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Thread */}
              <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
                <div className="flex justify-center">
                  <span className="bg-muted px-3 py-1 rounded-full text-[10px] uppercase tracking-wide text-muted-foreground border">Today</span>
                </div>
                {messages.map((m) => {
                  const mine = m.senderRole === "candidate";
                  const time = new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                  return mine ? (
                    <div key={m.id} className="flex flex-col items-end gap-1 ml-auto max-w-[80%]">
                      <div className="bg-primary text-primary-foreground p-3 rounded-xl rounded-tr-none">
                        <p className="text-sm">{m.body}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{time}</span>
                        <CheckCheck className={`w-3.5 h-3.5 ${m.readAt ? "text-emerald-500" : "text-muted-foreground"}`} />
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-3 max-w-[80%]">
                      <img src={active?.recruiterAvatar} className="w-8 h-8 rounded-full object-cover mt-2" alt="" />
                      <div className="flex flex-col gap-1">
                        <div className="bg-muted p-3 rounded-xl rounded-tl-none border">
                          <p className="text-sm">{m.body}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground ml-1">{time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Smart replies */}
              {smart?.replies?.length ? (
                <div className="px-5 pb-2">
                  <div className="relative bg-card p-3 border rounded-lg flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary">HireAI Smart Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {smart.replies.map((s) => (
                        <button key={s} onClick={() => send(s)}
                          className="text-sm border px-3 py-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Composer */}
              <form
                onSubmit={(e) => { e.preventDefault(); send(draft); }}
                className="p-4 border-t flex items-end gap-2"
              >
                <button type="button" className="p-2 rounded-md hover:bg-accent text-muted-foreground"><Paperclip className="w-4 h-4" /></button>
                <div className="flex-1 bg-muted rounded-lg px-3 py-2 flex items-end gap-2">
                  <textarea rows={1} value={draft} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } }}
                    placeholder="Type a message…" className="flex-1 bg-transparent outline-none text-sm resize-none max-h-32" />
                  <button type="button" className="p-1 text-muted-foreground hover:text-foreground"><Smile className="w-4 h-4" /></button>
                </div>
                <button type="submit" disabled={sendMut.isPending}
                  className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>

            {/* Job context (dummy until /jobs/:id wired) */}
            <aside className="w-[280px] border-l p-5 hidden lg:flex flex-col gap-4 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" /> Job Context
              </div>
              <div>
                <p className="text-base font-semibold">Senior Product Designer</p>
                <p className="text-xs text-muted-foreground">Acme Corp</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Remote · US</div>
                <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-3.5 h-3.5" /> $160k – $190k</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Virtual onsite · Thu</div>
              </div>
              <button className="mt-auto inline-flex items-center justify-between text-sm font-medium px-3 py-2 rounded-lg border hover:bg-accent">
                <span className="inline-flex items-center gap-2"><MessageSquare className="w-4 h-4" /> View full job</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
