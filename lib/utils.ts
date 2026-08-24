import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  const visible = phone.slice(-4);
  const masked = "*".repeat(phone.length - 6);
  const prefix = phone.slice(0, 2);
  return `${prefix}${masked}${visible}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(dateStr);
}

export const USE_CASE_LABELS: Record<string, string> = {
  consumer_engagement: "Consumer Engagement",
  distributor_operations: "Distributor Operations",
  customer_service: "Customer Service",
  trade_promotion: "Trade Promotion",
  order_management: "Order Management",
  payment_collection: "Payment Collection",
  loyalty_program: "Loyalty Program",
  other: "Other",
};

export const VOLUME_LABELS: Record<string, string> = {
  "1k_10k": "1K - 10K/bulan",
  "10k_50k": "10K - 50K/bulan",
  "50k_100k": "50K - 100K/bulan",
  "100k_500k": "100K - 500K/bulan",
  "500k_plus": "500K+/bulan",
  not_sure: "Belum pasti",
};

export const FOLLOWUP_LABELS: Record<string, string> = {
  schedule_demo: "Jadwalkan Demo dengan Sales",
  free_trial: "Akses Free Trial Sandbox",
  sales_call: "Hubungi Sales untuk Konsultasi",
  documentation: "Kirim Dokumentasi Produk",
  pricing_quote: "Minta Penawaran Harga",
};
