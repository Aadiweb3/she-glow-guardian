import { Button } from "@/components/ui/button";
import { Shield, MapPin, Mic, Brain, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen p-6 pb-24 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-primary-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-primary-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Welcome, Ananya 👋</h1>
          <p className="text-muted-foreground">You're protected by S.H.E.</p>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          <div className="glass rounded-2xl p-4 text-center">
            <MapPin className="w-6 h-6 mx-auto mb-2 text-safe-zone" />
            <p className="text-xs text-muted-foreground mb-1">GPS</p>
            <p className="text-sm font-semibold">Active ✅</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Mic className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground mb-1">Mic</p>
            <p className="text-sm font-semibold">Listening... 🎤</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-primary-blue" />
            <p className="text-xs text-muted-foreground mb-1">AI Mode</p>
            <p className="text-sm font-semibold">Monitoring 🧠</p>
          </div>
        </div>

        {/* SOS Button */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-sos rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <Link to="/alert">
              <button className="relative w-56 h-56 rounded-full bg-gradient-to-br from-sos to-sos-glow glow-sos hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center group">
                <Shield className="w-20 h-20 mb-3 group-hover:animate-pulse" />
                <span className="text-2xl font-bold">SOS</span>
                <span className="text-sm opacity-80">Tap to Activate</span>
              </button>
            </Link>
          </div>
          <p className="text-center text-sm text-muted-foreground max-w-xs">
            Press and hold for 3 seconds to send instant alert to your emergency contacts
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/map" className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <MapPin className="w-8 h-8 mb-3 text-safe-zone" />
            <h3 className="font-semibold mb-1">Safety Map</h3>
            <p className="text-xs text-muted-foreground">View safe routes</p>
          </Link>
          <Link to="/chat" className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors">
            <MessageCircle className="w-8 h-8 mb-3 text-primary" />
            <h3 className="font-semibold mb-1">AI Companion</h3>
            <p className="text-xs text-muted-foreground">Chat with SARA</p>
          </Link>
        </div>

        {/* Safety Score */}
        <div className="glass rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Current Safety Score</h3>
              <p className="text-xs text-muted-foreground">Based on your location</p>
            </div>
            <div className="text-4xl font-bold gradient-text">78</div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-danger-zone via-caution-zone to-safe-zone rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-4">
        <div className="max-w-md mx-auto flex justify-around">
          <Link to="/" className="flex flex-col items-center text-primary">
            <Shield className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/map" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <MapPin className="w-6 h-6 mb-1" />
            <span className="text-xs">Map</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">SARA</span>
          </Link>
          <Link to="/contacts" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-6 h-6 mb-1" />
            <span className="text-xs">Contacts</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;
