import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Send, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'ai' | 'user';
  text: string;
}

const Chat = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: "Hi! I'm SARA, your AI safety companion. How can I help you today? You can ask me to share your location, call police, or record your environment." 
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage = message;
      setMessages(prev => [...prev, { role: "user", text: userMessage }]);
      setMessage("");
      setIsLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messages.map(m => ({ 
                role: m.role === "user" ? "user" : "assistant", 
                content: m.text 
              })).concat([{ role: "user", content: userMessage }]),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: data.response 
        }]);

        // Handle action if present
        if (data.action) {
          handleAIAction(data.action);
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to get response from SARA",
          variant: "destructive",
        });
        setMessages(prev => [...prev, { 
          role: "ai", 
          text: "I'm sorry, I'm having trouble connecting right now. Please try again." 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAIAction = (action: string) => {
    switch (action) {
      case "SHARE_LOCATION":
        toast({
          title: "Location Shared",
          description: "Your live location is now being shared",
        });
        break;
      case "CALL_POLICE":
        toast({
          title: "Emergency Services",
          description: "Connecting to emergency services...",
          variant: "destructive",
        });
        break;
      case "RECORD_AUDIO":
        startVoiceRecording();
        break;
      case "ACTIVATE_SOS":
        window.location.href = "/alert";
        break;
    }
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        
        toast({
          title: "Voice Command",
          description: "Processing your voice command...",
        });

        // Simulate voice-to-text (in production, use Web Speech API or backend service)
        setTimeout(async () => {
          const simulatedText = "Help me, I need assistance";
          setMessage(simulatedText);
          
          // Auto-send the message
          setMessages(prev => [...prev, { role: "user", text: simulatedText }]);
          setIsLoading(true);

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  messages: messages.map(m => ({ 
                    role: m.role === "user" ? "user" : "assistant", 
                    content: m.text 
                  })).concat([{ role: "user", content: simulatedText }]),
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              setMessages(prev => [...prev, { role: "ai", text: data.response }]);
              if (data.action) handleAIAction(data.action);
            }
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setIsLoading(false);
            setMessage("");
          }
        }, 1000);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording",
        description: "Speak your command now...",
      });

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 5000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice commands",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages: Record<string, string> = {
      location: "Share my live location with emergency contacts",
      emergency: "Call emergency services",
      safe: "Find the nearest safe place",
      route: "Check my route safety"
    };

    const text = actionMessages[action];
    if (text) {
      setMessage(text);
      setTimeout(() => handleSend(), 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/10 p-4 flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-ai-chat to-ai-chat-light rounded-full flex items-center justify-center glow-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-semibold">AI Companion – SARA</h1>
            <p className="text-xs text-safe-zone flex items-center gap-1">
              <span className="w-2 h-2 bg-safe-zone rounded-full animate-pulse"></span>
              Online & Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-white/10 glass'
                    : 'bg-gradient-to-r from-ai-chat to-ai-chat-light glow-primary'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-r from-ai-chat to-ai-chat-light glow-primary">
                <p className="text-sm animate-pulse">SARA is thinking...</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="glass border-primary/30 hover:bg-primary/10"
                onClick={() => handleQuickAction('location')}
                disabled={isLoading}
              >
                Share Location
              </Button>
              <Button 
                variant="outline" 
                className="glass border-primary/30 hover:bg-primary/10"
                onClick={() => handleQuickAction('emergency')}
                disabled={isLoading}
              >
                Call Emergency
              </Button>
              <Button 
                variant="outline" 
                className="glass border-primary/30 hover:bg-primary/10"
                onClick={() => handleQuickAction('safe')}
                disabled={isLoading}
              >
                Find Safe Place
              </Button>
              <Button 
                variant="outline" 
                className="glass border-primary/30 hover:bg-primary/10"
                onClick={() => handleQuickAction('route')}
                disabled={isLoading}
              >
                Check Route
              </Button>
            </div>
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message or ask for help..."
              className="glass border-white/10 pr-12 rounded-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="icon"
            className={`rounded-full h-12 w-12 ${
              isRecording 
                ? 'bg-sos hover:bg-sos/90' 
                : 'bg-gradient-to-r from-primary to-primary-purple glow-primary'
            }`}
            onClick={startVoiceRecording}
            disabled={isLoading}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
