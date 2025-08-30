import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatInterface } from "@/components/ChatInterface";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Sparkles, MessageCircle, Users, ShoppingBag } from "lucide-react";
import heroImage from "@/assets/hero-artisan.jpg";
import  Footer  from "@/components/Footer";
import Navbar from "@/components/Navbar";
const featuredProducts = [
  {
    name: "Handmade Pottery Bowl",
    price: 800,
    artisan: "Asha Devi",
    location: "Jaipur",
    story: "Traditional blue pottery technique passed down through generations",
    description: "Beautiful handcrafted pottery bowl made using traditional Jaipur blue pottery techniques. Each piece is unique and represents centuries of artistic heritage.",
    materials: ["Blue Clay", "Natural Glazes", "Copper Oxide"],
    rating: 5,
    reviews: 34
  },
  {
    name: "Bamboo Basket Set",
    price: 500,
    artisan: "Ramesh Kumar", 
    location: "Assam",
    story: "Sustainable bamboo weaving supporting local forest communities",
    description: "Eco-friendly bamboo basket set perfect for storage and organization. Handwoven by skilled artisans using sustainable bamboo harvesting practices.",
    materials: ["Bamboo", "Natural Dyes", "Cotton Binding"],
    rating: 4,
    reviews: 18
  },
  {
    name: "Silver Jhumka Earrings",
    price: 1200,
    artisan: "Meera Sharma",
    location: "Udaipur", 
    story: "Intricate silver work inspired by Rajasthani heritage",
    description: "Exquisite silver jhumka earrings featuring traditional Rajasthani motifs. Each piece is carefully crafted by master silversmiths.",
    materials: ["Sterling Silver", "Traditional Gemstones", "Gold Plating"],
    rating: 5,
    reviews: 27
  }
];

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<typeof featuredProducts[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: typeof featuredProducts[0]) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };
  return (
    
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
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

      {/* Featured Products */}
      <section id="products" className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Featured Artisan Products
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover unique handcrafted items from talented local artisans
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredProducts.map((product, index) => (
              <ProductCard 
                key={index} 
                {...product} 
                onClick={() => handleProductClick(product)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                <MessageCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Smart Discovery</h3>
              <p className="text-muted-foreground">
                Find products by price, location, or type through natural conversation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Artisan Support</h3>
              <p className="text-muted-foreground">
                Get guidance on listing products and building your marketplace presence
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                <ShoppingBag className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Direct Connection</h3>
              <p className="text-muted-foreground">
                Connect directly with artisans and learn the stories behind each craft
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      <section id="about">
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      </section>
    <Footer />
    </div>
    
  );
};

export default Index;
