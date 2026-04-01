import { X, ShoppingCart, Heart, Ruler, Package, Shield } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative bg-[#111] border border-white/10 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden text-white"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md hover:bg-black/80 text-white rounded-full transition-colors shadow-lg border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative aspect-square md:aspect-auto bg-black">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-white">
                      {product.category}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                      <h2 className="font-serif text-3xl md:text-5xl mb-2">{product.name}</h2>
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/50 font-medium mb-6">by {product.artist}</p>
                      <p className="font-serif text-3xl italic text-white/70 mb-8">${product.price.toLocaleString()}</p>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="font-sans text-[10px] uppercase tracking-[0.2em] font-medium text-white/90 mb-3">The Story</h3>
                          <p className="text-white/60 leading-relaxed font-sans text-sm md:text-base">
                            {product.description || 'Each piece is meticulously crafted over hundreds of hours, weaving raw metal wire into organic breathing forms. Made exclusively to order, this intricate study of nature\'s resilience brings an elegant, timeless artistic presence to any space.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          <div className="flex items-start gap-3">
                            <Ruler className="w-5 h-5 text-white/40 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Dimensions</p>
                              <p className="text-sm text-white/60">{product.dimensions || 'Custom sized'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-white/40 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Materials</p>
                              <p className="text-sm text-white/60">{product.materials || 'Premium wire'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-white/40 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Authenticity</p>
                              <p className="text-sm text-white/60">{product.authenticity || 'Certified original'}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-white/40 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Shipping</p>
                              <p className="text-sm text-white/60">{product.shipping || 'Free worldwide'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-white text-black py-5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/80 transition-all duration-500 flex items-center justify-center gap-3 rounded-xl"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Reserve Your Piece
                      </button>
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`w-full border py-5 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-500 flex items-center justify-center gap-3 rounded-xl ${
                          isLiked
                            ? 'border-white text-white bg-white/5'
                            : 'border-white/20 text-white hover:bg-white/5'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Saved' : 'Save Piece'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
