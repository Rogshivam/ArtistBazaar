import { useState, useEffect, useRef, FormEvent } from "react";
import { X, Send, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { mockProductData } from "@/lib/productData";
import { translations, buildSystemInstruction } from "@/lib/translations";
import { fetchRAGContext } from "@/lib/ragContext";
import { fetchWithRetry, Message } from "@/lib/gemini";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow = ({ isOpen, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState<"en" | "hi">("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[currentLang];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      setMessages([{ role: "model", content: t.welcome }]);
    }
  }, [isOpen, currentLang, t.welcome]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Construct chat history
      const chatHistory = [...messages, newUserMessage].map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      // Fetch RAG context and build system instruction
      const productContext = await fetchRAGContext(userMessage);
      const systemInstruction = buildSystemInstruction(productContext, currentLang);

      const payload = {
        contents: chatHistory,
        systemInstruction: { parts: [{ text: systemInstruction }] },
      };

      // Make API call with retry
      const generatedText = await fetchWithRetry(payload, t.error);
      setMessages((prev) => [...prev, { role: "model", content: generatedText }]);
    } catch (error) {
      console.error("API error:", error);
      setMessages((prev) => [...prev, { role: "model", content: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-background/95 backdrop-blur-sm flex items-center justify-center z-[101] p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="relative mx-auto w-full max-w-4xl h-full max-h-[800px] bg-card rounded-3xl shadow-glow flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="gradient-primary text-primary p-5 font-bold text-lg shadow-medium flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <span className="truncate">{t.buttonTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              onClick={toggleLanguage}
              size="sm"
              variant="ghost"
              className="text-xs px-3 py-1 rounded-lg border border-primary/20 hover:bg-primary/10 text-primary"
            >
              <Globe className="h-3 w-3 mr-1" />
              {t.langToggle}
            </Button>
            {/* Close Button */}
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className="rounded-full hover:bg-primary/10 text-primary"
              aria-label={t.closeChat}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6 gradient-subtle">
          <div className="space-y-4">
            {messages.map((m, index) => (
              <MessageBubble key={index} message={m} productData={mockProductData} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-5 border-t border-border bg-card shadow-soft">
          <div className="flex gap-3">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? t.generating : t.placeholder}
              disabled={loading}
              className="flex-1 rounded-xl border-input focus-visible:ring-primary transition-smooth"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="lg"
              className="gradient-primary rounded-xl shadow-soft hover:shadow-medium transition-smooth"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
