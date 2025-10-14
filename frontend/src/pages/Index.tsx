import { useState, useRef, useEffect } from "react";
import { ChatButton } from "@/components/ChatButton";
import { ChatWindow } from "@/components/ChatWindow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Star, MapPin, Sparkles, MessageCircle, Users, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-artisan.jpg";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import craftsShowcase from "@/assets/crafts-showcase.jpg";
import { useProductContext } from "@/context/ProductContext/ProductContext";
import { apiService } from "@/api/api";

// Define types for products and artisans
interface Product {
  name: string;
  price: number;
  artisan: string;
  location: string;
  story: string;
  description?: string;
  materials?: string[];
  rating?: number;
  reviews?: number;
  image?: string;
}

interface Artisan {
  id: string | number;
  name: string;
  craft: string;
  location: string;
  rating: number;
  reviews: number;
  specialties: string[];
  experience: string;
  description: string;
}

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const artisanScrollRef = useRef<HTMLDivElement>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { products, fetchProducts, loading: productsLoading } = useProductContext();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [artisansLoading, setArtisansLoading] = useState(false);

  // Smooth scroll handler
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -300 : 300, // scroll amount
        behavior: "smooth",
      });
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Fetch featured data on mount
  useEffect(() => {
    // Fetch products (first page) and artisans list (limited)
    fetchProducts(1);

    const loadArtisans = async () => {
      setArtisansLoading(true);
      try {
        const result: any = await apiService.getSellersList({ page: "1", limit: "12" });
        const sellerList: any[] = result?.sellers || [];
        const mapped: Artisan[] = sellerList.map((s: any) => ({
          id: s._id,
          name: s.name || s.email || "Artisan",
          craft: s.role || "Artisan",
          location: s.location || "Local",
          rating: 4.8,
          reviews: 24,
          specialties: Array.isArray(s.specialties) ? s.specialties : [],
          experience: s.experience || "",
          description: s.bio || "Talented artisan creating beautiful handmade crafts with traditional techniques.",
        }));
        setArtisans(mapped);
      } catch (err) {
        console.error("Failed to load artisans", err);
        setArtisans([]);
      } finally {
        setArtisansLoading(false);
      }
    };

    loadArtisans();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-subtle">
      <Navbar />
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <ChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen(!isChatOpen)} />
      </div>
      {/* Chat Window */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/20"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Marketplace
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-float">
              Discover Local
              <span className="block bg-gradient-to-r from-accent to-primary-glow bg-clip-text text-transparent">
                Artisan Crafts
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Connect with talented local artisans through our AI assistant.
              Discover unique handmade products or learn how to showcase your own crafts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
              <Button size="lg" variant="outline" className="bg-primary border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Users className="w-5 h-5 mr-2" />
                For Artisans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section id="chat" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Talk to Our AI Assistant
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ask about products, pricing, artisan stories, or get guidance on listing your own crafts.
              Our AI understands both customers and artisans.
            </p>
          </div>
          <ChatInterface />
        </div>
      </section>

      {/* Featured Artisans */}
      <div id="Artist" className="mb-12 pt-7 relative ">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground text-center">
          Featured Artisan
        </h2>
        <p className="text-lg text-muted-foreground text-center pb-4">
          Discover local artisans and there unique handcrafted
        </p>
        {/* Scrollable horizontal container */}
        <div
          ref={artisanScrollRef}
          className="flex overflow-x-auto gap-8 py-4 px-2 scroll-smooth snap-x snap-mandatory "
          style={{ scrollPadding: "0.5rem" }}
        >
          {(artisansLoading ? Array.from({ length: 6 }) : artisans).map((artisan, idx) => (
            <Card
              key={(artisan as Artisan)?.id ?? idx}
              className="flex-none w-80 overflow-hidden shadow-elegant hover:shadow-warm transition spring group hover:-translate-y-1 snap-center"
            >
              <div className="aspect-square bg-gradient-warm/10 flex items-center justify-center p-8">
                <img
                  src={craftsShowcase}
                  alt={`${(artisan as Artisan)?.name || "Artisan"}'s crafts`}
                  className="w-full h-full object-cover rounded-lg shadow-elegant group-hover:scale-105 transition spring"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{(artisan as Artisan)?.name || ""}</CardTitle>
                    <p className="text-primary font-semibold">{(artisan as Artisan)?.craft || ""}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{(artisan as Artisan)?.rating ?? 4.8}</span>
                    <span className="text-muted-foreground">({(artisan as Artisan)?.reviews ?? 24})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{(artisan as Artisan)?.location || ""}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{(artisan as Artisan)?.description || ""}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Experience:</span>
                    <span className="text-primary">{(artisan as Artisan)?.experience || ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(artisan as Artisan)?.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/profile/${(artisan as Artisan)?.id}`)}>
                    View Profile
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/chat/${(artisan as Artisan)?.id}`)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Floating scroll buttons for artisans */}
        <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4">
          <Button size="icon" variant="secondary" onClick={() => scroll(artisanScrollRef, "left")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="secondary" onClick={() => scroll(artisanScrollRef, "right")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Browse all */}
        <div className="text-center mt-4 mb-7">
          <Link to="/artisans" className="text-blue-600 underline">Browse all Artisan →</Link>
        </div>
      </div>

      {/* Featured Products */}
      <section id="products" className="py-16 bg-card relative ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Featured Artisan Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover unique handcrafted items from talented local artisans
            </p>
          </div>
          {/* Scrollable horizontal container for products */}
          <div
            ref={productScrollRef}
            className="flex overflow-x-auto gap-8 py-4 px-2 scroll-smooth snap-x snap-mandatory"
            style={{ scrollPadding: "1rem" }}
          >
            {(productsLoading ? Array.from({ length: 8 }) : products.slice(0, 12)).map((p: any, index: number) => {
              const image = Array.isArray(p?.images) && p.images.length
                ? p.images[0]
                : p?.image || (Array.isArray(p?.imagesData) && p.imagesData[0]?.url) || undefined;
              const productForCard = {
                id: p?._id,
                name: p?.name || "Handcrafted Item",
                price: p?.price || 0,
                artisan: p?.artisan || "Local Artisan",
                location: p?.location || p?.category || "",
                story: p?.description || "",
                image,
                tags: p?.tags || [],
              };
              const productForModal: Product = {
                name: productForCard.name,
                price: productForCard.price,
                artisan: productForCard.artisan,
                location: productForCard.location,
                story: productForCard.story,
                image: productForCard.image,
              };
              return (
                <div key={p?._id || index} className="flex-none w-80 snap-center">
                  <ProductCard
                    {...productForCard}
                    onClick={() => handleProductClick(productForModal)}
                  />
                </div>
              );
            })}
          </div>

          {/* Floating scroll buttons for products */}
          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-4 ">
            <Button size="icon" variant="secondary" onClick={() => scroll(productScrollRef, "left")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => scroll(productScrollRef, "right")}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center mt-4 mb-7">
            <Link to="/products" className="text-blue-600 underline">Browse all products →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            Preserving Culture with Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mx-auto shadow-warm">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Smart algorithms connect buyers with the perfect artisan based on craft type, style, and requirements.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Artisan Support</h3>
              <p className="text-muted-foreground">
                Get guidance on listing products and building your marketplace presence.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto shadow-elegant">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">Storytelling</h3>
              <p className="text-muted-foreground">
                Help artisans share the rich heritage and traditional techniques behind their beautiful crafts.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto shadow-glow">
                <ShoppingBag className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Direct Connection</h3>
              <p className="text-muted-foreground">
                Connect directly with artisans and learn the stories behind each craft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <section id="about">
        <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={closeModal} />
      </section>
      <Footer />
    </div>
  );
};

export default Index;