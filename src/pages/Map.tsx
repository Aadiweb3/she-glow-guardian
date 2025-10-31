import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, AlertTriangle, Navigation, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { LocationTracker, LocationData } from "@/utils/LocationTracker";
import { useToast } from "@/hooks/use-toast";

const Map = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const tracker = new LocationTracker((loc) => {
        setLocation(loc);
      });
      
      const currentLocation = await tracker.getCurrentLocation();
      setLocation(currentLocation);
      
      toast({
        title: "Location updated",
        description: "Your current location has been fetched successfully.",
      });
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: "Location error",
        description: "Could not fetch your location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative gradient-pink-dark">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 glass border-b border-white/10 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="font-semibold">Live Location</h1>
            <p className="text-xs text-muted-foreground">
              {location ? "Location active" : "Tap to fetch location"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={fetchLocation}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Map placeholder with zones */}
      <div className="h-screen relative">
        <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-card">
          {/* Simulated map zones */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-danger-zone/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-safe-zone/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-caution-zone/30 rounded-full blur-2xl"></div>
          
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
          <div className="glass rounded-2xl p-4 mb-3">
            {location ? (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Current Location</h3>
                    <p className="text-xs text-muted-foreground break-words">
                      {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>Accuracy: {location.accuracy.toFixed(0)}m</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => window.open(`https://maps.google.com/?q=${location.lat},${location.lng}`, '_blank')}
                >
                  View on Google Maps
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Click the navigation button to fetch your location
                </p>
                <Button onClick={fetchLocation} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                  Get Location
                </Button>
              </div>
            )}
          </div>

          {/* Zone Legend */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-3">Safety Zones</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-safe-zone to-safe-zone-light rounded-full"></div>
                <span className="text-sm">Safe Area</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-caution-zone rounded-full"></div>
                <span className="text-sm">Caution Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-r from-danger-zone to-danger-zone-dark rounded-full"></div>
                <span className="text-sm">High-Risk Area</span>
              </div>
            </div>
          </div>

          {/* Report Button */}
          <Button className="w-full mt-3 bg-gradient-to-r from-sos to-sos-glow hover:opacity-90 transition-opacity rounded-full py-6">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report Incident
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Map;
