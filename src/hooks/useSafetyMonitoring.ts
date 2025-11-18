import { useState, useEffect, useCallback, useRef } from "react";
import { AudioRecorder } from "@/utils/AudioRecorder";
import { CNNModelLoader } from "@/utils/CNNModelLoader";
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
      // Load CNN model first
      if (!CNNModelLoader.isModelLoaded()) {
        console.log("Loading CNN distress detection model...");
        toast({
          title: "Initializing AI",
          description: "Loading distress detection model...",
        });
        
        try {
          await CNNModelLoader.loadModel();
          console.log("CNN model loaded and ready");
          toast({
            title: "AI Ready",
            description: "Distress detection model loaded successfully",
          });
        } catch (error) {
          console.error("Failed to load CNN model:", error);
          toast({
            title: "Model Load Failed",
            description: "Continuing with GPS and motion detection only",
            variant: "destructive",
          });
        }
      }

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
        aiMonitoring: CNNModelLoader.isModelLoaded(),
      }));

      // Periodic audio analysis (every 10 seconds for real-time CNN inference)
      monitoringInterval.current = setInterval(async () => {
        try {
          if (audioRecorder.current && !audioRecorder.current.isRecording() && CNNModelLoader.isModelLoaded()) {
            await audioRecorder.current.start();
            
            // Record for 1 second (matching CNN training)
            setTimeout(async () => {
              if (audioRecorder.current) {
                const audioBlob = await audioRecorder.current.stop();
                
                // Analyze audio using CNN model
                try {
                  const analysis = await CNNModelLoader.predict(audioBlob);

                  console.log("CNN Analysis:", {
                    distress_detected: analysis.distress_detected,
                    confidence: analysis.confidence,
                    prob_distress: analysis.prob_distress,
                    prob_safe: analysis.prob_safe,
                    action: analysis.recommended_action
                  });

                  setState(prev => ({
                    ...prev,
                    distressConfidence: analysis.prob_distress,
                    micActive: true,
                  }));

                  if (analysis.distress_detected && analysis.prob_distress > 0.7) {
                    console.log("High confidence distress detected:", analysis);
                    toast({
                      title: "Distress Detected",
                      description: `Confidence: ${(analysis.prob_distress * 100).toFixed(1)}%`,
                      variant: "destructive",
                    });
                    triggerSOS();
                  } else if (analysis.recommended_action === "monitor") {
                    console.log("Moderate distress signal - monitoring closely");
                  }
                } catch (error: any) {
                  console.error("CNN inference error:", error);
                  toast({
                    title: "Analysis Error",
                    description: "Audio analysis temporarily unavailable",
                  });
                }
              }
            }, 1000); // 1 second recording for CNN
          }
        } catch (error) {
          console.error("Error in audio monitoring:", error);
        }
      }, 10000); // Analyze every 10 seconds

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
