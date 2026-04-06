import * as React from "react";
import { PhotoStackCard } from "../../components/ui/image-showcase";
import { PhotoStackDetail } from "./PhotoStackDetail";
import { motion } from "motion/react";
import { cn } from "./ui/utils";
import { fetchProducts, Product } from "../../lib/products";

// We map Product to the shape expected by PhotoStackCard & Detail
type MappedProduct = {
  images: string[];
  category: string;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  artist: string;
  dimensions: string;
  materials: string;
  authenticity: string;
  shipping: string;
};

export default function PhotoStackCardDemo() {
  const [products, setProducts] = React.useState<MappedProduct[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(1);
  const [selectedItem, setSelectedItem] = React.useState<MappedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function getProducts() {
      try {
        const data = await fetchProducts();
        // Since it's a showcase stack, display the top 3 items
        const topProducts = data.slice(0, 3).map(prod => ({
          images: prod.images && prod.images.length > 0 ? prod.images : [prod.image],
          category: prod.category || "ART",
          title: prod.name,
          subtitle: prod.artist,
          price: prod.price,
          description: prod.description || "",
          artist: prod.artist || "Moises Ragay",
          dimensions: prod.dimensions || "Custom sized",
          materials: prod.materials || "Premium wire",
          authenticity: prod.authenticity || "Certified original",
          shipping: prod.shipping || "Free worldwide",
        }));
        setProducts(topProducts);
      } catch (err) {
        console.error("Failed to load products for showcase", err);
      }
    }
    getProducts();
  }, []);

  const handleCardClick = (item: MappedProduct, index: number) => {
    setActiveIndex(index);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full py-32 flex flex-col items-center justify-center bg-transparent">
      {/* Section Header */}
      <div className="text-center mb-24 px-6">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 0.4, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.4em] font-medium mb-4"
        >
          Curated Series
        </motion.p>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-serif text-white tracking-tight"
        >
          The Master Sets
        </motion.h2>
      </div>

      <div className="relative flex h-[35rem] w-full max-w-5xl items-center justify-center px-4 md:px-0">
        {products.map((mem, index) => (
          <motion.div
            key={mem.title}
            className="absolute"
            initial={false}
            animate={{
               x: 0, // Fallback for mobile
               translateX: typeof window !== 'undefined' && window.innerWidth > 768 ? (index - 1) * 320 : 0,
               scale: index === activeIndex ? 1 : 0.85,
               opacity: index === activeIndex ? 1 : 0.6,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
                zIndex: index === activeIndex ? 20 : 10,
            }}
          >
            <PhotoStackCard
              images={mem.images}
              title={mem.title}
              subtitle={mem.subtitle}
              category={mem.category}
              isActive={index === activeIndex}
              onClick={() => handleCardClick(mem, index)}
              className={index !== activeIndex ? "hidden md:flex opacity-40" : "flex"}
            />
          </motion.div>
        ))}
      </div>

      {/* Navigation dots for the stack on mobile */}
      <div className="flex md:hidden gap-3 mt-12">
        {products.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-2 h-2 rounded-full transition-all cursor-pointer",
              i === activeIndex ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"
            )}
            onClick={() => setActiveIndex(i)} 
          />
        ))}
      </div>

      <PhotoStackDetail 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedItem}
      />
    </div>
  );
}
