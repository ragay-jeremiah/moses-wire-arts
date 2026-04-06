import { X, MessageSquarePlus, Ruler, Package, Shield, Info } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForInquiry: (product: Product) => void;
}

export function ProductDetailModal({ product, isOpen, onClose, onSelectForInquiry }: ProductDetailModalProps) {

  if (!product) return null;

  const handleSelectForInquiry = () => {
    onSelectForInquiry(product);
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
                  className="absolute top-4 right-4 z-20 p-2 bg-black/40 backdrop-blur-md hover:bg-black/80 text-white rounded-full transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Container - Shrunk for Mobile */}
                  <div className="relative aspect-[3/2] md:aspect-auto bg-black overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 text-[8px] uppercase tracking-[0.2em] font-medium text-[#D4AF37]">
                      {product.category}
                    </div>
                  </div>

                  {/* Details - Compressed for Mobile */}
                  <div className="p-6 md:p-12 flex flex-col justify-center">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="font-serif text-2xl md:text-5xl tracking-tight text-[#FDFBF7]">{product.name}</h2>
                        <p className="font-serif text-xl md:text-3xl italic text-[#D4AF37] opacity-90">₱{product.price.toLocaleString()}</p>
                      </div>
                      <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-[#FDFBF7]/30 font-medium mb-6">Masterpiece by {product.artist}</p>

                      <div className="space-y-6 mb-8">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-[#D4AF37]/60">
                            <Info size={12} />
                            <h3 className="font-sans text-[9px] uppercase tracking-[0.2em] font-bold">The Narrative</h3>
                          </div>
                          <p className="text-[#FDFBF7]/50 leading-relaxed font-sans text-[12px] md:text-base font-light italic">
                            {product.description || 'Each piece is meticulously crafted over hundreds of hours, weaving raw metal wire into organic breathing forms.'}
                          </p>
                        </div>

                        {/* Desktop Only Details / Smaller Mobile Grid */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-3.5 h-3.5 text-[#D4AF37]/40" />
                            <span className="text-[10px] md:text-sm text-white/60">{product.dimensions || 'Custom Size'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-[#D4AF37]/40" />
                            <span className="text-[10px] md:text-sm text-white/60">{product.materials || 'Premium Wire'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 mt-4">
                      <button
                        onClick={(e) => {
                          handleSelectForInquiry();
                          window.dispatchEvent(new CustomEvent('fly-to-vault', { 
                            detail: { x: e.clientX, y: e.clientY } 
                          }));
                        }}
                        className="w-full bg-[#D4AF37] text-black py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-3 rounded-none"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        Select for Inquiry
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
