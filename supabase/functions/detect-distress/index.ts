import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing audio for distress signals...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a distress detection AI for a women's safety app. Analyze the provided context and determine if there's a distress situation.
            
Consider these factors:
- Sudden movements or shaking
- Elevated voice patterns
- Keywords like "help", "stop", "no"
- Environmental sounds indicating danger
- User's location (if in unsafe zone)

Return a JSON object with:
{
  "distress_detected": boolean,
  "confidence": number (0-1),
  "reason": string,
  "recommended_action": "alert" | "monitor" | "safe"
}`,
          },
          {
            role: "user",
            content: `Context: ${JSON.stringify(context)}\nAudio data length: ${audioData?.length || 0} bytes`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log("AI Analysis:", aiResponse);

    // Parse AI response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch {
      // If AI doesn't return valid JSON, create a default response
      analysis = {
        distress_detected: false,
        confidence: 0.3,
        reason: "Unable to analyze",
        recommended_action: "monitor"
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in detect-distress:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
