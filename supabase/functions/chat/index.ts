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
    const { messages, command } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request...");

    // Handle voice commands
    if (command) {
      const commandResponse = await handleCommand(command);
      return new Response(
        JSON.stringify({ 
          response: commandResponse.message,
          action: commandResponse.action 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
            content: `You are SARA (Safety Assistant Response AI), a compassionate AI companion for the S.H.E. women's safety app. 
            
Your role is to:
- Provide emotional support and reassurance
- Help users navigate safety features
- Respond to commands like "share location", "call police", "record environment"
- Assess situations and provide safety recommendations
- Be empathetic, quick, and action-oriented

Available commands you can trigger:
- SHARE_LOCATION: Share user's live location with emergency contacts
- CALL_POLICE: Connect to emergency services
- RECORD_AUDIO: Start recording environment
- ACTIVATE_SOS: Trigger emergency alert
- CHECK_SAFETY: Assess current location safety score

Always be brief, supportive, and ready to act.`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleCommand(command: string) {
  const lowerCommand = command.toLowerCase();
  
  if (lowerCommand.includes("share") && lowerCommand.includes("location")) {
    return {
      message: "I'm sharing your live location with your emergency contacts now.",
      action: "SHARE_LOCATION"
    };
  }
  
  if (lowerCommand.includes("call") && lowerCommand.includes("police")) {
    return {
      message: "Connecting you to emergency services immediately.",
      action: "CALL_POLICE"
    };
  }
  
  if (lowerCommand.includes("record")) {
    return {
      message: "Starting environment recording. Audio will be saved securely.",
      action: "RECORD_AUDIO"
    };
  }
  
  if (lowerCommand.includes("help") || lowerCommand.includes("sos")) {
    return {
      message: "Activating SOS mode and alerting your emergency contacts.",
      action: "ACTIVATE_SOS"
    };
  }
  
  return {
    message: "I'm here to help. You can ask me to share your location, call police, or record your environment.",
    action: null
  };
}
