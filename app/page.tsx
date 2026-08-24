"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, Bot, Phone, Zap, Shield, Users, TrendingUp, CheckCircle, 
  Play, ArrowRight, Star, BarChart3, Target, Sparkles, ChevronDown,
  ArrowUpRight, Clock, Globe, LayoutGrid, MousePointer, Gauge, Bell
} from "lucide-react";

// Track events
function trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  events.push({
    event: eventName,
    properties: { page: "landing", ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
}

const DEMO_CARDS = [
  {
    id: "whatsapp_chat",
    icon: "🛒",
    title: "Chat Commerce",
    subtitle: "WhatsApp Business Platform",
    description: "Simulasi lengkap chat commerce — katalog produk, order taking, konfirmasi stok, hingga digital receipt.",
    gradient: "from-emerald-400 to-teal-500",
    badge: "SIMULASI",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
    kpis: [
      { label: "Conversion Rate", value: "23%" },
      { label: "Avg. Order", value: "Rp 850Rb" },
    ],
    href: "/demos/whatsapp-chat",
  },
  {
    id: "ai_chatbot",
    icon: "🤖",
    title: "Ngobrol.ai",
    subtitle: "AI Chatbot untuk Distributor",
    description: "AI chatbot menangani pertanyaan distributor — shipping status, retur policy, hingga ticket creation.",
    gradient: "from-violet-400 to-purple-500",
    badge: "SIMULASI",
    badgeClass: "bg-violet-50 text-violet-600 border-violet-200",
    kpis: [
      { label: "FAQ Resolution", value: "87%" },
      { label: "CS Load Reduction", value: "65%" },
    ],
    href: "/demos/ai-chatbot",
  },
  {
    id: "robocall",
    icon: "📞",
    title: "RoboCall",
    subtitle: "AI Voice Agent Payment Reminder",
    description: "AI voice agent untuk reminder pembayaran otomatis — IVR, konfirmasi, dan escalation ke WhatsApp.",
    gradient: "from-orange-400 to-amber-500",
    badge: "SIMULASI",
    badgeClass: "bg-orange-50 text-orange-600 border-orange-200",
    kpis: [
      { label: "Collection Rate", value: "+34%" },
      { label: "Call Success", value: "89%" },
    ],
    href: "/demos/robocall",
  },
];

const TRUST_BADGES = [
  { label: "ISO 9001:2015", sublabel: "Quality Management" },
  { label: "500+ Klien", sublabel: "Enterprise Clients" },
  { label: "100M+ Pesan", sublabel: "Messages/bulan" },
  { label: "99.9% Uptime", sublabel: "SLA Guarantee" },
];

const STATS = [
  { label: "Leads Generated", value: "2,847+", color: "text-brand-600" },
  { label: "Demo Completions", value: "1,523", color: "text-emerald-600" },
  { label: "Avg. Session", value: "4.2 min", color: "text-violet-600" },
  { label: "Conversion Rate", value: "23%", color: "text-orange-600" },
];

const FEATURES = [
  { icon: LayoutGrid, title: "Demo Interaktif Real-Time", desc: "Bukan slideshow. Pilih persona, input, dan lihat output nyata dari sistem Jatis Mobile.", color: "bg-brand-50 text-brand-600" },
  { icon: Shield, title: "Simulasi Tanpa Risiko", desc: "Tidak ada data klien nyata. Tidak ada broadcast nyata. Semua sandbox.", color: "bg-emerald-50 text-emerald-600" },
  { icon: Target, title: "Lead Qualification Otomatis", desc: "Demo yang dicoba, use case yang dipilih — semua jadi sinyal untuk lead scoring.", color: "bg-violet-50 text-violet-600" },
  { icon: Bell, title: "WhatsApp OTP Verification", desc: "Nomor diverifikasi via OTP sebelum lead dikirim ke sales team.", color: "bg-orange-50 text-orange-600" },
];

const LOGO_PARTNERS = [
  "Indomaret", " Alfamart", "Indofood", "Unilever", "Astra", "Salim Group", "Telkom"
];

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  React.useEffect(() => {
    if (!localStorage.getItem("session_id")) {
      localStorage.setItem("session_id", `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
    trackEvent("page_view");
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">GrowthAI</p>
                <p className="text-xs text-gray-500">by Jatis Mobile</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#demos" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Demos</a>
              <a href="#features" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Features</a>
              <a href="/admin" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Admin</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="hidden sm:flex btn-secondary text-sm">Login</Link>
              <Link href="#demos" className="btn-primary text-sm">Try Demos</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand-100 to-brand-50 rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full blur-3xl opacity-60 animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-brand-50 via-transparent to-violet-50 rounded-full blur-3xl opacity-30" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)", backgroundSize: "60px 60px"}} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-50 border border-brand-200 mb-8 animate-slide-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-brand-600">Interactive Demo Hub for FMCG</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 animate-slide-up">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600">Jatis FMCG</span>
            <br />
            <span className="text-gray-900">DemoHub</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-4 animate-slide-up">
            "Try Before You Talk to Sales"
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12 animate-slide-up">
            Experience WhatsApp Business Platform, AI Chatbot, RoboCall, dan Enterprise Messaging 
            melalui simulasi operasional yang relevan dengan KPI FMCG Anda.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <a href="#demos" className="btn-primary text-base px-10 py-4 text-lg">
              <Play className="w-5 h-5" />Explore Demos
            </a>
            <Link href="/admin" className="btn-secondary text-base px-10 py-4 text-lg">
              <BarChart3 className="w-5 h-5" />Admin Panel
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16 animate-slide-up">
            {TRUST_BADGES.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{badge.label}</p>
                  <p className="text-xs text-gray-500">{badge.sublabel}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                <p className={`text-3xl sm:text-4xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-gray-300 animate-bounce" />
        </div>
      </section>

      {/* Demos Section */}
      <section id="demos" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200 mb-6">
              <Sparkles className="w-4 h-4" />SIMULASI INTERAKTIF
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              3 Demo yang Bisa Anda Coba <span className="text-brand-600">Sekarang</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Setiap demo adalah simulasi operasional lengkap — bukan fake UI. 
              Anda akan lihat apa yang terjadi di balik layar Jatis Mobile.
            </p>
          </div>

          {/* Demo cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {DEMO_CARDS.map((demo, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${hoveredCard === i ? "ring-2 ring-brand-400 shadow-xl -translate-y-2" : "card-hover"}`}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${demo.gradient}`} />
                
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${demo.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                        {demo.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{demo.title}</h3>
                        <p className="text-sm text-gray-500">{demo.subtitle}</p>
                      </div>
                    </div>
                    <span className={`badge-gradient ${demo.badgeClass}`}>{demo.badge}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 line-clamp-3">{demo.description}</p>

                  {/* KPIs */}
                  <div className="flex gap-6 p-4 rounded-2xl bg-gray-50 mb-6">
                    {demo.kpis.map((kpi, j) => (
                      <div key={j}>
                        <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                        <p className="text-xs text-gray-500">{kpi.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link 
                    href={demo.href}
                    onClick={() => trackEvent("demo_clicked", { demo_id: demo.id })}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all"
                  >
                    <Play className="w-5 h-5" />Coba Demo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 mb-6">
              <CheckCircle className="w-4 h-4" />FITUR UNGGULAN
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Mengapa DemoHub <span className="text-brand-600">Berbeda</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Tidak ada demo lain yang memberikan pengalaman seinteraktif dan seabstrak ini.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-brand-200 hover:shadow-xl transition-all duration-300">
                <div className="flex gap-5">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners/Clients */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 mb-8">TRUSTED BY LEADING FMCG COMPANIES</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-60">
            {LOGO_PARTNERS.map((partner, i) => (
              <div key={i} className="text-xl font-bold text-gray-400">{partner}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-brand-500 to-violet-600 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-16 h-16 text-white/80 mx-auto mb-8" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Siap Coba?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Pilih demo yang paling relevan dengan peran Anda, coba simulasi interaktif, dan daftarkan diri untuk lanjut ke free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#demos" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-bold text-brand-600 bg-white hover:bg-gray-100 transition-all shadow-xl">
              <Play className="w-5 h-5" />Mulai Demo Sekarang
            </a>
            <Link href="/leads" className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all">
              <ArrowRight className="w-5 h-5" />Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">GrowthAI DemoHub</p>
                <p className="text-xs text-gray-400">by Jatis Mobile</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 Jatis Mobile. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
