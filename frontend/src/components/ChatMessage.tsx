import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

export function ChatMessage({ message, isBot, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg max-w-[85%]",
        isBot
          ? "bg-muted text-foreground self-start"
          : "bg-primary text-primary-foreground self-end ml-auto"
      )}
      role="group"
      aria-label={isBot ? "Received message" : "Sent message"}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
          isBot
            ? "bg-gradient-primary text-primary-foreground"
            : "bg-primary-foreground/20 text-primary-foreground"
        )}
      >
        {isBot ? "🤖" : "👤"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {isBot ? "Artisan Assistant" : "You"}
          </span>
          <span className={cn("text-xs", isBot ? "text-muted-foreground" : "text-primary-foreground/90")}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className={cn(isBot ? "text-foreground" : "text-primary-foreground")}>{message}</p>
      </div>
    </div>
  );
}