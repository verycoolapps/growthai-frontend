"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Package, MessageSquare, Check, Clock, Phone, ChevronDown, X, CreditCard, Truck, CheckCircle, Cpu, Database, Zap, Globe, Bell, ShoppingCart, FileText, TruckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  message: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

// Track events
function trackDemoEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const events = JSON.parse(localStorage.getItem("ga_events") || "[]");
  events.push({
    event: eventName,
    properties: { demo: "whatsapp_chat", ...properties },
    timestamp: new Date().toISOString(),
    session_id: localStorage.getItem("session_id") || "unknown",
  });
  if (events.length > 100) events.shift();
  localStorage.setItem("ga_events", JSON.stringify(events));
  console.log("[Analytics]", eventName, properties);
}

const CATALOG = [
  { id: "p1", name: "Indomie Goreng", price: 3500, emoji: "🍜", stock: 150 },
  { id: "p2", name: "Mie Sedaap Goreng", price: 3200, emoji: "🍜", stock: 120 },
  { id: "p3", name: "Kecap ABC 135ml", price: 5800, emoji: "🍯", stock: 85 },
  { id: "p4", name: "Saus Sambal Indofood 200ml", price: 4500, emoji: "🌶️", stock: 200 },
  { id: "p5", name: "Beras Premium 5kg", price: 75000, emoji: "🍚", stock: 45 },
];

// Behind the Scenes data - shows what's happening in the system
const BEHIND_SCENES_STEPS = [
  {
    id: "menu_shown",
    icon: MessageSquare,
    color: "text-emerald-400",
    title: "WhatsApp Business API",
    description: "Pesan masuk diterima via WhatsApp Business Platform. Session dimulai dengan context dari nomor customer.",
    details: ["Webhook triggered", "Session authenticated", "Customer context loaded"],
  },
  {
    id: "catalog_sent",
    icon: Package,
    color: "text-brand-400",
    title: "Product Catalog Sync",
    description: "Katalog produk diambil dari inventory system dan diformat sesuai template WhatsApp.",
    details: ["API: GET /products", "Stock check", "Price formatting"],
  },
  {
    id: "cart_updated",
    icon: ShoppingCart,
    color: "text-violet-400",
    title: "Cart State Manager",
    description: "Item ditambahkan ke shopping cart. State di-sync dengan Redis cache.",
    details: ["Cart ID generated", "Quantity validated", "Price calculated"],
  },
  {
    id: "order_created",
    icon: FileText,
    color: "text-amber-400",
    title: "Order Management System",
    description: "Order dibuat di OMS dengan status PENDING. Integration ke ERP untuk stock deduction.",
    details: ["OMS: POST /orders", "ERP stock reservation", "Order ID generated"],
  },
  {
    id: "payment_processed",
    icon: CreditCard,
    color: "text-orange-400",
    title: "Payment Gateway",
    description: "Pembayaran divalidasi melalui payment gateway. Status: AUTHORIZED.",
    details: ["PG: validate payment", "Payment method verified", "Transaction logged"],
  },
  {
    id: "shipping_scheduled",
    icon: TruckIcon,
    color: "text-cyan-400",
    title: "Logistics Integration",
    description: "Pengiriman dijadwalkan via integration ke 3PL partner. Tracking number di-generate.",
    details: ["3PL API called", "Pickup scheduled", "ETA calculated"],
  },
  {
    id: "confirmation_sent",
    icon: CheckCircle,
    color: "text-emerald-400",
    title: "OMS → Customer",
    description: "Konfirmasi order dikirim via WhatsApp dengan detail lengkap dan estimated delivery.",
    details: ["WA Template sent", "Delivery ETA confirmed", "CRM updated"],
  },
];

const INTEGRATION_POINTS = [
  { name: "WhatsApp Business API", status: "connected", color: "emerald" },
  { name: "Product Catalog / OMS", status: "connected", color: "emerald" },
  { name: "Payment Gateway", status: "connected", color: "emerald" },
  { name: "3PL / Logistics", status: "connected", color: "emerald" },
  { name: "CRM / ERP", status: "optional", color: "amber" },
  { name: "Loyalty System", status: "optional", color: "amber" },
];

export default function WhatsAppChatDemo() {
  const [step, setStep] = useState<"menu" | "catalog" | "cart" | "address" | "payment" | "done">("menu");
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", type: "bot", message: "Halo Budi! 👋 Selamat datang di *Chat Commerce PT Indomaret*. Saya asisten pesan otomatis untuk pemesanan barang. Silakan pilih menu di bawah:", time: "09:30", status: "read" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showBehindScenes, setShowBehindScenes] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [orderNumber] = useState(`#ORD-2024-${Math.floor(Math.random() * 9000 + 1000)}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    trackDemoEvent("demo_started", { demo_page: "whatsapp_chat" });
  }, []);

  const addToCart = (productId: string) => {
    trackDemoEvent("product_added", { product_id: productId });
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) return prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: productId, qty: 1 }];
    });
    const product = CATALOG.find(p => p.id === productId);
    if (product) {
      setActiveStep(2); // Cart updated step
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        message: `✅ ${product.emoji} *${product.name}* ditambahkan ke keranjang`,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const product = CATALOG.find(p => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  const sendBotMessage = (msg: string) => {
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "bot",
        message: msg,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      }]);
      setTyping(false);
      setActiveStep(prev => Math.min(prev + 1, BEHIND_SCENES_STEPS.length - 1));
    }, 1200);
  };

  const handleMenuClick = (menu: string) => {
    trackDemoEvent("menu_clicked", { menu });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "user",
      message: menu,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }]);

    if (menu === "📦 Lihat Katalog") {
      setShowCatalog(true);
      setActiveStep(1);
      setTimeout(() => {
        setShowCatalog(false);
        sendBotMessage(`📦 *KATALOG PRODUK*\n\n${CATALOG.map((p, i) => `${i + 1}. ${p.emoji} *${p.name}*\n   Rp ${p.price.toLocaleString("id-ID")} | Stok: ${p.stock}`).join("\n\n")}\n\nKetik *PESAN* untuk mulai order atau klik produk untuk menambahkan ke keranjang.`);
        setStep("catalog");
      }, 500);
    } else if (menu === "🛒 Lihat Keranjang") {
      if (cart.length === 0) {
        sendBotMessage("Keranjang Anda kosong. Ketik *KATALOG* untuk melihat produk.");
      } else {
        const cartItems = cart.map((item, i) => {
          const p = CATALOG.find(x => x.id === item.id);
          return `${i + 1}. ${p?.emoji} ${p?.name} x${item.qty} = Rp ${((p?.price || 0) * item.qty).toLocaleString("id-ID")}`;
        }).join("\n");
        sendBotMessage(`🛒 *KERANJANG ANDA*\n\n${cartItems}\n\n*Total: Rp ${cartTotal.toLocaleString("id-ID")}*\n\nKetik *CHECKOUT* untuk lanjut ke pembayaran.`);
      }
    } else if (menu === "📍 Lacak Pesanan") {
      setActiveStep(5);
      sendBotMessage("📦 *STATUS PESANAN*\n\nPesanan #ORD-2024-0831:\n\n✅ 09:30 - Pesanan diterima\n📦 09:45 - Sedang dikemas\n🚚 10:15 - Dalam perjalanan\n📍 Est. sampai: 11:00\n\nApakah ada yang bisa saya bantu lagi?");
    } else if (menu === "❓ FAQ") {
      sendBotMessage("❓ *FAQ*\n\n1. *Cara pesan?* → Ketik KATALOG, pilih produk, ketik CHECKOUT\n2. *Metode pembayaran?* → Transfer BCA, Mandiri, GoPay, OVO\n3. *Ongkir?* → Gratis untuk pembelian Rp 100rb+\n4. *Komplain?* → Hubungi 1500-123\n\nAda yang ingin ditanyakan?");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    trackDemoEvent("checkout_started", { cart_count: cart.length, total: cartTotal });
    setActiveStep(3);
    const cartItems = cart.map((item, i) => {
      const p = CATALOG.find(x => x.id === item.id);
      return `${i + 1}. ${p?.emoji} ${p?.name} x${item.qty} = *Rp ${((p?.price || 0) * item.qty).toLocaleString("id-ID")}*`;
    }).join("\n");
    sendBotMessage(`✅ *PESANAN DITERIMA*\n\n${cartItems}\n\n*Total: Rp ${cartTotal.toLocaleString("id-ID")}*\n\nKetik *BAYAR* untuk lanjut ke pembayaran.`);
    setStep("payment");
  };

  const handlePayment = () => {
    trackDemoEvent("payment_selected", { payment_method: "transfer" });
    setActiveStep(4);
    sendBotMessage(`💳 *PEMBAYARAN*\n\nTotal yang harus dibayar: *Rp ${cartTotal.toLocaleString("id-ID")}*\n\nSilakan transfer ke rekening berikut:\n\n*BCA 123-456-789 a.n. PT Indomaret*\n\nKonfirmasi dengan ketik *SUDAH TRANSFER*`);
  };

  const handleDone = () => {
    trackDemoEvent("order_completed", { order_id: orderNumber, total: cartTotal });
    setActiveStep(6);
    sendBotMessage(`🎉 *PESANAN BERHASIL*\n\nTerima kasih! Pesanan Anda akan diproses.\n\n📦 *Detail Pesanan*\n• No. Pesanan: ${orderNumber}\n• Total: Rp ${cartTotal.toLocaleString("id-ID")}\n• Estimasi pengiriman: 45 menit\n\nTerima kasih! 🙏`);
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-dark-800 border-b border-white/5">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-lg">🏪</div>
                <div>
                  <p className="font-semibold text-sm">Indomaret Chat Commerce</p>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                    Online • Demo Chat Commerce
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBehindScenes(!showBehindScenes)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border", showBehindScenes ? "bg-brand-500/10 text-brand-400 border-brand-500/20" : "bg-white/5 text-white/60 border-white/10")}
              >
                <Cpu className="w-3.5 h-3.5 inline mr-1" />
                Behind the Scenes
              </button>
            </div>
          </div>
        </header>

        {/* Chat */}
        <main className="flex-1 max-w-lg mx-auto pb-32 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Menu Buttons */}
            {step === "menu" && (
              <div className="mb-4">
                <p className="text-xs text-white/40 mb-2">Coba klik tombol di bawah:</p>
                <div className="flex flex-wrap gap-2">
                  {["📦 Lihat Katalog", "🛒 Lihat Keranjang", "📍 Lacak Pesanan", "❓ FAQ"].map(m => (
                    <button key={m} onClick={() => handleMenuClick(m)}
                      className="px-3 py-2 rounded-lg bg-dark-700 text-sm font-medium text-white/80 hover:bg-dark-600 border border-white/5 transition-all">
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order Flow */}
            {step === "catalog" && (
              <div className="mb-4">
                <div className="p-3 rounded-xl bg-dark-700 border border-white/5 mb-3">
                  <p className="text-xs text-white/40 mb-2">📦 Katalog Produk — klik untuk menambahkan</p>
                  <div className="space-y-2">
                    {CATALOG.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-dark-800">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{p.emoji}</span>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-emerald-400">Rp {p.price.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <button onClick={() => addToCart(p.id)} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 border border-emerald-500/20">
                          + Tambah
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleMenuClick("🛒 Lihat Keranjang")} className="flex-1 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm">
                    🛒 Lihat Keranjang ({cart.length})
                  </button>
                  {cart.length > 0 && (
                    <button onClick={handleCheckout} className="flex-1 py-2 rounded-lg bg-brand-500 text-white font-semibold text-sm">
                      CHECKOUT →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cart Summary */}
            {cart.length > 0 && step !== "menu" && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <p className="text-xs text-emerald-400 mb-1">🛒 Keranjang ({cart.length} item)</p>
                <p className="text-sm text-white font-semibold">Total: Rp {cartTotal.toLocaleString("id-ID")}</p>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div className="mb-4">
                <button onClick={handlePayment} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm">
                  💳 Konfirmasi Pembayaran
                </button>
                <button onClick={handleDone} className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm mt-2">
                  ✅ Saya Sudah Bayar
                </button>
              </div>
            )}

            {/* Done */}
            {step === "done" && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-emerald-400">Pesanan Berhasil!</p>
                <p className="text-sm text-white/60">Pesanan Anda sedang diproses</p>
                <p className="text-xs text-white/40 mt-1">No. Pesanan: {orderNumber}</p>
              </div>
            )}

            {/* Messages */}
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-2", msg.type === "user" && "flex-row-reverse")}>
                {msg.type === "bot" && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 text-sm">🏪</div>}
                {msg.type === "user" && <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-sm font-bold">B</div>}
                <div className={cn("max-w-[75%]", msg.type === "user" && "items-end")}>
                  <div className={cn("p-3 rounded-2xl text-sm whitespace-pre-line", msg.type === "bot" ? "bg-dark-700 rounded-tl-sm" : "bg-brand-500 rounded-tr-sm")}>
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-white/30">
                    <span>{msg.time}</span>
                    {msg.type === "user" && <span>{msg.status === "read" ? "✓✓" : msg.status === "delivered" ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 text-sm">🏪</div>
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
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-700 border border-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              <button className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center hover:bg-brand-400 transition-colors">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-white/30 mt-2 text-center">Demo Chat Commerce • Tidak ada data nyata</p>
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
            <p className="text-xs text-white/40">Apa yang terjadi di sistem Jatis Mobile</p>
          </div>

          {/* Integration Points */}
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">Integration Points</p>
            <div className="grid grid-cols-2 gap-2">
              {INTEGRATION_POINTS.map((int, i) => (
                <div key={i} className={cn("p-2 rounded-lg border text-xs", int.color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20")}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={cn("w-1.5 h-1.5 rounded-full", int.color === "emerald" ? "bg-emerald-400" : "bg-amber-400")} />
                    <span className="font-medium text-white/80">{int.status === "connected" ? "🟢" : "🟡"}</span>
                  </div>
                  <p className="text-white/60">{int.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Step */}
          <div className="p-4">
            <p className="text-xs text-white/40 mb-3 font-medium">System Activity</p>
            <div className="space-y-2">
              {BEHIND_SCENES_STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === activeStep;
                const isPast = i < activeStep;
                return (
                  <div key={s.id} className={cn("p-3 rounded-xl border transition-all", isActive ? "bg-brand-500/10 border-brand-500/30" : isPast ? "bg-white/[0.02] border-white/5" : "bg-white/[0.02] border-white/5 opacity-50")}>
                    <div className="flex items-start gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isActive ? "bg-brand-500/20" : isPast ? "bg-emerald-500/10" : "bg-dark-700")}>
                        <Icon className={cn("w-4 h-4", s.color, !isActive && !isPast && "opacity-30")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isActive ? "text-brand-400" : isPast ? "text-white/80" : "text-white/40")}>{s.title}</p>
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{s.description}</p>
                        {isActive && (
                          <div className="mt-2 space-y-1">
                            {s.details.map((d, j) => (
                              <div key={j} className="flex items-center gap-1.5 text-xs text-white/50">
                                <Check className="w-3 h-3 text-brand-400" />
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

          {/* Jatis Services */}
          <div className="p-4 border-t border-white/5">
            <p className="text-xs text-white/40 mb-3 font-medium">Layanan Jatis Mobile</p>
            <div className="space-y-2">
              {["WhatsApp Business Platform", "Chat Commerce API", "OMS Integration", "Payment Gateway", "3PL Integration"].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                  <Zap className="w-3 h-3 text-brand-400" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
