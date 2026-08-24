import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GrowthAI | Jatis FMCG DemoHub - Try Before You Talk to Sales",
  description: "Interactive Demo Hub for C-Level FMCG decision-makers. Experience WhatsApp Business, AI Chatbot, RoboCall, and Enterprise Messaging — no sales call required.",
  keywords: ["FMCG", "WhatsApp Business", "Enterprise Messaging", "AI Chatbot", "Jatis Mobile", "Demo Hub"],
  authors: [{ name: "Jatis Mobile" }],
  openGraph: {
    title: "GrowthAI | Jatis FMCG DemoHub",
    description: "Interactive Demo Hub for C-Level FMCG decision-makers",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
