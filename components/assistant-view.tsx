"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { useBranchData } from "@/components/app-provider";
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

export function AssistantView() {
  const { store, branchId, branch } = useBranchData();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([createWelcomeMessage(store, branchId)]);
    // Reset thread when branch changes; store snapshot is read at ask-time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function ask(content: string) {
    const trimmed = content.trim();
    if (!trimmed || typing) return;
    setMessages((current) => [
      ...current,
      { id: createId("msg"), role: "user", content: trimmed, createdAt: new Date().toISOString() }
    ]);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createId("msg"),
          role: "assistant",
          content: replyToMessage(trimmed, store, branchId),
          createdAt: new Date().toISOString()
        }
      ]);
      setTyping(false);
    }, 400 + Math.random() * 450);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = input;
    setInput("");
    ask(value);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{COMPANY.legalName}</p>
        <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{ASSISTANT_NAME}</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Showcase AI copilot for {branch?.name ?? "your branch"}. Responses are simulated from live Spice Garden data to demonstrate an embedded operations assistant.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-panel px-5 py-4 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">{ASSISTANT_NAME}</p>
            <p className="text-xs text-white/60 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-teal-200" /> Demo AI · not a live LLM
            </p>
          </div>
        </div>

        <div ref={scroller} className="h-[min(520px,55vh)] space-y-3 overflow-y-auto bg-surface px-4 py-5">
          {messages.map((message) => (
            <div key={message.id} className={clsx("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={clsx(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  message.role === "user" ? "bg-ink text-white" : "border border-slate-200 bg-white"
                )}
              >
                {message.role === "assistant" ? <div>{renderContent(message.content)}</div> : <p className="text-sm">{message.content}</p>}
              </div>
            </div>
          ))}
          {typing ? <p className="text-sm text-slate-500">MIA is thinking…</p> : null}
        </div>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => ask(prompt)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold hover:border-accent hover:bg-accentSoft"
              >
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about revenue, stock, kitchen delays, CRM…"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white">
              Send <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
