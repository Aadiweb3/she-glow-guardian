import { useState, useEffect, useCallback, useRef } from "react";
import { AudioRecorder, analyzeAudioForDistress } from "@/utils/AudioRecorder";
import { MotionDetector } from "@/utils/MotionDetector";
import { LocationTracker, LocationData } from "@/utils/LocationTracker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type SafetyStatus = "safe" | "monitoring" | "distress";

interface SafetyState {
  status: SafetyStatus;
  gpsActive: boolean;
  micActive: boolean;
  aiMonitoring: boolean;
  lastLocation: LocationData | null;
  distressConfidence: number;
}

export const useSafetyMonitoring = () => {
  const { toast } = useToast();
  const [state, setState] = useState<SafetyState>({
    status: "safe",
    gpsActive: false,
    micActive: false,
    aiMonitoring: false,
    lastLocation: null,
    distressConfidence: 0,
  });

  const audioRecorder = useRef<AudioRecorder | null>(null);
  const motionDetector = useRef<MotionDetector | null>(null);
  const locationTracker = useRef<LocationTracker | null>(null);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);
  const sosSending = useRef(false);

  const handleShake = useCallback(() => {
    console.log("Shake detected - triggering SOS");
    toast({
      title: "Shake Detected",
      description: "SOS alert triggered by shake gesture",
      variant: "destructive",
    });
    triggerSOS();
  }, [toast]);

  const handleLocationUpdate = useCallback((location: LocationData) => {
    setState(prev => ({
      ...prev,
      lastLocation: location,
      gpsActive: true,
    }));
  }, []);

  const startMonitoring = async () => {
    try {
      // Start location tracking - don't fail if location unavailable
      if (!locationTracker.current) {
        locationTracker.current = new LocationTracker(handleLocationUpdate);
      }
      
      try {
        await locationTracker.current.start();
        toast({
          title: "Location Access Granted",
          description: "GPS tracking is active",
        });
      } catch (locError) {
        console.warn("Location tracking unavailable:", locError);
        toast({
          title: "Location Access Limited",
          description: "SOS will work without GPS location. Please enable location permissions for better safety.",
          variant: "destructive",
        });
      }

      // Start motion detection
      if (!motionDetector.current) {
        motionDetector.current = new MotionDetector(handleShake);
      }
      motionDetector.current.start();

      // Start audio monitoring
      if (!audioRecorder.current) {
        audioRecorder.current = new AudioRecorder();
      }

      setState(prev => ({
        ...prev,
        status: "monitoring",
        aiMonitoring: true,
      }));

      // Periodic audio analysis (every 60 seconds to avoid rate limits)
      monitoringInterval.current = setInterval(async () => {
        try {
          if (audioRecorder.current && !audioRecorder.current.isRecording()) {
            await audioRecorder.current.start();
            
            // Record for 3 seconds
            setTimeout(async () => {
              if (audioRecorder.current) {
                const audioBlob = await audioRecorder.current.stop();
                
                // Analyze audio with better error handling
                try {
                  const analysis = await analyzeAudioForDistress(audioBlob, {
                    location: state.lastLocation,
                    timestamp: Date.now(),
                  });

                  setState(prev => ({
                    ...prev,
                    distressConfidence: analysis.confidence,
                    micActive: true,
                  }));

                  if (analysis.distress_detected && analysis.confidence > 0.7) {
                    console.log("Distress detected:", analysis);
                    triggerSOS();
                  }
                } catch (error: any) {
                  // Handle rate limit errors gracefully
                  if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                    console.log("Rate limit reached, will retry in next cycle");
                    toast({
                      title: "AI Monitoring Paused",
                      description: "Rate limit reached. Monitoring continues with GPS and motion.",
                    });
                  } else {
                    console.error("Error analyzing audio:", error);
                  }
                }
              }
            }, 3000);
          }
        } catch (error) {
          console.error("Error in audio monitoring:", error);
        }
      }, 60000);

      toast({
        title: "Safety Monitoring Active",
        description: "AI is now monitoring for distress signals",
      });
    } catch (error) {
      console.error("Error starting monitoring:", error);
      toast({
        title: "Error",
        description: "Failed to start safety monitoring",
        variant: "destructive",
      });
    }
  };

  const stopMonitoring = () => {
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
    }
    
    locationTracker.current?.stop();
    motionDetector.current?.stop();
    
    setState(prev => ({
      ...prev,
      status: "safe",
      aiMonitoring: false,
      micActive: false,
    }));

    toast({
      title: "Monitoring Stopped",
      description: "Safety monitoring has been disabled",
    });
  };

  const triggerSOS = async () => {
    console.log("🚨 SOS TRIGGERED!");
    
    // Prevent multiple SOS triggers
    if (sosSending.current) {
      console.log("SOS already being sent, skipping...");
      return;
    }
    
    sosSending.current = true;
    
    setState(prev => ({
      ...prev,
      status: 'distress'
    }));

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user for SOS");
        return;
      }

      // Fetch emergency contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id);

      if (contactsError) {
        console.error("Failed to fetch emergency contacts:", contactsError);
        toast({
          title: "Error",
          description: "Failed to fetch emergency contacts",
          variant: "destructive",
        });
        return;
      }

      if (!contacts || contacts.length === 0) {
        console.error("No emergency contacts configured");
        toast({
          title: "No Contacts",
          description: "Please add emergency contacts first",
          variant: "destructive",
        });
        return;
      }

      // Get current location - try multiple methods
      let location = state.lastLocation;
      
      // First try to get fresh location
      try {
        if (!locationTracker.current) {
          locationTracker.current = new LocationTracker(handleLocationUpdate);
        }
        location = await locationTracker.current.getCurrentLocation();
        setState(prev => ({ ...prev, lastLocation: location }));
        console.log("Got current location for SOS:", location);
      } catch (error) {
        console.warn("Could not get fresh location, using last known:", error);
        // Try one more time with a longer timeout
        try {
          location = await new Promise<LocationData>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                });
              },
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          });
          console.log("Got location on retry:", location);
        } catch (retryError) {
          console.error("Location unavailable after retry:", retryError);
        }
      }

      // If still no location, wait up to 12s for a fix
      if (!location?.lat || !location?.lng) {
        try {
          location = await new Promise<LocationData>((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Location timeout')), 12000);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                clearTimeout(timer);
                resolve({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                });
              },
              (err) => {
                clearTimeout(timer);
                reject(err);
              },
              {
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 5000,
              }
            );
          });
          console.log("Got location after wait:", location);
          setState(prev => ({ ...prev, lastLocation: location }));
        } catch (waitErr) {
          console.warn("Still no location fix after waiting:", waitErr);
        }
      }

      // Send SMS alert via Supabase Edge Function
      console.log("Sending SOS with location:", location);
      const { data, error } = await supabase.functions.invoke('send-sms-alert', {
        body: {
          latitude: location?.lat || null,
          longitude: location?.lng || null,
          distressLevel: 'HIGH',
          contacts: contacts,
        },
      });

      if (error) {
        console.error("Failed to send SOS alert:", error);
        toast({
          title: "SOS Failed",
          description: "We couldn't send your alert. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("SOS alert sent response:", data);
        const results = (data as any)?.results || [];
        const successCount = results.filter((r: any) => r.success).length;
        const firstFailure = results.find((r: any) => !r.success);
        toast({
          title: successCount > 0 ? "🚨 SOS Alert Sent" : "SOS Not Sent",
          description: firstFailure
            ? `Sent to ${successCount}/${contacts.length}. Issue: ${firstFailure.error}`
            : `Sent to ${successCount}/${contacts.length} contact(s)`,
          variant: successCount > 0 ? "destructive" : "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending SOS:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SOS",
        variant: "destructive",
      });
    } finally {
      sosSending.current = false;
    }
  };

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    state,
    startMonitoring,
    stopMonitoring,
    triggerSOS,
  };
};
