"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Bot, MessageCircle, SendHorizontal, Sparkles, X } from "lucide-react";
import { useApp } from "@/components/app-provider";
import {
  ASSISTANT_NAME,
  SUGGESTED_PROMPTS,
  createWelcomeMessage,
  replyToMessage,
  type ChatMessage
} from "@/lib/assistant";
import { COMPANY } from "@/lib/brand";
import { createId } from "@/lib/store";

function renderContent(content: string) {
  return content.split("\n").map((line, index) => {
    const html = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>");
    return (
      <p
        key={`${index}-${line.slice(0, 12)}`}
        className={clsx("text-sm leading-relaxed", line === "" && "h-2")}
        dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }}
      />
    );
  });
}

export function MiaAssistant() {
  const { store, branchId, session } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessages((current) => (current.length ? current : [createWelcomeMessage(store, branchId)]));
  }, [open, store, branchId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  function pushUser(content: string) {
    const userMessage: ChatMessage = {
      id: createId("msg"),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };
    setMessages((current) => [...current, userMessage]);
    setTyping(true);
    window.setTimeout(() => {
      const answer: ChatMessage = {
        id: createId("msg"),
        role: "assistant",
        content: replyToMessage(content, store, branchId),
        createdAt: new Date().toISOString()
      };
      setMessages((current) => [...current, answer]);
      setTyping(false);
    }, 450 + Math.random() * 500);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value || typing) return;
    setInput("");
    pushUser(value);
  }

  if (!session) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-900",
          open && "pointer-events-none opacity-0"
        )}
        aria-label={`Open ${ASSISTANT_NAME}`}
      >
        <MessageCircle className="h-4 w-4 text-teal-200" />
        Ask MIA
        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-wider">Demo AI</span>
      </button>

      {open ? (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(640px,calc(100vh-2.5rem))] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <header className="flex items-start justify-between gap-3 bg-panel px-4 py-4 text-white">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{ASSISTANT_NAME}</p>
                <p className="mt-0.5 text-xs text-white/60">{COMPANY.legalName}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-teal-200">
                  <Sparkles className="h-3 w-3" /> Showcase copilot · live demo data
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10" aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-surface px-3 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                    message.role === "user" ? "bg-ink text-white" : "border border-slate-200 bg-white text-ink"
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="space-y-0.5">{renderContent(message.content)}</div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {typing ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  MIA is thinking…
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={typing}
                  onClick={() => pushUser(prompt)}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-accent hover:bg-accentSoft"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about sales, stock, kitchen…"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Send message"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Fake AI showcase · answers from local Spice Garden data · {COMPANY.shortName}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
