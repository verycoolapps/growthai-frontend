import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Lead = {
  id: string
  name: string
  position: string
  company: string
  email: string
  whatsapp: string
  use_case: string
  volume_range: string
  follow_up_pref: string
  demo_history: string[]
  lead_score: number
  intent: string
  status: string
  disposition: string
  otp_verified: boolean
  consent_given: boolean
  traffic_source: string
  created_at: string
}

export type LeadStats = {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  avgLeadScore: number
  demoCompletions: number
  otpVerificationRate: number
}

export async function getLeadStats(): Promise<LeadStats> {
  try {
    const res = await fetch('/api/leads/stats')
    if (!res.ok) throw new Error('Failed to fetch stats')
    const data = await res.json()
    return data.stats || {
      totalLeads: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      avgLeadScore: 0,
      demoCompletions: 0,
      otpVerificationRate: 0
    }
  } catch {
    return {
      totalLeads: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      avgLeadScore: 0,
      demoCompletions: 0,
      otpVerificationRate: 0
    }
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch('/api/leads')
    if (!res.ok) throw new Error('Failed to fetch leads')
    const data = await res.json()
    return data.leads || []
  } catch {
    return []
  }
}
