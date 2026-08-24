"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Package, Truck, RotateCcw, MessageSquare, ChevronDown, CheckCircle, AlertCircle, Clock, BarChart3, Zap, Cpu, Database, Brain, Headphones, FileText, Globe, Shield, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "bot" | "user";
  message: string;
  time: string;
  resolved?: boolean;
  category?: string;
}

function trackDemoEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  events.push({
    event: eventName,
    properties: { demo: "ai_chatbot", ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
  console.log("[Analytics]", eventName, properties);
}

const FAQ_ANSWERS: Record<string, { answer: string; category: string; resolved: boolean }> = {
  "shipping": { answer: "🚚 *Pengiriman*\n\n• Regular: 2-3 hari kerja\n• Express: 1 hari kerja\n• Same-day: tersedia untuk Jakarta\n\nTracking bisa di https://cekresi.com\n\nApakah membantu?", category: "Pengiriman", resolved: true },
  "return": { answer: "🔄 *Retur & Refund*\n\nKebijakan retur:\n• Retur dalam 7 hari setelah terima\n• Produk harus belum dipakai\n• Slip return tersedia di kemasan\n\nProses refund: 3-5 hari kerja setelah barang sampai.\n\nAda yang lain?", category: "Retur", resolved: true },
  "payment": { answer: "💳 *Pembayaran*\n\nMetode yang tersedia:\n• Transfer BCA / Mandiri / BRI\n• GoPay / OVO / DANA\n• Credit Card (Visa/Mastercard)\n\nSemua pembayaran harus dilakukan dalam 24 jam.\n\nAda pertanyaan lain?", category: "Pembayaran", resolved: true },
  "complaint": { answer: "📋 *Komplain*\n\nMohon maaf atas ketidaknyamanan. Silakan sampaikan:\n\n1. Nomor order\n2. Jenis masalah\n3. Bukti foto (jika ada)\n\nKami akan proses dalam 1x24 jam.\n\nApakah ini tentang masalah spesifik Anda?", category: "Komplain", resolved: false },
  "order": { answer: "📦 *Cek Order*\n\nUntuk cek order, butuh:\n• Nomor order (format: ORD-2024-XXXX)\n\nAtau berikan nomor telepon yang terdaftar.\n\nContoh: ORD-2024-0831", category: "Order", resolved: false },
  "catalog": { answer: "📚 *Katalog Produk*\n\nKatalog lengkap tersedia di:\nhttps://catalog.jatismobile.com\n\nKategori:\n• Makanan & Minuman\n• Household\n• Personal Care\n• Frozen Food\n\nMau saya bantu cari produk tertentu?", category: "Katalog", resolved: true },
};

const CATEGORIES = [
  { icon: "🚚", label: "Pengiriman", color: "bg-blue-500/10 border-blue-500/20 text-blue-400", key: "shipping" },
  { icon: "🔄", label: "Retur/Refund", color: "bg-amber-500/10 border-amber-500/20 text-amber-400", key: "return" },
  { icon: "💳", label: "Pembayaran", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", key: "payment" },
  { icon: "📋", label: "Komplain", color: "bg-red-500/10 border-red-500/20 text-red-400", key: "complaint" },
  { icon: "📦", label: "Cek Order", color: "bg-violet-500/10 border-violet-500/20 text-violet-400", key: "order" },
  { icon: "📚", label: "Katalog", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400", key: "catalog" },
];

const BEHIND_SCENES_STEPS = [
  { id: "input_received", icon: MessageSquare, color: "text-brand-400", title: "Input Received", description: "Pesan user diterima via channel (WhatsApp/Web/API)", details: ["Input sanitized", "Intent detected", "Session loaded"] },
  { id: "intent_classified", icon: Brain, color: "text-violet-400", title: "Intent Classification", description: "NLP engine mengklasifikasikan intent dan entities", details: ["NER extracted", "Intent: shipping_status", "Confidence: 94%"] },
  { id: "knowledge_retrieved", icon: Database, color: "text-cyan-400", title: "Knowledge Base Lookup", description: "Query knowledge base untuk answer yang sesuai", details: ["KB query executed", "Top 3 answers ranked", "Context applied"] },
  { id: "response_generated", icon: Bot, color: "text-emerald-400", title: "Response Generation", description: "Response diformat sesuai template dan channel", details: ["Template selected", "Variables substituted", "Format validated"] },
  { id: "delivered", icon: CheckCircle, color: "text-emerald-400", title: "Delivered to User", description: "Response dikirim via channel yang sama", details: ["Channel: WhatsApp", "Delivery confirmed", "Session updated"] },
];

const INTEGRATION_POINTS = [
  { name: "ngobrol.ai NLP Engine", status: "connected", color: "emerald" },
  { name: "Knowledge Base", status: "connected", color: "emerald" },
  { name: "CRM Integration", status: "connected", color: "emerald" },
  { name: "Ticketing System", status: "connected", color: "emerald" },
  { name: "WhatsApp Business", status: "optional", color: "amber" },
  { name: "Analytics Dashboard", status: "optional", color: "amber" },
];

export default function AIChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", type: "bot", message: "Halo! 👋 Saya *Aiko* - AI Assistant PT Jatis Mobile.\n\nSaya siap membantu pertanyaan tentang:\n• Pengiriman & tracking\n• Retur & refund\n• Pembayaran\n• Komplain produk\n• Info katalog\n\nSilakan ketik pertanyaan Anda atau pilih topik di bawah:", time: "09:00", category: "Greeting", resolved: true },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showBehindScenes, setShowBehindScenes] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); 
    trackDemoEvent("demo_started", { demo_page: "ai_chatbot" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    trackDemoEvent("message_sent", { message_preview: text.substring(0, 50) });
    
    const userMsg: Message = { id: Date.now().toString(), type: "user", message: text, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setActiveStep(1);

    setTimeout(() => {
      setActiveStep(2);
      const lower = text.toLowerCase();
      let response: typeof FAQ_ANSWERS[string] | null = null;
      if (lower.includes("kirim") || lower.includes("shipping") || lower.includes("tracking") || lower.includes("pengiriman")) response = FAQ_ANSWERS.shipping;
      else if (lower.includes("retur") || lower.includes("refund") || lower.includes("kembali")) response = FAQ_ANSWERS.return;
      else if (lower.includes("bayar") || lower.includes("payment") || lower.includes("transfer")) response = FAQ_ANSWERS.payment;
      else if (lower.includes("komplain") || lower.includes("complain") || lower.includes("masalah")) response = FAQ_ANSWERS.complaint;
      else if (lower.includes("order") || lower.includes("pesanan") || lower.includes("cek")) response = FAQ_ANSWERS.order;
      else if (lower.includes("katalog") || lower.includes("catalog") || lower.includes("produk")) response = FAQ_ANSWERS.catalog;
      else response = { answer: "🤖 *Saya akan meneruskan pertanyaan Anda ke tim kami.*\n\nTim CS akan menghubungi Anda dalam 1x24 jam via WhatsApp.\n\nUntuk respon lebih cepat, silakan:\n• Kunjungi FAQ kami: jatismobile.com/faq\n• Hubungi 021-1234-5678\n\nAda hal lain yang bisa saya bantu?", category: "Escalation", resolved: false };

      setActiveStep(response.resolved ? 4 : 3);
      
      setTimeout(() => {
        const botMsg: Message = { id: (Date.now() + 1).toString(), type: "bot", message: response!.answer, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), resolved: response!.resolved, category: response!.category };
        setMessages(prev => [...prev, botMsg]);
        setTyping(false);
        setActiveStep(4);
      }, 800);
    }, 1200);
  };

  const quickReplies = ["🚚 Cek Pengiriman", "🔄 Retur & Refund", "💳 Pembayaran", "📦 Cek Order"];

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-dark-800 border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Ngobrol.ai</p>
                  <p className="text-xs text-violet-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />AI Chatbot • Demo Distributor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-400">Online</span>
              </div>
              <button 
                onClick={() => setShowBehindScenes(!showBehindScenes)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", showBehindScenes ? "bg-brand-500/10 text-brand-400 border-brand-500/20" : "bg-white/5 text-white/60 border-white/10")}
              >
                <Cpu className="w-3.5 h-3.5 inline mr-1" />
                BTS
              </button>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="bg-dark-800/50 border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span className="text-white/60">Resolution: <span className="text-emerald-400 font-semibold">87%</span></span></div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /><span className="text-white/60">Avg Response: <span className="text-amber-400 font-semibold">2.3s</span></span></div>
              </div>
              <div className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-brand-400" /><span className="text-white/60">CS Load: <span className="text-brand-400 font-semibold">-65%</span></span></div>
            </div>
          </div>
        </div>

        {/* Chat */}
        <main className="flex-1 max-w-lg mx-auto pb-32 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Categories */}
            <div className="mb-4">
              <p className="text-xs text-white/40 mb-2">Atau pilih topik:</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => sendMessage(c.key)}
                    className={cn("p-3 rounded-xl border text-xs font-medium text-center transition-all hover:scale-105", c.color)}>
                    <span className="text-lg block mb-1">{c.icon}</span>{c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickReplies.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="px-3 py-2 rounded-full bg-dark-700 text-xs text-white/70 font-medium border border-white/5 hover:bg-dark-600 hover:text-white transition-all">
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-2", msg.type === "user" && "flex-row-reverse")}>
                {msg.type === "bot" ? (
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">B</div>
                )}
                <div className={cn("max-w-[80%]")}>
                  <div className={cn("p-3 rounded-2xl text-sm whitespace-pre-line", msg.type === "bot" ? "bg-dark-700 rounded-tl-sm" : "bg-brand-500 rounded-tr-sm")}>
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/30">{msg.time}</span>
                    {msg.category && <span className={cn("text-xs px-1.5 py-0.5 rounded-full", msg.resolved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>{msg.category}</span>}
                    {msg.resolved && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-sm bg-dark-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>

        {/* Input */}
        <div className="fixed bottom-0 left-0 right-0 md:left-0 md:right-auto md:w-[calc(100%-400px)] lg:w-[calc(100%-450px)] bg-dark-800 border-t border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 border border-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
              <button onClick={() => sendMessage(input)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-white/30 mt-2 text-center">Demo AI Chatbot • Ngobrol.ai by Jatis Mobile</p>
          </div>
        </div>
      </div>

      {/* Behind the Scenes Panel */}
      {showBehindScenes && (
        <div className="hidden md:block w-[400px] lg:w-[450px] bg-dark-800 border-l border-white/5 overflow-y-auto">
          <div className="sticky top-0 bg-dark-800 border-b border-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-sm">Behind the Scenes</h2>
            </div>
            <p className="text-xs text-white/40">AI processing pipeline</p>
          </div>

          {/* Integration Points */}
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">Integration Points</p>
            <div className="grid grid-cols-2 gap-2">
              {INTEGRATION_POINTS.map((int, i) => (
                <div key={i} className={cn("p-2 rounded-lg border text-xs", int.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20")}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-medium text-white/80">{int.status === "connected" ? "🟢" : "🟡"}</span>
                  </div>
                  <p className="text-white/60">{int.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Step */}
          <div className="p-4">
            <p className="text-xs text-white/40 mb-3 font-medium">AI Pipeline Activity</p>
            <div className="space-y-2">
              {BEHIND_SCENES_STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <div key={s.id} className={cn("p-3 rounded-xl border transition-all", isActive ? "bg-violet-500/10 border-violet-500/30" : isPast ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-white/5 opacity-50")}>
                    <div className="flex items-start gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isActive ? "bg-violet-500/20" : isPast ? "bg-emerald-500/10" : "bg-dark-700")}>
                        <Icon className={cn("w-4 h-4", s.color, !isActive && !isPast && "opacity-30")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isActive ? "text-violet-400" : isPast ? "text-white/80" : "text-white/40")}>{s.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{s.description}</p>
                        {isActive && (
                          <div className="mt-2 space-y-1">
                            {s.details.map((d, j) => (
                              <div key={j} className="flex items-center gap-1.5 text-xs text-white/50">
                                <Check className="w-3 h-3 text-violet-400" />
                                <span>{d}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NLP Stats */}
          <div className="p-4 border-t border-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">NLP Engine Stats</p>
            <div className="space-y-2">
              {[
                { label: "Intent Accuracy", value: "94%", color: "emerald" },
                { label: "Entity Extraction", value: "91%", color: "emerald" },
                { label: "Response Time", value: "2.3s", color: "amber" },
                { label: "Fallback Rate", value: "8%", color: "violet" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-white/60">{s.label}</span>
                  <span className={cn("text-xs font-semibold", s.color === "emerald" ? "text-emerald-400" : s.color === "amber" ? "text-amber-400" : "text-violet-400")}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
