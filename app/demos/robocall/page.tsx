"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, RotateCcw, Clock, CheckCircle, AlertCircle, ArrowRight, User, Building, CreditCard, MessageSquare, Cpu, Zap, Database, Globe, Shield, Headphones, FileText, BarChart3, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallLog {
  id: string;
  customer: string;
  company: string;
  amount: string;
  status: "connected" | "no_answer" | "busy" | "failed";
  duration: number;
  outcome: "promised" | "pending" | "refused" | "callback";
  time: string;
}

function trackDemoEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  events.push({
    event: eventName,
    properties: { demo: "robocall", ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
  console.log("[Analytics]", eventName, properties);
}

const MOCK_LOGS: CallLog[] = [
  { id: "1", customer: "Budi Santoso", company: "PT Indomaret", amount: "Rp 15.500.000", status: "connected", duration: 142, outcome: "promised", time: "09:30" },
  { id: "2", customer: "Siti Rahayu", company: "PT Alfamart", amount: "Rp 8.750.000", status: "connected", duration: 98, outcome: "pending", time: "09:45" },
  { id: "3", customer: "Ahmad Wijaya", company: "PT Hero", amount: "Rp 22.100.000", status: "no_answer", duration: 0, outcome: "callback", time: "10:00" },
  { id: "4", customer: "Dewi Kusuma", company: "PT Giant", amount: "Rp 5.200.000", status: "busy", duration: 0, outcome: "callback", time: "10:15" },
  { id: "5", customer: "Rudi Hermawan", company: "PT Transmart", amount: "Rp 18.900.000", status: "connected", duration: 187, outcome: "promised", time: "10:30" },
];

const SCRIPT_STEPS = [
  { speaker: "bot" as const, text: "Halo, saya Aiko dari Jatis Mobile. Saya menghubungi untuk mengingatkan tagihan PT Hero sebanyak Rp 22.100.000 yang sudah jatuh tempo. Apakah Bapak Ahmad Wijaya tersedia?" },
  { speaker: "user" as const, text: "[Jawab]", delay: 1000 },
  { speaker: "bot" as const, text: "Baik Bapak. Tagihan tersebut sudah 30 hari overdue. Apakah ada kendala dalam proses pembayarannya?" },
  { speaker: "user" as const, text: "[Jawab]", delay: 1000 },
  { speaker: "bot" as const, text: "Kami menawarkan cicilan 3x tanpa bunga. Apakah Bapak bersedia安排了 jadwal pembayaran?" },
  { speaker: "user" as const, text: "[Konfirmasi / Tolak]", delay: 1000 },
  { speaker: "bot" as const, text: "Baik terima kasih. Konfirmasi pembayaran akan dikirim via WhatsApp. Mohon tunggu pesan berikutnya." },
];

const BEHIND_SCENES_STEPS = [
  { id: "dialing", icon: Phone, color: "text-orange-400", title: "Dialing", description: "RoboCall engine membuat outbound call ke nomor target", details: ["Number validated", "Carrier lookup", "Ring timeout: 30s"] },
  { id: "connected", icon: Headphones, color: "text-emerald-400", title: "IVR Session", description: "IVR greeting diputar, input DTMF diterima", details: ["IVR played", "Keypress detected", "Transfer to agent"] },
  { id: "transcribing", icon: FileText, color: "text-cyan-400", title: "Speech-to-Text", description: "Voice user dikonversi ke text untuk NLP processing", details: ["STT processing", "Audio chunks: 0.5s", "Partial transcripts"] },
  { id: "intent", icon: Database, color: "text-violet-400", title: "Intent Analysis", description: "NLP engine mengklasifikasikan response customer", details: ["Intent: payment_promise", "Entities extracted", "Confidence: 89%"] },
  { id: "response", icon: BarChart3, color: "text-brand-400", title: "Response Generation", description: "AI voice agent merespons berdasarkan intent", details: ["TTS generated", "Emotion: neutral", "Escalation check"] },
  { id: "whatsapp", icon: MessageSquare, color: "text-emerald-400", title: "WhatsApp Handoff", description: "Jika perlu, conversation di-escalate ke WhatsApp", details: ["WA link sent", "Context transferred", "Agent notified"] },
];

const INTEGRATION_POINTS = [
  { name: "RoboCall Engine", status: "connected", color: "emerald" },
  { name: "IVR System", status: "connected", color: "emerald" },
  { name: "Speech-to-Text", status: "connected", color: "emerald" },
  { name: "NLP Engine", status: "connected", color: "emerald" },
  { name: "WhatsApp Business", status: "connected", color: "emerald" },
  { name: "CRM / Collection", status: "optional", color: "amber" },
];

export default function RoboCallDemo() {
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "ended">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [showBehindScenes, setShowBehindScenes] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    trackDemoEvent("demo_started", { demo_page: "robocall" });
    
    if (callState === "connected") {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [callState]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const startCall = () => {
    trackDemoEvent("call_started", { phone_number: "+62 811-2345-6789" });
    setCallState("calling");
    setTimer(0);
    setCurrentStep(0);
    setActiveStep(0);
    setTimeout(() => {
      setCallState("connected");
      setActiveStep(1);
      trackDemoEvent("call_connected", { duration: 0 });
    }, 3000);
  };

  const endCall = () => {
    trackDemoEvent("call_ended", { duration: timer, outcome: "completed" });
    setCallState("ended");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const nextStep = () => {
    if (currentStep < SCRIPT_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      setActiveStep(Math.min(nextIdx + 1, BEHIND_SCENES_STEPS.length - 1));
      trackDemoEvent("script_step", { step: nextIdx, speaker: SCRIPT_STEPS[nextIdx].speaker });
    } else {
      endCall();
    }
  };

  const resetCall = () => {
    setCallState("idle");
    setCurrentStep(0);
    setTimer(0);
    setActiveStep(0);
  };

  const stats = {
    total: MOCK_LOGS.length,
    connected: MOCK_LOGS.filter(l => l.status === "connected").length,
    collectionRate: 65,
    promisedAmount: MOCK_LOGS.filter(l => l.outcome === "promised").reduce((sum, l) => sum + 22.1, 0),
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-dark-800 border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">RoboCall Demo</p>
                  <p className="text-xs text-orange-400">AI Voice Agent • Payment Reminder</p>
                </div>
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
              <div className="flex items-center gap-3">
                <span className="text-white/40">Total: <span className="text-white font-semibold">{stats.total}</span></span>
                <span className="text-white/40">Connected: <span className="text-emerald-400 font-semibold">{stats.connected}</span></span>
                <span className="text-white/40">Collection: <span className="text-orange-400 font-semibold">{stats.collectionRate}%</span></span>
              </div>
              <span className="text-white/40">Promise: <span className="text-emerald-400 font-semibold">Rp {(stats.promisedAmount).toFixed(1)}jt</span></span>
            </div>
          </div>
        </div>

        <main className="flex-1 max-w-lg mx-auto p-4 overflow-y-auto">
          {/* Call UI */}
          {callState !== "ended" ? (
            <div className="glass-card p-6 mb-6">
              {/* Caller ID */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mx-auto flex items-center justify-center mb-4 animate-pulse">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold">{callState === "calling" ? "Memanggil..." : callState === "connected" ? "RoboCall Aktif" : "RoboCall Demo"}</h2>
                <p className="text-white/50 text-sm mt-1">
                  {callState === "calling" ? "+62 811-2345-6789" : callState === "connected" ? `Ahmad Wijaya • PT Hero • ${formatTime(timer)}` : "Klik tombol untuk memulai demo"}
                </p>
                {callState === "calling" && <div className="mt-2"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /><span className="text-xs text-emerald-400">Merangkai panggilan...</span></div></div>}
              </div>

              {/* Script */}
              {callState === "connected" && (
                <div className="bg-dark-700 rounded-xl p-4 mb-4 max-h-64 overflow-y-auto">
                  <p className="text-xs text-white/40 mb-3 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Script Conversation</p>
                  {SCRIPT_STEPS.slice(0, currentStep + 1).map((step, i) => (
                    <div key={i} className={cn("mb-3 last:mb-0", step.speaker === "user" && "text-right")}>
                      <div className={cn("inline-block max-w-[90%] px-3 py-2 rounded-xl text-sm", step.speaker === "bot" ? "bg-dark-600 text-white/80" : "bg-brand-500/80 text-white")}>
                        <span className={cn("text-xs font-medium mr-1", step.speaker === "bot" ? "text-orange-400" : "text-emerald-300")}>{step.speaker === "bot" ? "🤖 Aiko" : "👤 User"}</span>
                        {step.text}
                      </div>
                    </div>
                  ))}
                  {currentStep < SCRIPT_STEPS.length - 1 && SCRIPT_STEPS[currentStep + 1].speaker === "user" && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-white/40 text-center mb-2">Langkah berikutnya:</p>
                      <button onClick={nextStep} className="w-full py-2 rounded-lg bg-dark-600 text-sm text-white/70 hover:bg-dark-500 transition-colors">
                        Lanjut ke "{SCRIPT_STEPS[currentStep + 1].text.replace("[", "").replace("]", "")}"
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {callState === "idle" && (
                  <button onClick={startCall} className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </button>
                )}
                {callState === "calling" && (
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping" />
                  </div>
                )}
                {callState === "connected" && (
                  <>
                    <button onClick={() => setMuted(m => !m)} className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", muted ? "bg-red-500/20 border border-red-500 text-red-400" : "bg-dark-600 text-white/60 hover:bg-dark-500")}>
                      {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button onClick={endCall} className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 transition-transform">
                      <PhoneOff className="w-7 h-7 text-white" />
                    </button>
                    <button onClick={() => setSpeakerOn(s => !s)} className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors", speakerOn ? "bg-dark-600 text-white/60 hover:bg-dark-500" : "bg-amber-500/20 border border-amber-500 text-amber-400")}>
                      {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  </>
                )}
              </div>

              {/* Timer */}
              {callState === "connected" && (
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-lg font-mono text-white">{formatTime(timer)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Ended State */
            <div className="glass-card p-6 mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-emerald-400">Panggilan Selesai</h2>
              <p className="text-white/50 text-sm mt-2">Demo RoboCall selesai. Data tidak disimpan.</p>
              <button onClick={resetCall} className="mt-4 px-6 py-2 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-400 transition-colors inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />Demo Ulang
              </button>
            </div>
          )}

          {/* Call Logs */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold text-sm">📞 Riwayat Panggilan (Demo)</h3>
            </div>
            <div className="divide-y divide-white/5">
              {MOCK_LOGS.map(log => (
                <div key={log.id} className="p-4 flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", log.status === "connected" ? "bg-emerald-500/10" : log.status === "no_answer" ? "bg-amber-500/10" : "bg-red-500/10")}>
                    {log.status === "connected" ? <Phone className="w-4 h-4 text-emerald-400" /> : log.status === "no_answer" ? <AlertCircle className="w-4 h-4 text-amber-400" /> : <PhoneOff className="w-4 h-4 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.customer}</p>
                    <p className="text-xs text-white/40 truncate">{log.company} • {log.amount}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={cn("text-xs px-2 py-0.5 rounded-full inline-block mb-1", log.outcome === "promised" ? "bg-emerald-500/10 text-emerald-400" : log.outcome === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400")}>
                      {log.outcome === "promised" ? "💰 Promised" : log.outcome === "pending" ? "⏳ Pending" : "📞 Callback"}
                    </div>
                    <p className="text-xs text-white/30">{log.status === "connected" ? formatTime(log.duration) : log.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Tentang Demo</h4>
            <ul className="text-xs text-white/50 space-y-1">
              <li>• RoboCall menggunakan AI voice agent dengan script conversation</li>
              <li>• IVR menu: Reminder → Konfirmasi → Janji Bayar → Escalation</li>
              <li>• Koneksi ke WhatsApp jika customer ingin chat lebih lanjut</li>
              <li>• Tidak ada panggilan nyata dalam demo ini</li>
            </ul>
          </div>
        </main>
      </div>

      {/* Behind the Scenes Panel */}
      {showBehindScenes && (
        <div className="hidden md:block w-[400px] lg:w-[450px] bg-dark-800 border-l border-white/5 overflow-y-auto">
          <div className="sticky top-0 bg-dark-800 border-b border-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-5 h-5 text-brand-400" />
              <h2 className="font-bold text-sm">Behind the Scenes</h2>
            </div>
            <p className="text-xs text-white/40">RoboCall AI pipeline</p>
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
            <p className="text-xs text-white/40 mb-3 font-medium">Voice AI Pipeline</p>
            <div className="space-y-2">
              {BEHIND_SCENES_STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <div key={s.id} className={cn("p-3 rounded-xl border transition-all", isActive ? "bg-orange-500/10 border-orange-500/30" : isPast ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-white/5 opacity-50")}>
                    <div className="flex items-start gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isActive ? "bg-orange-500/20" : isPast ? "bg-emerald-500/10" : "bg-dark-700")}>
                        <Icon className={cn("w-4 h-4", s.color, !isActive && !isPast && "opacity-30")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isActive ? "text-orange-400" : isPast ? "text-white/80" : "text-white/40")}>{s.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{s.description}</p>
                        {isActive && (
                          <div className="mt-2 space-y-1">
                            {s.details.map((d, j) => (
                              <div key={j} className="flex items-center gap-1.5 text-xs text-white/50">
                                <Check className="w-3 h-3 text-orange-400" />
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

          {/* Call Stats */}
          <div className="p-4 border-t border-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">Campaign Stats (Demo)</p>
            <div className="space-y-2">
              {[
                { label: "Total Calls", value: "847", color: "text-white" },
                { label: "Connected", value: "712 (84%)", color: "text-emerald-400" },
                { label: "Collection Rate", value: "+34%", color: "text-orange-400" },
                { label: "Promise-to-Pay", value: "78%", color: "text-brand-400" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-white/60">{s.label}</span>
                  <span className={cn("text-xs font-semibold", s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
