import { motion } from 'motion/react';
import { ShoppingCart, Heart } from 'lucide-react';
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
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
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
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-[#0a0a0a] border border-white/5 mb-3 md:mb-6 aspect-square shadow-xl md:shadow-2xl">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
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
              onAddToCart(product);
            }}
            className="bg-white text-black p-2 md:p-4 rounded-full hover:bg-white/90 transition-all hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            title="Reserve Selection"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 stroke-[2]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-2 md:p-4 rounded-full transition-all hover:scale-110 shadow-xl ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20 border border-white/10'
            }`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </motion.div>
 
        {/* Category badge */}
        <div className="absolute top-2 left-2 md:top-5 md:left-5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 md:px-4 md:py-1.5 text-[7px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-white/90 shadow-2xl z-10">
          {product.category}
        </div>
      </div>

      {/* Product info */}
      <div className="text-left md:px-2 space-y-1 md:space-y-2">
        <h3 className="font-serif text-[15px] leading-tight md:text-3xl tracking-tight text-white group-hover:text-white/80 transition-colors line-clamp-2 md:line-clamp-none">{product.name}</h3>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-0.5 md:gap-2">
          <p className="font-sans text-[7px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 font-semibold line-clamp-1">By {product.artist}</p>
          <p className="font-serif text-sm md:text-xl italic text-white/70">${product.price.toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
}