import { Button } from "@/components/ui/button";
import { Shield, MapPin, Mic, Brain, Phone, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useSafetyMonitoring } from "@/hooks/useSafetyMonitoring";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Home = () => {
  const { state, startMonitoring, stopMonitoring, triggerSOS } = useSafetyMonitoring();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showSaheli, setShowSaheli] = useState(false);

  useEffect(() => {
    startMonitoring();
    setIsMonitoring(true);
  }, []);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const safetyStatus = state.status === 'distress' ? 'alert' : 'safe';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Glowing Waves */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, hsl(330 100% 71%) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, hsl(270 80% 65%) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            x: [0, -120, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ 
            background: 'radial-gradient(circle, hsl(210 100% 55%) 0%, transparent 70%)',
            filter: 'blur(90px)'
          }}
          animate={{
            x: [-300, 150, -300],
            y: [-300, 150, -300],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `hsl(${330 + i * 10} 100% 71%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 10px hsl(${330 + i * 10} 100% 71%)`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pb-24">
        {/* Top Status Bar */}
        <motion.div 
          className="glass-strong px-6 py-4 flex items-center justify-between"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: safetyStatus === 'alert' ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: safetyStatus === 'alert' ? Infinity : 0,
              }}
            >
              {safetyStatus === 'safe' ? (
                <div className="w-3 h-3 rounded-full bg-safe-zone shadow-[0_0_10px_hsl(var(--safe-zone))]" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-sos shadow-[0_0_10px_hsl(var(--sos))]" />
              )}
            </motion.div>
            <span className="text-sm font-semibold">
              {safetyStatus === 'safe' ? '🟢 Safe' : '🔴 Alert Sent'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold gradient-text">S.H.E.</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <div className="px-6 pt-12 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 gradient-text leading-tight"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Smart Help Engine
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              AI that listens, learns, and protects you.
            </motion.p>
            <motion.p 
              className="text-sm text-muted-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Welcome back, Ananya 👋
            </motion.p>
          </motion.div>
        </div>

        <div className="max-w-lg mx-auto px-6 space-y-6">
          {/* 3D SOS Button - Center Piece */}
          <motion.div 
            className="flex flex-col items-center py-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer Glow Rings */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(347 100% 62%) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.button
                onClick={() => triggerSOS()}
                className="relative w-64 h-64 rounded-full flex flex-col items-center justify-center overflow-hidden group"
                style={{
                  background: 'var(--gradient-sos)',
                  boxShadow: 'var(--shadow-3d)',
                }}
                animate={{
                  boxShadow: state.status === 'distress' 
                    ? [
                        '0 8px 48px hsla(347, 100%, 62%, 0.7)',
                        '0 8px 64px hsla(347, 100%, 62%, 0.9)',
                        '0 8px 48px hsla(347, 100%, 62%, 0.7)',
                      ]
                    : '0 8px 48px hsla(347, 100%, 62%, 0.5)',
                }}
                transition={{
                  duration: 1.5,
                  repeat: state.status === 'distress' ? Infinity : 0,
                }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                
                <motion.div
                  animate={{
                    rotate: state.status === 'distress' ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: state.status === 'distress' ? Infinity : 0,
                  }}
                >
                  <Shield className="w-24 h-24 mb-4 drop-shadow-2xl" />
                </motion.div>
                <span className="text-4xl font-bold tracking-wider drop-shadow-2xl">SOS</span>
                <span className="text-sm opacity-90 mt-2">
                  {state.status === 'distress' ? '⚠️ Alert Active!' : 'Tap to Activate'}
                </span>
              </motion.button>
            </motion.div>

            <motion.p 
              className="text-center text-sm text-muted-foreground mt-6 max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Tap • Shake 3x • Say "Help Me"
            </motion.p>
          </motion.div>

          {/* Status Cards Grid */}
          <motion.div 
            className="grid grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="glass-strong rounded-2xl p-4 text-center card-3d"
              whileHover={{ y: -4 }}
            >
              <MapPin className={`w-7 h-7 mx-auto mb-2 ${state.gpsActive ? 'text-safe-zone' : 'text-muted-foreground'}`} />
              <p className="text-xs text-muted-foreground mb-1">GPS</p>
              <p className="text-xs font-semibold">{state.gpsActive ? 'Active ✅' : 'Inactive'}</p>
            </motion.div>

            <motion.div 
              className="glass-strong rounded-2xl p-4 text-center card-3d"
              whileHover={{ y: -4 }}
            >
              <motion.div
                animate={{
                  scale: state.micActive ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: state.micActive ? Infinity : 0,
                }}
              >
                <Mic className={`w-7 h-7 mx-auto mb-2 ${state.micActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </motion.div>
              <p className="text-xs text-muted-foreground mb-1">Mic</p>
              <p className="text-xs font-semibold">{state.micActive ? 'Listening 🎤' : 'Standby'}</p>
            </motion.div>

            <motion.div 
              className="glass-strong rounded-2xl p-4 text-center card-3d"
              whileHover={{ y: -4 }}
            >
              <Brain className={`w-7 h-7 mx-auto mb-2 ${state.aiMonitoring ? 'text-primary-blue' : 'text-muted-foreground'}`} />
              <p className="text-xs text-muted-foreground mb-1">AI Mode</p>
              <p className="text-xs font-semibold">{state.aiMonitoring ? 'Active 🧠' : 'Offline'}</p>
            </motion.div>
          </motion.div>

          {/* Real-time Map Card */}
          <motion.div
            className="glass-strong rounded-3xl p-6 card-3d overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Live Location</h3>
              <Link to="/map">
                <Button variant="ghost" size="sm" className="text-xs">
                  View Map →
                </Button>
              </Link>
            </div>
            <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary-blue/10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:20px_20px]" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-safe-zone rounded-full blur-xl opacity-50" />
                  <MapPin className="w-10 h-10 text-safe-zone relative z-10" />
                </div>
              </motion.div>
            </div>
            {state.lastLocation && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                📍 {state.lastLocation.address || `${state.lastLocation.lat.toFixed(4)}, ${state.lastLocation.lng.toFixed(4)}`}
              </p>
            )}
          </motion.div>

          {/* Monitoring Control */}
          <motion.div 
            className="glass-strong rounded-2xl p-5 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div>
              <h3 className="font-semibold mb-1">Safety Monitoring</h3>
              <p className="text-xs text-muted-foreground">
                {isMonitoring ? '✓ AI checks every 60 sec' : 'Paused - Tap to resume'}
              </p>
            </div>
            <Button
              onClick={toggleMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              size="sm"
              className="btn-3d"
            >
              {isMonitoring ? 'Pause' : 'Resume'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Floating AI Chatbot - Saheli */}
      <motion.div
        className="fixed bottom-24 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Link to="/chat">
          <motion.button
            className="relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden group"
            style={{
              background: 'var(--gradient-ai)',
              boxShadow: 'var(--glow-ai)',
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            {/* Typing Animation Dots */}
            <div className="absolute top-2 right-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-white"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            <Sparkles className="w-7 h-7" />
          </motion.button>
        </Link>
        <motion.div
          className="absolute -top-12 right-0 glass-strong rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
        >
          Chat with Saheli 💜
        </motion.div>
      </motion.div>

      {/* Bottom Navigation Bar */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 px-6 py-4 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="max-w-lg mx-auto flex justify-around">
          <Link to="/" className="flex flex-col items-center">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Shield className="w-6 h-6 mb-1 text-primary" />
            </motion.div>
            <span className="text-xs font-medium text-primary">Home</span>
          </Link>
          <Link to="/map" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <MapPin className="w-6 h-6 mb-1" />
            </motion.div>
            <span className="text-xs">Map</span>
          </Link>
          <Link to="/chat" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <MessageCircle className="w-6 h-6 mb-1" />
            </motion.div>
            <span className="text-xs">Saheli</span>
          </Link>
          <Link to="/contacts" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Phone className="w-6 h-6 mb-1" />
            </motion.div>
            <span className="text-xs">Contacts</span>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
};

export default Home;
