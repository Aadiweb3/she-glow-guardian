export class VoiceCommandDetector {
  private recognition: any = null;
  private onCommandDetected: () => void;
  private isListening: boolean = false;

  constructor(onCommandDetected: () => void) {
    this.onCommandDetected = onCommandDetected;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase().trim();
      
      console.log("Voice detected:", transcript);

      // Check for distress keywords
      if (transcript.includes('help') || 
          transcript.includes('leave') || 
          transcript.includes('stop')) {
        console.log("🚨 Distress keyword detected:", transcript);
        this.onCommandDetected();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        if (this.isListening) {
          setTimeout(() => this.start(), 1000);
        }
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        console.log("Restarting voice recognition...");
        setTimeout(() => this.start(), 500);
      }
    };
  }

  start() {
    if (!this.recognition) {
      console.warn("Speech Recognition not available");
      return;
    }

    try {
      this.isListening = true;
      this.recognition.start();
      console.log("Voice command detection started");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  }

  stop() {
    if (this.recognition) {
      this.isListening = false;
      try {
        this.recognition.stop();
        console.log("Voice command detection stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
  }

  isActive(): boolean {
    return this.isListening;
  }
}
