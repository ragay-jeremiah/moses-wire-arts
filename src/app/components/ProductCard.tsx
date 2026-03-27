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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onProductClick(product)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 mb-4 aspect-square">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-colors shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-3 rounded-full transition-colors shadow-lg ${
              isLiked
                ? 'bg-red-500 text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </motion.div>

        {/* Category badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-black">
          {product.category}
        </div>
      </div>

      {/* Product info */}
      <div className="text-center mt-6">
        <h3 className="font-serif text-2xl tracking-wide mb-2">{product.name}</h3>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-black/50 font-medium mb-3">by {product.artist}</p>
        <p className="font-serif text-lg italic text-black/70">${product.price.toLocaleString()}</p>
      </div>
    </motion.div>
  );
}