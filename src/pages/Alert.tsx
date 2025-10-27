import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, Mic as MicIcon, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Alert = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Pulsing border animation */}
      <div className="absolute inset-0 border-8 border-sos animate-pulse pointer-events-none"></div>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-sos/20 via-transparent to-transparent animate-pulse"></div>

      <div className="min-h-screen p-6 flex flex-col items-center justify-center relative z-10">
        <div className="max-w-md w-full">
          {/* Cancel Button */}
          <div className="flex justify-end mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                <X className="w-6 h-6" />
              </Button>
            </Link>
          </div>

          {/* Alert Status */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-sos rounded-full blur-3xl opacity-60 animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-sos to-sos-glow rounded-full flex items-center justify-center glow-sos">
                <div className="text-5xl font-bold">{seconds}s</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">SOS ACTIVATED</h1>
            <p className="text-lg text-sos">Distress detected! Sending alerts...</p>
          </div>

          {/* Status Cards */}
          <div className="space-y-3 mb-8">
            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-safe-zone/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-safe-zone/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-safe-zone" />
                </div>
                <div>
                  <p className="font-semibold">Mom</p>
                  <p className="text-xs text-muted-foreground">Message Sent</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-safe-zone" />
            </div>

            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-safe-zone/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-safe-zone/20 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-safe-zone" />
                </div>
                <div>
                  <p className="font-semibold">Police Helpline</p>
                  <p className="text-xs text-muted-foreground">Connected</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6 text-safe-zone" />
            </div>

            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <MicIcon className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold">Audio Recording</p>
                  <p className="text-xs text-muted-foreground">In Progress...</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 flex items-center justify-between border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-semibold">Live Location</p>
                  <p className="text-xs text-muted-foreground">Sharing...</p>
                </div>
              </div>
              <div className="text-xs text-primary font-mono">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="glass rounded-2xl p-4 mb-6">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Emergency Contacts Notified:</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Mom</span>
                <span className="text-muted-foreground">📞 9990011223</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Friend</span>
                <span className="text-muted-foreground">📞 8887745621</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-safe-zone to-safe-zone-light hover:opacity-90 transition-opacity rounded-full py-6 text-background">
              I'm Safe Now
            </Button>
            <Link to="/" className="block">
              <Button variant="outline" className="w-full glass border-white/30 rounded-full py-6">
                Cancel Alert
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
