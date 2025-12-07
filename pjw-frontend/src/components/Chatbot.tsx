import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm the Project Wampus assistant. Ask me anything about our organization, mission, or how to get involved!" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);
    
    // Placeholder bot response
    setTimeout(() => {
      const responses = [
        "That's a great question! Our team is working on providing detailed information about this.",
        "Project Wampus operates throughout Austin, focusing on areas with the highest need.",
        "You can get involved by volunteering, donating, or spreading awareness!",
        "We've distributed over 50,000 meals to people experiencing homelessness in Austin.",
        "Our advocacy efforts focus on supporting legislation that helps end homelessness."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: "bot", text: randomResponse }]);
    }, 1000);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#22C55E] neo-brutal-border neo-brutal-shadow hover:translate-x-1 hover:translate-y-1 transition-transform z-50"
        >
          <MessageCircle className="w-8 h-8 text-white mx-auto" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white neo-brutal-border neo-brutal-shadow z-50 flex flex-col">
          {/* Header */}
          <div className="bg-[#22C55E] p-4 flex items-center justify-between neo-brutal-border-thin border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="font-black text-white">WAMPUS BOT</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 neo-brutal-border-thin ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-[#22C55E] text-white"
                  }`}
                >
                  <p className="text-sm font-bold">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 neo-brutal-border-thin border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="neo-brutal-border-thin font-bold"
              />
              <Button
                onClick={handleSend}
                className="neo-button bg-[#22C55E] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
