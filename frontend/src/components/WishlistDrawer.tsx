import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext/CartContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, isLoading, error, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast({ title: 'Added to cart' });
    } catch (e: any) {
      toast({ title: 'Failed to add to cart', description: e.message || 'Try again', variant: 'destructive' });
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast({ title: 'Removed from wishlist' });
    } catch (e: any) {
      toast({ title: 'Failed to remove', description: e.message || 'Try again', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Wishlist
              {wishlist?.length ? (
                <Badge variant="secondary" className="ml-2">{wishlist.length}</Badge>
              ) : null}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
            ) : !wishlist || wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Heart className="w-14 h-14 mb-3" />
                Your wishlist is empty
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((w) => (
                  <div key={w.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                    {/* Image */}
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      {w.product?.images?.[0] ? (
                        <img
                          src={w.product.images[0]}
                          alt={w.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-2xl">🏺</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{w.product?.name || 'Product'}</div>
                      {typeof w.product?.price === 'number' && (
                        <div className="text-xs text-muted-foreground">₹{w.product.price}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleAddToCart(w.productId)}
                        disabled={isLoading}
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemove(w.productId)}
                        disabled={isLoading}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {wishlist?.length || 0} item(s)
            </div>
            <Button variant="outline" size="sm" onClick={refreshWishlist} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDrawer;
