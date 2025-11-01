import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, AlertTriangle, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

const Map = () => {
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
            <h1 className="font-semibold">Your Route – Stay Safe</h1>
            <p className="text-xs text-muted-foreground">Safety Score: 78/100</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Navigation className="w-5 h-5" />
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
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">Current Location</h3>
                <p className="text-xs text-muted-foreground">MI Road, Jaipur</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-caution-zone">78</div>
                <div className="text-xs text-muted-foreground">Safety Score</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Nearest Safe Zone: Cafe Bliss (0.4 km)</span>
            </div>
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
