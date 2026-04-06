import { motion } from 'motion/react';
import { MessageSquarePlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  artist: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  dimensions?: string;
  materials?: string;
  authenticity?: string;
  shipping?: string;
  size?: string;
  madeToOrder?: boolean;
  isAvailable?: boolean;
  storagePath?: string;
}

interface ProductCardProps {
  product: Product;
  onSelectForInquiry: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onSelectForInquiry, onProductClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
    >
      <div className="relative overflow-hidden md:rounded-2xl bg-black/20 backdrop-blur-sm border-y md:border border-[#D4AF37]/10 mb-4 md:mb-6 aspect-[4/5] md:aspect-square shadow-xl md:shadow-2xl">
        {/* Atmospheric Bloom (Branding) */}
        <motion.div
           animate={{ 
             opacity: isHovered ? 0.4 : 0.1,
             scale: isHovered ? 1.2 : 0.8
           }}
           transition={{ duration: 1.2, ease: "easeOut" }}
           className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#D4AF37_0%,_transparent_70%)] pointer-events-none z-0"
        />

        {/* Premium Top Glow Line on Hover */}
        <motion.div
           animate={{ opacity: isHovered ? 0.4 : 0 }}
           className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent z-20 pointer-events-none"
        />

        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105   opacity-80 group-hover:opacity-100 relative z-10"
          loading="lazy"
        />
        
        {/* Overlay buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] md:backdrop-blur-md flex flex-row items-center justify-center gap-2 md:gap-4 z-10"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectForInquiry(product);
              window.dispatchEvent(new CustomEvent('fly-to-vault', { 
                detail: { x: e.clientX, y: e.clientY } 
              }));
            }}
            className="bg-[#D4AF37] text-black p-2 md:p-4 rounded-full hover:bg-white transition-all hover:scale-110 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            title="Select for Inquiry"
          >
            <MessageSquarePlus className="w-4 h-4 md:w-5 md:h-5 stroke-[2]" />
          </button>
        </motion.div>
 
        <div className="absolute top-4 left-4 md:top-5 md:left-5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 md:px-4 md:py-1.5 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-white/90 shadow-2xl z-10">
          {product.category}
        </div>
        </div>

      {/* Product info - Feed Style */}
      <div className="text-left px-1 md:px-2 flex flex-col justify-between h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1 md:gap-4 mb-3">
          <div>
            <h3 className="font-serif text-sm leading-tight md:text-3xl tracking-tight text-white group-hover:text-white/80 transition-colors line-clamp-2">{product.name}</h3>
            <p className="font-sans text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 mt-0.5 font-semibold">By {product.artist}</p>
          </div>
          <p className="font-serif text-sm md:text-xl text-[#D4AF37] whitespace-nowrap mt-1 md:mt-0">₱{product.price.toLocaleString()}</p>
        </div>
        
        <div className="md:hidden mt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSelectForInquiry(product);
              window.dispatchEvent(new CustomEvent('fly-to-vault', { 
                detail: { x: e.clientX, y: e.clientY } 
              }));
            }}
            className="flex items-center justify-center w-full py-2.5 bg-white/5 border border-white/10 text-white text-[8px] uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-colors"
          >
            Inquire
          </button>
        </div>
      </div>
    </motion.div>
  );
}