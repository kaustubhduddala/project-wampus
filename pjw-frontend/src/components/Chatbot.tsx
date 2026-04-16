import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { askChatbot, type ChatMessage } from "@/api/chatClient";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: trimmedInput };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setInputValue("");
    setChatError(null);
    setIsLoading(true);

    try {
      const { answer } = await askChatbot(trimmedInput, chatHistory);
      const assistantMessage: ChatMessage = { role: "assistant", content: answer };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.";
      setChatError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSend();
    }
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
            {chatHistory.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 neo-brutal-border-thin bg-[#22C55E] text-white">
                  <p className="text-[10px] font-black uppercase opacity-80 mb-1">Assistant</p>
                  <p className="text-sm font-bold">
                    Hi! I'm the Project Wampus assistant. Ask me anything about our organization,
                    mission, or how to get involved!
                  </p>
                </div>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
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
                  <p className="text-[10px] font-black uppercase opacity-80 mb-1">
                    {msg.role === "user" ? "You" : "Assistant"}
                  </p>
                  <p className="text-sm font-bold">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 neo-brutal-border-thin bg-[#22C55E] text-white">
                  <p className="text-[10px] font-black uppercase opacity-80 mb-1">Assistant</p>
                  <p className="text-sm font-bold">...</p>
                </div>
              </div>
            )}

            {chatError && (
              <div className="text-xs font-bold text-red-600 bg-red-50 neo-brutal-border-thin p-2">
                {chatError}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 neo-brutal-border-thin border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="neo-brutal-border-thin font-bold"
                disabled={isLoading}
              />
              <Button
                onClick={() => {
                  void handleSend();
                }}
                className="neo-button bg-[#22C55E] text-white"
                disabled={isLoading}
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
