import { useState, useEffect, useCallback, useRef } from "react";
import { AudioRecorder, analyzeAudioForDistress } from "@/utils/AudioRecorder";
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

  const audioRecorder = useRef<AudioRecorder | null>(null);
  const motionDetector = useRef<MotionDetector | null>(null);
  const locationTracker = useRef<LocationTracker | null>(null);
  const monitoringInterval = useRef<NodeJS.Timeout | null>(null);

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
