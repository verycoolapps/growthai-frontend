"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Calendar, Clock, MessageSquare, Phone, Mail, ArrowRight, Zap, Star, CalendarDays, Video, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  events.push({
    event: eventName,
    properties: { page: "confirmation", ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
  console.log("[Analytics]", eventName, properties);
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
];

const DEMO_TYPES = [
  { id: "whatsapp_chat", icon: "🛒", label: "Chat Commerce", desc: "WhatsApp Business Platform" },
  { id: "ai_chatbot", icon: "🤖", label: "Ngobrol.ai", desc: "AI Chatbot Demo" },
  { id: "robocall", icon: "📞", label: "RoboCall", desc: "AI Voice Agent" },
];

export default function ConfirmationPage() {
  const [leadData, setLeadData] = useState({ name: "", email: "", company: "", useCase: "", leadScore: 50, intent: "medium" });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [demoType, setDemoType] = useState("");

  useEffect(() => {
    // Get lead data from localStorage
    const stored = localStorage.getItem("lead_data");
    if (stored) {
      setLeadData(JSON.parse(stored));
    }
    
    trackEvent("confirmation_page_viewed");
    
    // Get demo history
    const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
    const demoEvents = events.filter((e: { event: string }) => e.event.includes("demo") || e.event === "demo_started");
    if (demoEvents.length > 0) {
      const lastDemo = demoEvents[demoEvents.length - 1];
      if (lastDemo.properties?.demo_page) {
        setDemoType(lastDemo.properties.demo_page);
      }
    }
  }, []);

  // Generate next 7 weekdays
  const getNextWeekdays = () => {
    const dates = [];
    const today = new Date();
    let count = 0;
    let daysAdded = 0;
    
    while (daysAdded < 7) {
      const date = new Date(today);
      date.setDate(today.getDate() + count);
      count++;
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          date: date.toISOString().split("T")[0],
          day: date.toLocaleDateString("id-ID", { weekday: "short" }),
          dayNum: date.getDate(),
          month: date.toLocaleDateString("id-ID", { month: "short" }),
        });
        daysAdded++;
      }
    }
    return dates;
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return;
    
    trackEvent("meeting_scheduled", {
      date: selectedDate,
      time: selectedTime,
      demo_type: demoType || "general",
    });
    
    setScheduled(true);
  };

  const getIntentColor = (intent: string) => {
    if (intent === "high") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (intent === "medium") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const nextDates = getNextWeekdays();

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-sm font-medium">Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!scheduled ? (
          <div className="space-y-8">
            {/* Success Message */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Pendaftaran Berhasil, {leadData.name}! 🎉
              </h1>
              <p className="text-white/50">
                Tim Jatis Mobile akan menghubungi Anda dalam 1x24 jam kerja.
              </p>
            </div>

            {/* Lead Summary */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">Ringkasan Pendaftaran</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dark-700">
                  <p className="text-xs text-white/40 mb-1">Nama</p>
                  <p className="font-medium">{leadData.name}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-700">
                  <p className="text-xs text-white/40 mb-1">Email</p>
                  <p className="font-medium">{leadData.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-700">
                  <p className="text-xs text-white/40 mb-1">Perusahaan</p>
                  <p className="font-medium">{leadData.company}</p>
                </div>
                <div className="p-4 rounded-xl bg-dark-700">
                  <p className="text-xs text-white/40 mb-1">Use Case</p>
                  <p className="font-medium">{leadData.useCase}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Lead Score</p>
                    <p className="text-2xl font-bold">{leadData.leadScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 mb-1">Intent Level</p>
                    <span className={cn("px-3 py-1 rounded-full text-sm font-medium border", getIntentColor(leadData.intent))}>
                      {leadData.intent.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Scheduling */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-bold">Jadwalkan Demo Sekarang</h2>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Pilih Tanggal</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {nextDates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={cn(
                        "flex-shrink-0 p-3 rounded-xl border text-center min-w-[70px] transition-all",
                        selectedDate === d.date
                          ? "bg-brand-500/10 border-brand-500/50"
                          : "bg-dark-700 border-white/5 hover:border-white/10"
                      )}
                    >
                      <p className="text-xs text-white/40 mb-1">{d.day}</p>
                      <p className="text-lg font-bold">{d.dayNum}</p>
                      <p className="text-xs text-white/40">{d.month}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Pilih Waktu (WIB)</p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-sm transition-all",
                          selectedTime === time
                            ? "bg-brand-500/10 border-brand-500/50 text-white"
                            : "bg-dark-700 border-white/5 text-white/70 hover:border-white/10"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo Type */}
              {selectedDate && selectedTime && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Demo yang Ingin Ditampilkan</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {DEMO_TYPES.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => setDemoType(demo.id)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          demoType === demo.id
                            ? "bg-brand-500/10 border-brand-500/50"
                            : "bg-dark-700 border-white/5 hover:border-white/10"
                        )}
                      >
                        <span className="text-2xl block mb-2">{demo.icon}</span>
                        <p className="font-medium text-sm">{demo.label}</p>
                        <p className="text-xs text-white/40">{demo.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Button */}
              {selectedDate && selectedTime && (
                <button
                  onClick={handleSchedule}
                  className="w-full btn-primary py-4 text-base"
                >
                  <Calendar className="w-5 h-5" />
                  Jadwalkan Demo {selectedDate} pukul {selectedTime}
                </button>
              )}
            </div>

            {/* Contact Options */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4">Atau Hubungi Kami Langsung</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <a href="https://wa.me/6281234567890" target="_blank" className="p-4 rounded-xl bg-dark-700 border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="font-medium text-sm mb-1">WhatsApp</p>
                  <p className="text-xs text-white/40">Chat langsung dengan sales</p>
                </a>
                <a href="tel:+622112345678" className="p-4 rounded-xl bg-dark-700 border border-white/5 hover:border-brand-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                    <Phone className="w-5 h-5 text-brand-400" />
                  </div>
                  <p className="font-medium text-sm mb-1">Telepon</p>
                  <p className="text-xs text-white/40">021-1234-5678</p>
                </a>
                <a href="mailto:sales@jatismobile.com" className="p-4 rounded-xl bg-dark-700 border border-white/5 hover:border-violet-500/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-violet-400" />
                  </div>
                  <p className="font-medium text-sm mb-1">Email</p>
                  <p className="text-xs text-white/40">sales@jatismobile.com</p>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Scheduled Confirmation */
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-brand-500/10 border border-brand-500/20 mx-auto flex items-center justify-center">
              <Calendar className="w-12 h-12 text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Demo Terjadwal! 📅</h1>
              <p className="text-white/50">
                Kami telah menerima jadwal demo Anda. Konfirmasi akan dikirim ke WhatsApp dan email.
              </p>
            </div>
            
            <div className="glass-card p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700">
                  <CalendarDays className="w-5 h-5 text-brand-400" />
                  <div className="text-left">
                    <p className="text-xs text-white/40">Tanggal</p>
                    <p className="font-medium">{new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700">
                  <Clock className="w-5 h-5 text-brand-400" />
                  <div className="text-left">
                    <p className="text-xs text-white/40">Waktu</p>
                    <p className="font-medium">{selectedTime} WIB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700">
                  <Video className="w-5 h-5 text-brand-400" />
                  <div className="text-left">
                    <p className="text-xs text-white/40">Platform</p>
                    <p className="font-medium">Google Meet / Zoom</p>
                  </div>
                </div>
                {demoType && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700">
                    <Star className="w-5 h-5 text-brand-400" />
                    <div className="text-left">
                      <p className="text-xs text-white/40">Demo</p>
                      <p className="font-medium">{DEMO_TYPES.find(d => d.id === demoType)?.label || "General Demo"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-secondary">
                <ArrowRight className="w-4 h-4 rotate-180" />Kembali ke Beranda
              </Link>
              <a href="https://wa.me/6281234567890" target="_blank" className="btn-primary">
                <MessageSquare className="w-4 h-4" />Chat Sales Sekarang
              </a>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/30">
            Dengan mendaftar, Anda menyetujui kebijakan privasi Jatis Mobile.
          </p>
          <p className="text-xs text-white/20 mt-1">
            Lead Anda akan ditindaklanjuti dalam 1x24 jam kerja.
          </p>
        </div>
      </main>
    </div>
  );
}
