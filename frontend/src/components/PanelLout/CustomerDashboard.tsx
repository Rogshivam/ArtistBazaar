import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Heart, 
  Package, 
  Star,
  Eye,
  Search,
  TrendingUp,
  Settings,
  User,
  CreditCard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { useCart } from "@/context/CartContext/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { apiService } from "@/api/api";
import { Link } from "react-router-dom";

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  cartItems: number;
  recentOrders: any[];
  recommendedProducts: any[];
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { getCartItemCount } = useCart();
  const { wishlist } = useWishlist();
  const [stats, setStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    cartItems: 0,
    recentOrders: [],
    recommendedProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Get cart and wishlist counts
        const cartItems = getCartItemCount();
        const wishlistItems = wishlist.length;
        
        // Mock data for orders (replace with actual API call)
        const recentOrders = [
          { id: "1", product: "Handmade Pottery", seller: "Artisan Studio", amount: 45.99, status: "delivered", date: "2024-01-15" },
          { id: "2", product: "Wooden Sculpture", seller: "Craft Master", amount: 89.99, status: "shipped", date: "2024-01-14" },
          { id: "3", product: "Textile Art", seller: "Fiber Arts", amount: 34.50, status: "processing", date: "2024-01-13" }
        ];
        
        // Fetch recommended products
        const productsData = await apiService.getProducts({ limit: "6" });
        const recommendedProducts = productsData.products || [];
        
        const totalOrders = recentOrders.length;
        const totalSpent = recentOrders.reduce((sum, order) => sum + order.amount, 0);

        setStats({
          totalOrders,
          totalSpent,
          wishlistItems,
          cartItems,
          recentOrders,
          recommendedProducts
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCustomerData();
    }
  }, [user, getCartItemCount, wishlist.length]);

  const statsData = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      change: "+2",
      changeType: "positive" as const,
      icon: Package,
      description: "Orders placed",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      change: "+12%",
      changeType: "positive" as const,
      icon: CreditCard,
      description: "Amount spent",
    },
    {
      title: "Wishlist Items",
      value: stats.wishlistItems.toString(),
      change: "+3",
      changeType: "positive" as const,
      icon: Heart,
      description: "Saved items",
    },
    {
      title: "Cart Items",
      value: stats.cartItems.toString(),
      change: "+1",
      changeType: "positive" as const,
      icon: ShoppingCart,
      description: "Items in cart",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover amazing handmade products from talented artisans.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/products">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/customer/${user?.id}/orders`}>
              <Package className="w-4 h-4 mr-2" />
              My Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.title} className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs">
                <Badge 
                  variant={stat.changeType === "positive" ? "default" : "destructive"}
                  className={stat.changeType === "positive" ? "bg-success text-success-foreground" : ""}
                >
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{order.product}</p>
                    <p className="text-sm text-muted-foreground">by {order.seller}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.amount}</p>
                    <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Products */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>Products you might like</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recommendedProducts.slice(0, 4).map((product, index) => (
                <div key={product._id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">{product.rating || 4.5}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used customer features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild className="flex flex-col items-center p-4 h-auto">
              <Link to="/products">
                <Search className="w-8 h-8 mb-2" />
                <span className="font-medium">Browse Products</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Link to={`/customer/${user?.id}/wishlist`}>
                <Heart className="w-8 h-8 mb-2" />
                <span className="font-medium">Wishlist</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Link to={`/customer/${user?.id}/orders`}>
                <Package className="w-8 h-8 mb-2" />
                <span className="font-medium">My Orders</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Link to={`/customer/${user?.id}/settings`}>
                <Settings className="w-8 h-8 mb-2" />
                <span className="font-medium">Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
