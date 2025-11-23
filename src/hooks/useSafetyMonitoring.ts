import { useState, useEffect, useCallback, useRef } from "react";
import { VoiceCommandDetector } from "@/utils/VoiceCommandDetector";
import { MotionDetector } from "@/utils/MotionDetector";
import { LocationTracker, LocationData } from "@/utils/LocationTracker";
import { useToast } from "@/hooks/use-toast";

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

  const voiceDetector = useRef<VoiceCommandDetector | null>(null);
  const motionDetector = useRef<MotionDetector | null>(null);
  const locationTracker = useRef<LocationTracker | null>(null);
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

  const handleVoiceCommand = useCallback(() => {
    console.log("Voice command detected - triggering SOS");
    toast({
      title: "Voice Command Detected",
      description: "SOS alert triggered by voice command",
      variant: "destructive",
    });
    triggerSOS();
  }, [toast]);

  const startMonitoring = async () => {
    try {
      // Start location tracking
      if (!locationTracker.current) {
        locationTracker.current = new LocationTracker(handleLocationUpdate);
      }
      await locationTracker.current.start();

      // Start motion detection
      if (!motionDetector.current) {
        motionDetector.current = new MotionDetector(handleShake);
      }
      motionDetector.current.start();

      // Start voice command detection
      if (!voiceDetector.current) {
        voiceDetector.current = new VoiceCommandDetector(handleVoiceCommand);
      }
      voiceDetector.current.start();

      setState(prev => ({
        ...prev,
        status: "monitoring",
        aiMonitoring: true,
        micActive: true,
      }));

      toast({
        title: "Safety Monitoring Active",
        description: "Voice commands, GPS, and motion detection enabled",
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
    locationTracker.current?.stop();
    motionDetector.current?.stop();
    voiceDetector.current?.stop();
    
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
    if (sosSending.current) { console.log('SOS send already in progress'); return; }
    sosSending.current = true;
    setState(prev => ({ ...prev, status: "distress" }));

    try {
      let location = state.lastLocation;

      if (!location && locationTracker.current) {
        try {
          location = await locationTracker.current.getCurrentLocation();
        } catch (e) {
          console.warn("SOS: location unavailable, continuing without GPS");
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms-alert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: location?.lat ?? null,
            longitude: location?.lng ?? null,
            distressLevel: state.distressConfidence > 0.5 ? "HIGH" : "MEDIUM",
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "🚨 SOS Alert Sent!",
          description: `Real SMS sent to +91 7000079879`,
          variant: "destructive",
        });
        console.log("SMS sent successfully:", result);
      } else {
        throw new Error(result.error || "Failed to send SMS");
      }
     } catch (error) {
      console.error("Error sending SOS:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SOS alert",
        variant: "destructive",
      });
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
