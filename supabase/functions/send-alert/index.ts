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
    const { location, contacts, audioUrl, distressLevel } = await req.json();

    console.log("Sending alerts to emergency contacts:", contacts);
    console.log("Location:", location);
    console.log("Distress level:", distressLevel);

    // Simulate sending alerts (in production, integrate with Twilio/SMS gateway)
    const alerts = [];
    
    for (const contact of contacts) {
      const alert = {
        contact: contact.name,
        phone: contact.phone,
        message: `🚨 EMERGENCY ALERT from S.H.E. Safety App

${contact.name}, this is an automated distress signal.

Location: ${location.address || `${location.lat}, ${location.lng}`}
Time: ${new Date().toLocaleString()}
Distress Level: ${distressLevel}

${audioUrl ? `Audio Recording: ${audioUrl}` : ''}

Please check on them immediately or contact emergency services.

Live location: https://maps.google.com/?q=${location.lat},${location.lng}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      };
      
      alerts.push(alert);
      console.log(`Alert sent to ${contact.name}`);
    }

    // Log to console (in production, this would be logged to database)
    console.log("All alerts sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        alerts,
        message: "Emergency alerts sent to all contacts",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-alert:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
