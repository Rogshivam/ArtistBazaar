import { Fragment } from "react";
import { ProductCard } from "./ProductCard";

interface Message {
  role: "user" | "model";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  productData: Array<{
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    url: string;
  }>;
}

export const MessageBubble = ({ message, productData }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  
  // Regex to find Markdown links for product cards
  const linkRegex = /\[View Product: (.*?)\]\((.*?)\)/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  let match;
  while ((match = linkRegex.exec(message.content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {message.content.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Add ProductCard
    const productName = match[1];
    const productUrl = match[2];
    const product = productData.find(p => p.name === productName);
    
    parts.push(
      <ProductCard 
        key={productUrl} 
        name={productName} 
        url={productUrl}
        price={product?.price}
        imageUrl={product?.imageUrl}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < message.content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {message.content.substring(lastIndex)}
      </span>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div 
        className={`max-w-[85%] p-4 rounded-2xl shadow-soft space-y-2 ${
          isUser 
            ? "gradient-primary text-primary-foreground rounded-br-sm" 
            : "bg-card text-card-foreground border border-border rounded-tl-sm"
        }`}
      >
        {parts.map((part, index) => (
          <Fragment key={index}>{part}</Fragment>
        ))}
      </div>
    </div>
  );
};
