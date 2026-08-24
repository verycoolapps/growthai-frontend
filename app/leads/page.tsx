"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle, Shield, MessageSquare, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Analytics tracking
function trackFormEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  const utmData = JSON.parse(localStorage.getItem("utm_data") || "{}");
  events.push({
    event: eventName,
    properties: { page: "registration", ...utmData, ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
  console.log("[Analytics]", eventName, properties);
}

const USER_INTENTS = [
  { id: "consumer_engagement", label: "Consumer Engagement", icon: "👥", desc: "Loyalty, onboarding, CS" },
  { id: "distributor_operations", label: "Distributor Operations", icon: "🏭", desc: "Stock alert, order confirmation" },
  { id: "customer_service", label: "Customer Service", icon: "💬", desc: "Omnichannel, AI chatbot" },
  { id: "trade_promotion", label: "Trade Promotion", icon: "🎁", desc: "Promo broadcast, campaigns" },
  { id: "order_management", label: "Order Management", icon: "📦", desc: "Chat commerce, tracking" },
  { id: "payment_collection", label: "Payment Collection", icon: "💳", desc: "RoboCall reminder" },
];

const VOLUME_RANGES = [
  { value: "1k_10k", label: "1K - 10K pesan/bulan" },
  { value: "10k_50k", label: "10K - 50K pesan/bulan" },
  { value: "50k_100k", label: "50K - 100K pesan/bulan" },
  { value: "100k_500k", label: "100K - 500K pesan/bulan" },
  { value: "500k_plus", label: "500K+ pesan/bulan" },
];

const FOLLOWUP_PREFS = [
  { value: "schedule_demo", label: "Jadwalkan Demo dengan Sales" },
  { value: "free_trial", label: "Akses Free Trial Sandbox" },
  { value: "sales_call", label: "Hubungi Sales untuk Konsultasi" },
  { value: "documentation", label: "Kirim Dokumentasi Produk" },
];

export default function LeadsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    company: "",
    position: "",
    useCase: "",
    volumeRange: "",
    followUpPref: "",
    consent: false,
  });

  useEffect(() => {
    trackFormEvent("registration_page_viewed");
  }, []);

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    
    // Track field changes
    if (field === "useCase" && typeof value === "string") {
      trackFormEvent("use_case_selected", { use_case: value });
    } else if (field === "volumeRange" && typeof value === "string") {
      trackFormEvent("volume_range_selected", { volume_range: value });
    } else if (field === "followUpPref" && typeof value === "string") {
      trackFormEvent("followup_pref_selected", { followup_pref: value });
    }
  };

  const canProceed = () => {
    if (step === 1) return form.name.length >= 2 && form.email.includes("@") && form.whatsapp.length >= 8;
    if (step === 2) return form.company.length >= 2 && form.position.length >= 2;
    if (step === 3) return form.useCase && form.volumeRange && form.followUpPref;
    if (step === 4) return form.consent;
    return true;
  };

  const handleNext = () => {
    trackFormEvent("form_step_completed", { step });
    setStep(s => Math.min(s + 1, 4));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Get UTM data
      const utmData = JSON.parse(localStorage.getItem("utm_data") || "{}");
      
      // Get events for scoring
      const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
      const demoEvents = events.filter((e: { event: string }) => e.event.includes("demo"));
      const demoCount = demoEvents.length;
      
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          company: form.company,
          position: form.position,
          useCase: form.useCase,
          volumeRange: form.volumeRange,
          followUpPref: form.followUpPref,
          consentGiven: form.consent,
          utm_source: utmData.source || "direct",
          utm_medium: utmData.medium || "",
          utm_campaign: utmData.campaign || "",
          demo_count: demoCount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Error ${res.status}: Registration failed`);
      }

      // Track successful registration
      trackFormEvent("registration_completed", {
        lead_id: data.leadId,
        use_case: form.useCase,
        volume_range: form.volumeRange,
        followup_pref: form.followUpPref,
        demo_count: demoCount,
        storage: data.storage,
      });

      // Store lead data for confirmation page
      localStorage.setItem("lead_data", JSON.stringify({
        name: form.name,
        email: form.email,
        company: form.company,
        useCase: form.useCase,
        leadScore: data.score || 50,
        intent: data.intent || "medium",
      }));

      router.push("/confirmation");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
      setError(message);
      trackFormEvent("registration_failed", { error: message });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Data Diri" },
    { num: 2, label: "Perusahaan" },
    { num: 3, label: "Use Case" },
    { num: 4, label: "Konfirmasi" },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    step >= s.num ? "bg-brand-500 text-white" : "bg-dark-700 text-white/40"
                  )}>
                    {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={cn("text-sm font-medium hidden sm:block", step >= s.num ? "text-white" : "text-white/40")}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2", step > s.num ? "bg-brand-500" : "bg-dark-700")} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 md:p-8">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Data Diri</h2>
                <p className="text-white/50 text-sm">Lengkapi informasi pribadi Anda</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                <input type="text" value={form.name} onChange={e => updateForm("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Bisnis *</label>
                <input type="email" value={form.email} onChange={e => updateForm("email", e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nomor WhatsApp *</label>
                <input type="tel" value={form.whatsapp} onChange={e => updateForm("whatsapp", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="input-field" />
                <p className="text-xs text-white/30 mt-1">Contoh: 081234567890</p>
              </div>
            </div>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Informasi Perusahaan</h2>
                <p className="text-white/50 text-sm">Tentang perusahaan Anda</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Perusahaan *</label>
                <input type="text" value={form.company} onChange={e => updateForm("company", e.target.value)}
                  placeholder="PT ABC Indonesia"
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jabatan *</label>
                <input type="text" value={form.position} onChange={e => updateForm("position", e.target.value)}
                  placeholder="Head of Digital Marketing"
                  className="input-field" />
              </div>
            </div>
          )}

          {/* Step 3: Use Case */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Use Case & Preferensi</h2>
                <p className="text-white/50 text-sm">Pilih use case yang paling relevan</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Use Case Utama *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {USER_INTENTS.map(intent => (
                    <button key={intent.id} onClick={() => updateForm("useCase", intent.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        form.useCase === intent.id
                          ? "bg-brand-500/10 border-brand-500/50"
                          : "bg-dark-700 border-white/5 hover:border-white/10"
                      )}>
                      <span className="text-2xl block mb-2">{intent.icon}</span>
                      <p className="text-sm font-medium">{intent.label}</p>
                      <p className="text-xs text-white/40 mt-1">{intent.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Volume Pesan/Bulan *</label>
                <div className="flex flex-wrap gap-2">
                  {VOLUME_RANGES.map(vol => (
                    <button key={vol.value} onClick={() => updateForm("volumeRange", vol.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm transition-all",
                        form.volumeRange === vol.value
                          ? "bg-brand-500/10 border-brand-500/50 text-white"
                          : "bg-dark-700 border-white/5 text-white/70 hover:border-white/10"
                      )}>
                      {vol.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Preferensi Follow-up *</label>
                <div className="space-y-2">
                  {FOLLOWUP_PREFS.map(pref => (
                    <button key={pref.value} onClick={() => updateForm("followUpPref", pref.value)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3",
                        form.followUpPref === pref.value
                          ? "bg-brand-500/10 border-brand-500/50"
                          : "bg-dark-700 border-white/5 hover:border-white/10"
                      )}>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        form.followUpPref === pref.value ? "border-brand-500 bg-brand-500" : "border-white/30"
                      )}>
                        {form.followUpPref === pref.value && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm">{pref.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2">Konfirmasi</h2>
                <p className="text-white/50 text-sm">Pastikan data Anda benar</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nama", value: form.name },
                  { label: "Email", value: form.email },
                  { label: "WhatsApp", value: form.whatsapp },
                  { label: "Perusahaan", value: form.company },
                  { label: "Jabatan", value: form.position },
                  { label: "Use Case", value: USER_INTENTS.find(u => u.id === form.useCase)?.label || "-" },
                  { label: "Volume", value: VOLUME_RANGES.find(v => v.value === form.volumeRange)?.label || "-" },
                  { label: "Follow-up", value: FOLLOWUP_PREFS.find(f => f.value === form.followUpPref)?.label || "-" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-3 rounded-lg bg-dark-700">
                    <span className="text-white/40 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                form.consent ? "bg-brand-500/5 border-brand-500/30" : "bg-dark-700 border-white/5 hover:border-white/10"
              )} onClick={() => updateForm("consent", !form.consent)}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    form.consent ? "border-brand-500 bg-brand-500" : "border-white/30"
                  )}>
                    {form.consent && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Saya menyetujui обработку данных pribadi</p>
                    <p className="text-xs text-white/40 mt-1">
                      Data akan digunakan untuk follow-up dari tim Jatis Mobile dan tidak akan dibagikan ke pihak ketiga.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
                <ArrowLeft className="w-4 h-4" />Kembali
              </button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <button onClick={handleNext} disabled={!canProceed()} className="btn-primary">
                Lanjut<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canProceed() || loading} className="btn-primary">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : "Daftar Sekarang"}
              </button>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/30">
          <Shield className="w-4 h-4" />
          <span className="text-xs">Data Anda aman dan terenkripsi</span>
        </div>
      </main>
    </div>
  );
}
