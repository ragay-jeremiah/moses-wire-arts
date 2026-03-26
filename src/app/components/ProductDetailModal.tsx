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
                className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-colors shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative aspect-square md:aspect-auto bg-gray-100">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
                      {product.category}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 md:p-12 flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl mb-3">{product.name}</h2>
                      <p className="text-lg text-gray-600 mb-6">by {product.artist}</p>
                      <p className="text-4xl mb-8">${product.price.toLocaleString()}</p>

                      <div className="space-y-6 mb-8">
                        <div>
                          <h3 className="text-sm uppercase tracking-wider mb-3">Description</h3>
                          <p className="text-gray-600 leading-relaxed">
                            A stunning handcrafted wire sculpture that exemplifies contemporary artistry.
                            Each piece is meticulously crafted by Moises Ragay, combining traditional
                            wire-working techniques with modern design sensibilities. This unique creation
                            brings an elegant, artistic presence to any space.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="flex items-start gap-3">
                            <Ruler className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Dimensions</p>
                              <p className="text-sm text-gray-600">Custom sized</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Materials</p>
                              <p className="text-sm text-gray-600">Premium wire</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Authenticity</p>
                              <p className="text-sm text-gray-600">Certified original</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Package className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium">Shipping</p>
                              <p className="text-sm text-gray-600">Free worldwide</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`w-full border py-4 rounded-full transition-colors flex items-center justify-center gap-2 ${
                          isLiked
                            ? 'border-red-500 text-red-500 bg-red-50'
                            : 'border-black hover:bg-black hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Saved to Wishlist' : 'Add to Wishlist'}
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
