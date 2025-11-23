import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, AlertTriangle, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { LocationTracker, LocationData } from "@/utils/LocationTracker";

const Map = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tracker = new LocationTracker((loc) => {
      setLocation(loc);
      setIsLoading(false);
    });

    tracker.start().catch(() => {
      setIsLoading(false);
    });

    return () => {
      tracker.stop();
    };
  }, []);

  const displayLocation = location?.address || 
    (location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Getting location...");

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 glass border-b border-white/10 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="font-semibold">Live Location Map</h1>
            <p className="text-xs text-muted-foreground">Real-time tracking active</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Navigation className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card">
          {/* Map grid overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Current location marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-purple rounded-full flex items-center justify-center glow-primary">
              <MapPin className="w-8 h-8 fill-current" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="absolute bottom-20 left-0 right-0 px-4 space-y-3">
        <div className="max-w-md mx-auto">
          {/* Current Location Info */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Current Location</h3>
                <p className="text-xs text-muted-foreground break-words">
                  {isLoading ? "Loading..." : displayLocation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
