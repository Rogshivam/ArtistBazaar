import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import Navbar from "@/components/Navbar";

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images?: string[];
  tags?: string[];
}

export default function Products() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const availableCategories = ["Pottery", "Jewelry", "Textiles", "Woodwork", "Bamboo"];
  const availableTags = ["handmade", "traditional", "eco", "gift", "premium"];

  const selectedTagSet = useMemo(() => new Set(tags), [tags]);

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_URL as string;
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (tags.length) params.set("tags", tags.join(","));
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page", String(p));
      params.set("limit", "24");
      const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(json.items || []);
        setPage(json.page || 1);
        setPages(json.pages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTag = (tag: string) => {
    setTags(prev => selectedTagSet.has(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="min-h-screen bg-foreground/5">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end mb-6">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Search</label>
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search handmade products..." />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Category</label>
            <select className="w-48 h-10 rounded-md border bg-background" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All</option>
              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(t => (
              <button key={t} onClick={() => toggleTag(t)} className={`px-3 py-2 rounded-md border text-sm ${selectedTagSet.has(t) ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                #{t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input className="w-28" type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            <Input className="w-28" type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          </div>
          <Button onClick={() => fetchProducts(1)} disabled={loading}>Apply</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p => (
            <ProductCard
              key={p._id}
              id={p._id}
              name={p.name}
              price={p.price}
              artisan={"Local Artisan"}
              location={p.category}
              story={p.description}
            />
          ))}
        </div>

        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="outline" disabled={page <= 1 || loading} onClick={() => fetchProducts(page - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages || loading} onClick={() => fetchProducts(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}


