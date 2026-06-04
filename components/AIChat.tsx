"use client";

import { useState, useEffect, useRef } from "react";
import { UserData, calc1RM, calcRelativeStrength } from "@/lib/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  userData: UserData;
  onClose: () => void;
}

export default function AIChat({ userData, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Sup ${userData.name}. I'm your AI coach. I've loaded your full training data — ${userData.exercises.length} exercises, ${userData.bodyWeight}${userData.unit} starting weight. What do you want to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function buildSystemPrompt(): string {
    const prList = Object.entries(userData.prs)
      .map(([id, pr]) => {
        const ex = userData.exercises.find((e) => e.id === id);
        if (!ex) return "";
        const ratio = calcRelativeStrength(pr.weight, userData.bodyWeight);
        const oneRM = calc1RM(pr.weight, pr.reps);
        return `${ex.name}: ${pr.weight}${userData.unit} × ${pr.reps} reps | Est. 1RM: ${oneRM}${userData.unit} | Ratio: ${ratio.toFixed(2)}×BW`;
      })
      .filter(Boolean)
      .join("\n");

    return `You are VGYM Coach — an elite, brutally honest AI fitness coach with deep knowledge of strength training and aesthetic physique development.

ATHLETE PROFILE:
Name: ${userData.name}
Body Weight: ${userData.bodyWeight}${userData.unit}
Exercises tracked: ${userData.exercises.map((e) => e.name).join(", ")}
Sessions logged: ${userData.logs.length}

PERSONAL RECORDS & STRENGTH METRICS:
${prList || "No PRs set yet."}

COACHING STYLE:
- Direct, aggressive, and brutally honest. No sugar-coating.
- Use relative strength ratios and 1RM data when giving feedback.
- If they're slacking, plateau-ing, or underperforming — roast them hard but keep it constructive.
- If they're genuinely strong, respect it but push for more.
- Give specific, actionable programming: exact sets × reps × weight prescriptions.
- Reference their actual numbers. Keep responses tight and punchy — no fluff.
- You care about aesthetic physique: chest, back, shoulders, arms. Mention muscle balance when relevant.`;
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(),
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error reaching the coach. Check your API key." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Try again." },
      ]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md h-[580px] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-black text-sm">VGYM COACH</span>
            <span className="text-zinc-600 text-xs">AI</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                  ⚡
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-red-600 text-white rounded-br-sm"
                    : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                ⚡
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Ask your coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white px-4 rounded-xl transition-colors font-bold text-sm"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
