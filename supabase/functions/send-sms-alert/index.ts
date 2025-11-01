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
    const { latitude, longitude, distressLevel } = await req.json();

    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");
    const emergencyContact = "+917000079879";

    if (!twilioSid || !twilioToken || !twilioPhone) {
      throw new Error("Twilio credentials not configured");
    }

    const hasCoords = typeof latitude === "number" && typeof longitude === "number" && isFinite(latitude) && isFinite(longitude);
    const locationLine = hasCoords
      ? `Location: https://maps.google.com?q=${latitude},${longitude}`
      : "Location: unavailable";

    const message = `HELP! SOS from SHE Safety App.

Distress: ${distressLevel || "HIGH"}
Time: ${new Date().toLocaleString()}
${locationLine}

Please call or contact emergency services now.`;

    console.log("Sending SMS to:", emergencyContact);
    console.log("Message:", message);

    // Send SMS using Twilio API
    const authHeader = btoa(`${twilioSid}:${twilioToken}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: emergencyContact,
        From: twilioPhone,
        Body: message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio API error:", result);
      throw new Error(result.message || "Failed to send SMS");
    }

    console.log("SMS sent successfully:", result.sid);

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: result.sid,
        status: result.status,
        to: emergencyContact,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-sms-alert:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
