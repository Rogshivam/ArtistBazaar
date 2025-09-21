import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext/CartContext';

interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product?: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    isLoading, 
    error, 
    refreshCart 
  } = useCart();

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateCartQuantity(productId, newQuantity);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshCart();
      toast({
        title: "Cart refreshed",
        description: "Your cart has been updated"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh cart",
        variant: "destructive"
      });
    }
  };

  const getTotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce((total, item) => total + (item.priceSnapshot * item.quantity), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Shopping Cart
              {cart && cart.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </Badge>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <RefreshCw className="w-8 h-8 text-muted-foreground mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Loading cart...
                </h3>
              </div>
            ) : !cart || cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Your cart is empty
                </h3>
                <p className="text-sm text-muted-foreground">
                  Add some products to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 border rounded-lg">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-2xl">🏺</span>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.product?.name || 'Product'}
                      </h4>
                      <div className="text-xs text-muted-foreground">
                        Price: {formatPrice(item.priceSnapshot)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Subtotal: {formatPrice(item.priceSnapshot * item.quantity)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={isLoading}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;