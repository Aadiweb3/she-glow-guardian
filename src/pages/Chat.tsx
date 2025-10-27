import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mic, Send, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Chat = () => {
  const [messages] = useState([
    { role: 'ai', text: "Hi Ananya! I'm SARA, your AI safety companion. How can I help you today?" },
    { role: 'user', text: "I'm feeling unsafe." },
    { role: 'ai', text: "I've activated background tracking. Would you like to share your live location with your family?" }
  ]);

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
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-white/10 glass'
                    : 'bg-gradient-to-r from-ai-chat to-ai-chat-light glow-primary'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="pt-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">Quick actions:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10">
                Share Location
              </Button>
              <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10">
                Call Emergency
              </Button>
              <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10">
                Find Safe Place
              </Button>
              <Button variant="outline" className="glass border-primary/30 hover:bg-primary/10">
                Check Route
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message or ask for help..."
              className="glass border-white/10 pr-12 rounded-full"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-gradient-to-r from-primary to-primary-purple glow-primary h-12 w-12"
          >
            <Mic className="w-5 h-5 animate-pulse" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
