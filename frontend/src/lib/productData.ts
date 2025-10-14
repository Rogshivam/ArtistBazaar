// Mock product database for Artist Bazaar
import terracottaVase from "@/assets/terracotta-vase.jpg";
import silverJhumka from "@/assets/silver-jhumka.jpg";
import cottonSaree from "@/assets/cotton-saree.jpg";
import rosewoodBox from "@/assets/rosewood-box.jpg";
import bambooWallHanging from "@/assets/bamboo-wall-hanging.jpg";
import clayKulhad from "@/assets/clay-kulhad.jpg";
import kundanNecklace from "@/assets/kundan-necklace.jpg";
import silkCushion from "@/assets/silk-cushion.jpg";
import teakTray from "@/assets/teak-tray.jpg";
import bambooLamp from "@/assets/bamboo-lamp.jpg";
import bluePottery from "@/assets/blue-pottery.jpg";
import silverAnklets from "@/assets/silver-anklets.jpg";
import woolenShawl from "@/assets/woolen-shawl.jpg";
import sandalwoodGanesha from "@/assets/sandalwood-ganesha.jpg";
import bambooBasket from "@/assets/bamboo-basket.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  artisan: string;
  location: string;
  tags: string[];
  url: string;
  imageUrl: string;
}

const rawProductData = [
  { _id: "1", name: "Hand-Painted Terracotta Vase", description: "A beautifully hand-painted terracotta vase...", category: "Pottery", price: 1200, tags: ["handmade", "traditional", "gift"], artisan: "Priya Sharma", location: "Jaipur, Rajasthan", images: [terracottaVase] },
  { _id: "2", name: "Silver Jhumka Earrings", description: "Elegant sterling silver jhumka earrings with detailed filigree work, ideal for festive occasions.", category: "Jewelry", price: 2500, tags: ["handmade", "traditional", "premium"], artisan: "Anita Desai", location: "Mumbai, Maharashtra", images: [silverJhumka] },
  { _id: "3", name: "Handwoven Cotton Saree", description: "A soft, handwoven cotton saree with vibrant block prints, showcasing traditional craftsmanship.", category: "Textiles", price: 3500, tags: ["handmade", "traditional", "eco"], artisan: "Lakshmi Nair", location: "Varanasi, Uttar Pradesh", images: [cottonSaree] },
  { _id: "4", name: "Rosewood Carved Jewelry Box", description: "A finely carved rosewood jewelry box with brass inlay, perfect for gifting or personal use.", category: "Woodwork", price: 1800, tags: ["handmade", "premium", "gift"], artisan: "Ramesh Patel", location: "Udaipur, Rajasthan", images: [rosewoodBox] },
  { _id: "5", name: "Bamboo Wall Hanging", description: "Eco-friendly bamboo wall hanging with intricate weaves, adding a rustic charm to any space.", category: "Bamboo", price: 900, tags: ["handmade", "eco", "gift"], artisan: "Sunita Das", location: "Guwahati, Assam", images: [bambooWallHanging] },
  { _id: "6", name: "Clay Kulhad Set (6 Pieces)", description: "Set of six handcrafted clay kulhads, perfect for serving tea or coffee in traditional style.", category: "Pottery", price: 600, tags: ["handmade", "traditional", "eco"], artisan: "Mohan Lal", location: "Khajuraho, Madhya Pradesh", images: [clayKulhad] },
  { _id: "7", name: "Kundan Necklace Set", description: "A luxurious kundan necklace set with matching earrings, crafted for bridal or festive wear.", category: "Jewelry", price: 4500, tags: ["handmade", "premium", "traditional"], artisan: "Neha Gupta", location: "Delhi", images: [kundanNecklace] },
  { _id: "8", name: "Embroidered Silk Cushion Covers", description: "Set of two silk cushion covers with hand-embroidered floral designs, adding elegance to your home.", category: "Textiles", price: 1100, tags: ["handmade", "premium", "gift"], artisan: "Suman Kaur", location: "Amritsar, Punjab", images: [silkCushion] },
  { _id: "9", name: "Teak Wood Serving Tray", description: "A sturdy teak wood serving tray with carved handles, ideal for serving guests in style.", category: "Woodwork", price: 2000, tags: ["handmade", "eco", "gift"], artisan: "Vijay Kumar", location: "Jodhpur, Rajasthan", images: [teakTray] },
  { _id: "10", name: "Bamboo Table Lamp", description: "A handcrafted bamboo table lamp with a minimalist design, perfect for eco-conscious homes.", category: "Bamboo", price: 1500, tags: ["handmade", "eco", "premium"], artisan: "Arjun Gogoi", location: "Dibrugarh, Assam", images: [bambooLamp] },
  { _id: "11", name: "Blue Pottery Wall Plate", description: "A decorative blue pottery wall plate with traditional motifs, ideal for home decor.", category: "Pottery", price: 800, tags: ["handmade", "traditional", "gift"], artisan: "Kavita Meena", location: "Jaipur, Rajasthan", images: [bluePottery] },
  { _id: "12", name: "Oxidized Silver Anklets", description: "Pair of oxidized silver anklets with delicate bells, perfect for daily or festive wear.", category: "Jewelry", price: 1800, tags: ["handmade", "traditional", "gift"], artisan: "Rekha Verma", location: "Ahmedabad, Gujarat", images: [silverAnklets] },
  { _id: "13", name: "Handwoven Woolen Shawl", description: "A warm, handwoven woolen shawl with intricate patterns, perfect for winter gifting.", category: "Textiles", price: 2800, tags: ["handmade", "traditional", "premium"], artisan: "Tenzin Dolma", location: "Leh, Ladakh", images: [woolenShawl] },
  { _id: "14", name: "Sandalwood Carved Idol", description: "A hand-carved sandalwood idol of Lord Ganesha, crafted with precision for spiritual decor.", category: "Woodwork", price: 3200, tags: ["handmade", "premium", "gift"], artisan: "Suresh Rao", location: "Mysore, Karnataka", images: [sandalwoodGanesha] },
  { _id: "15", name: "Bamboo Storage Basket", description: "A versatile bamboo storage basket with natural weaves, ideal for organizing household items.", category: "Bamboo", price: 700, tags: ["handmade", "eco", "gift"], artisan: "Meena Borah", location: "Imphal, Manipur", images: [bambooBasket] },
];

const createUrlSlug = (name: string, id: string) => {
  return "https://artistbazaar.vercel.app/products";
};

export const mockProductData: Product[] = rawProductData.map((p) => ({
  id: p._id,
  name: p.name.replace(/<\/?selection-tag>/g, ""),
  description: p.description,
  price: "" + p.price.toLocaleString("en-IN"),
  category: p.category,
  artisan: p.artisan,
  location: p.location,
  tags: p.tags,
  url: createUrlSlug(p.name, p._id),
  imageUrl: p.images?.[0] || "https://placehold.co/100x100/E5E7EB/000000?text=Art",
}));
