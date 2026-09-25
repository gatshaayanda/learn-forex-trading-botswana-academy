"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { id: number; from: "bot" | "user"; text: string };

const welcome = [
  "Hi 👋 I'm the Academy Assistant.",
  "",
  "Ask me about programmes, fees, how training works, existing-student support or the owner.",
  "",
  "You can also type MENU.",
].join("\n");

const starters = ["Programmes", "Fees", "How does training work?", "I'm a student"];

export function AcademyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, from: "bot", text: welcome }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send(message: string) {
    const value = message.trim();
    if (!value || busy) return;
    setInput("");
    setMessages((current) => [...current, { id: Date.now(), from: "user", text: value }]);
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value }),
      });
      const data = await response.json();
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, from: "bot", text: response.ok ? data.reply : data.error },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, from: "bot", text: "I couldn't reach the academy assistant. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <>
      {open && (
        <section className="fixed inset-x-3 bottom-20 z-[60] flex max-h-[min(680px,calc(100vh-7rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/30 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[390px]">
          <header className="flex items-center gap-3 bg-foreground px-4 py-4 text-background">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Academy Assistant</p>
              <p className="text-xs text-background/60">Quick answers • WhatsApp-style support</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-background/10" aria-label="Close assistant">
              <X className="size-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
              <Sparkles className="mr-1 inline size-3.5 text-primary" /> Same academy FAQ brain powers this demo and the WhatsApp webhook.
            </div>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.from === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card"}`}>
                  {message.text}
                </div>
              </div>
            ))}
            {busy && <div className="w-fit rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2.5 text-sm text-muted-foreground">Typing…</div>}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {starters.map((starter) => (
                <button key={starter} onClick={() => void send(starter)} disabled={busy} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
                  {starter}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} placeholder="Ask the academy…" className="min-w-0 flex-1 rounded-2xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="submit" disabled={busy || !input.trim()} className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-40" aria-label="Send message">
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </section>
      )}

      <button onClick={() => setOpen((value) => !value)} className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:-translate-y-0.5 sm:bottom-6 sm:right-6" aria-label={open ? "Close academy assistant" : "Open academy assistant"}>
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span>{open ? "Close" : "Ask the Academy"}</span>
      </button>
    </>
  );
}
