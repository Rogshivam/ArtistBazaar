import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, ShoppingCart, ArrowLeft, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAlert } from "@/context/alert/AlertContext";
import { useProductContext } from "@/context/ProductContext/ProductContext";
import { ProductCard } from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  // Optional fields from ApiProduct
  artisan?: string;
  location?: string;
  category?: string;
  image?: string;
  images?: string[];
  imagesData?: Array<{ url?: string }>; 
  materials?: string[];
  rating?: number;
  reviews?: number;
  tags?: string[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useAlert();
  const { products } = useProductContext();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // In a real app, you would fetch the product by ID from your API
        // For now, we'll simulate this by finding the product in the existing products
        const foundProduct = products.find(p => p._id === id) as unknown as Product | undefined;
        if (foundProduct) {
          setProduct(foundProduct);
          // Find similar products (same category or tags)
          const similar = products
            .filter(p => 
              p._id !== id && 
              (
                p.category === foundProduct.category ||
                (p.tags && foundProduct.tags && p.tags.some(tag => foundProduct.tags!.includes(tag)))
              )
            )
            .slice(0, 4) as unknown as Product[]; // Show max 4 similar products
          setSimilarProducts(similar as Product[]);
        } else {
          // If product not found, redirect to products page
          navigate('/products');
          showError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        showError('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, products, navigate, showError]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product._id, quantity);
      showSuccess(`${product.name} added to cart`);
    } catch (err: any) {
      showError(err.message || 'Failed to add to cart');
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        showSuccess('Removed from wishlist');
      } else {
        await addToWishlist(product._id, {
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category || '',
        });
        showSuccess('Added to wishlist');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Button>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img
            src={product.image || product.images?.[0] || product.imagesData?.[0]?.url || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </div>

          <div className="text-gray-700">
            {product.description && product.description.length > 220 ? (
              <>
                <p>
                  {showFullDesc ? product.description : `${product.description.slice(0, 220)}...`}
                </p>
                <button
                  className="text-primary mt-2 text-sm"
                  onClick={() => setShowFullDesc((v) => !v)}
                >
                  {showFullDesc ? 'Read less' : 'Read more'}
                </button>
              </>
            ) : (
              <p>{product.description}</p>
            )}
          </div>

          {product.materials && product.materials.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900">Materials</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.materials.map((material) => (
                  <Badge key={material} variant="outline">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{product.location || product.category}</span>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10"
              >
                -
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={toggleWishlist}
            >
              <Heart 
                className={`mr-2 h-5 w-5 ${isInWishlist(product._id) ? 'fill-current text-red-500' : ''}`} 
              />
              {isInWishlist(product._id) ? 'In Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarProducts.map((item) => (
              <ProductCard
                key={item._id}
                id={item._id}
                name={item.name}
                price={item.price}
                artisan={item.artisan || 'Local Artisan'}
                location={item.location || item.category || 'Handmade'}
                story={item.description}
                image={item.image || item.images?.[0] || item.imagesData?.[0]?.url}
                rating={item.rating}
                reviews={item.reviews}
                tags={item.tags}
                onClick={() => navigate(`/products/${item._id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
