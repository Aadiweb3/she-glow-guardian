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
    const { latitude, longitude, distressLevel, contacts } = await req.json();
    
    console.log('Received SOS alert request:', { 
      latitude, 
      longitude, 
      distressLevel,
      contactCount: contacts?.length 
    });

    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioSid || !twilioToken || !twilioPhone) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!contacts || contacts.length === 0) {
      console.error('No emergency contacts provided');
      return new Response(
        JSON.stringify({ error: 'No emergency contacts configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const hasCoords = typeof latitude === "number" && typeof longitude === "number" && isFinite(latitude) && isFinite(longitude);
    const locationLine = hasCoords
      ? `Location: https://maps.google.com?q=${latitude},${longitude}`
      : "Location: unavailable";

    const message = `🚨 SOS ALERT from S.H.E. Safety App

Distress: ${distressLevel || "HIGH"}
Time: ${new Date().toLocaleString()}
${locationLine}

Please call or contact emergency services now.`;

    // Send SMS to all emergency contacts
    const results = [];
    for (const contact of contacts) {
      const toNumber = String(contact.phone_number).replace(/\s+/g, '');
      console.log('Sending SMS to:', { name: contact.name, phone: toNumber });
      
      try {
        const authHeader = btoa(`${twilioSid}:${twilioToken}`);
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: toNumber,
            From: twilioPhone,
            Body: message,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          const code = (data && (data.code || data.error_code)) ?? undefined;
          let friendly = data?.message || 'Failed to send SMS';
          if (code === 21608) friendly = `Trial account: verify ${toNumber} in Twilio or upgrade to send to unverified numbers.`;
          if (code === 21211 || code === 21614) friendly = `Invalid 'To' number. Use E.164 format like +919876543210.`;
          if (code === 21610) friendly = `Recipient has blocked messages (STOP). Ask them to send START to your Twilio number.`;
          if (code === 21606) friendly = `Your Twilio number is not SMS-enabled. Use an SMS-capable number.`;
          console.error(`Twilio API error for ${contact.name}:`, { code, data });
          results.push({ contact: contact.name, success: false, error: friendly, code });
        } else {
          console.log(`SMS sent successfully to ${contact.name}:`, data.sid);
          results.push({ contact: contact.name, success: true, sid: data.sid });
        }
      } catch (error) {
        console.error(`Error sending to ${contact.name}:`, error);
        results.push({ contact: contact.name, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: successCount > 0, 
        results,
        summary: `Sent to ${successCount} of ${contacts.length} contacts`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
