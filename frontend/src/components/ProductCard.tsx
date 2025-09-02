import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAlert } from "@/context/alert/AlertContext";

interface ProductCardProps {
  id?: string;
  name: string;
  price: number;
  artisan: string;
  location: string;
  story: string;
  image?: string;
  description?: string;
  materials?: string[];
  rating?: number;
  reviews?: number;
  onClick?: () => void;
}

export function ProductCard({ 
  id,
  name, 
  price, 
  artisan, 
  location, 
  story, 
  description,
  materials = ["Clay", "Natural Glazes"],
  rating = 4,
  reviews = 23,
  onClick 
}: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError, showInfo } = useAlert();
  
  const isFavorite = id ? isInWishlist(id) : false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) {
      showError("Product ID not available");
      return;
    }

    try {
      if (isFavorite) {
        await removeFromWishlist(id);
        showSuccess(`${name} removed from wishlist`);
      } else {
        await addToWishlist(id, {
          _id: id,
          name,
          price,
          category: location
        });
        showSuccess(`${name} added to wishlist`);
      }
    } catch (error: any) {
      showError(error.message || "Failed to update wishlist");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) {
      showError("Product ID not available");
      return;
    }
    
    try {
      await addToCart(id, 1);
      showSuccess(`${name} added to cart`);
      
      // Save to recent products
      const recentProducts = JSON.parse(localStorage.getItem('recentProducts') || '[]');
      const newRecent = [
        { id, name, price, artisan, location },
        ...recentProducts.filter((p: any) => p.id !== id)
      ].slice(0, 10); // Keep only last 10
      localStorage.setItem('recentProducts', JSON.stringify(newRecent));
      
    } catch (err: any) {
      showError(err.message || "Failed to add to cart");
    }
  };

  return (
    <Card 
      className="group hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square bg-gradient-subtle rounded-t-lg flex items-center justify-center text-6xl relative overflow-hidden">
        🏺
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleQuickAdd}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">{name}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={handleFavoriteClick}
          >
            <Heart className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-primary'
            }`} />
          </Button>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({reviews})</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{story}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-primary">₹{price}</p>
            <p className="text-sm text-muted-foreground">by {artisan}</p>
          </div>
          <Badge variant="secondary" className="bg-secondary/50">
            Handmade
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}