import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (when Supabase is not configured)
const demoLeads: Array<{
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  company: string;
  position: string;
  use_case: string;
  volume_range: string;
  follow_up_pref: string;
  lead_score: number;
  intent: string;
  status: string;
  disposition: string;
  consent_given: boolean;
  otp_verified: boolean;
  traffic_source: string;
  created_at: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, company, position, useCase, volumeRange, followUpPref, consentGiven } = body;

    // Validation
    if (!name || !email || !whatsapp || !company || !position) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate lead score
    let leadScore = 50;
    if (volumeRange === "500k_plus") leadScore += 30;
    else if (volumeRange === "100k_500k") leadScore += 25;
    else if (volumeRange === "50k_100k") leadScore += 20;
    else if (volumeRange === "10k_50k") leadScore += 15;

    const posLower = position.toLowerCase();
    if (["ceo", "cfo", "cmo", "director", "head"].some(t => posLower.includes(t))) {
      leadScore += 20;
    } else if (["manager", "supervisor"].some(t => posLower.includes(t))) {
      leadScore += 10;
    }

    let intent = "medium";
    if (leadScore >= 70) intent = "high";
    else if (leadScore < 40) intent = "low";

    // Try Supabase first, fallback to in-memory
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
          .from("leads")
          .insert({
            name,
            email,
            whatsapp,
            position,
            company,
            use_case: useCase || "other",
            volume_range: volumeRange || "not_sure",
            follow_up_pref: followUpPref || "schedule_demo",
            lead_score: leadScore,
            intent,
            status: "new",
            disposition: "pending",
            consent_given: consentGiven || false,
            otp_verified: false,
            traffic_source: "direct",
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase error:", error);
          // Fallback to demo storage
          throw new Error("Supabase not configured, using demo storage");
        }

        return NextResponse.json({
          success: true,
          leadId: data?.id || `demo-${Date.now()}`,
          score: leadScore,
          intent,
          storage: "supabase",
        });
      } catch (supabaseError) {
        console.log("Supabase not available, using demo storage");
      }
    }

    // Demo storage (in-memory fallback)
    const demoId = `demo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newLead = {
      id: demoId,
      name,
      email,
      whatsapp,
      company,
      position,
      use_case: useCase || "other",
      volume_range: volumeRange || "not_sure",
      follow_up_pref: followUpPref || "schedule_demo",
      lead_score: leadScore,
      intent,
      status: "new",
      disposition: "pending",
      consent_given: consentGiven || false,
      otp_verified: false,
      traffic_source: "direct",
      created_at: new Date().toISOString(),
    };

    demoLeads.push(newLead);

    console.log("Demo lead saved:", newLead);

    return NextResponse.json({
      success: true,
      leadId: demoId,
      score: leadScore,
      intent,
      storage: "demo",
      message: "Lead saved successfully (demo mode)",
    });

  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save lead", error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return demo leads for testing
  return NextResponse.json({
    success: true,
    leads: demoLeads,
    count: demoLeads.length,
    storage: "demo",
  });
}
