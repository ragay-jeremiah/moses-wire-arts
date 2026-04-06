import { X, Minus, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

interface InquiryItem extends Product {
  quantity: number;
}

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: InquiryItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function InquiryDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: InquiryDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-[#030303] border-l border-white/5 shadow-2xl z-50 flex flex-col text-[#FDFBF7] overflow-hidden"
          >
            {/* Premium Gold Glow Line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-20" />
            
            <div className="flex items-center justify-between p-8 border-b border-white/5 relative">
              {/* Header Glow Accent */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-serif tracking-tighter">Inquiry List</h2>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold mt-1">
                  {itemCount} {itemCount === 1 ? 'Selection' : 'Selections'} Reserved
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" strokeWidth={1} />
              </button>
            </div>

            {/* Inquiry Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-16 h-16 text-[#D4AF37]/20 mb-4" />
                  <p className="text-lg text-white/60 mb-2">Your inquiry list is empty</p>
                  <p className="text-sm text-white/30">Connect with Moses to begin your commission journey.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-none group hover:border-[#D4AF37]/20 transition-colors">
                      <div className="w-24 h-24 rounded-none overflow-hidden flex-shrink-0 border border-white/5">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover: -0 transition-all duration-700"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-serif tracking-tight mb-1 text-white/90">{item.name}</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-3">By {item.artist}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-white/10 rounded-none bg-black/20">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="p-2 hover:text-[#D4AF37] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-[10px] font-mono">{item.quantity}</span>
                            <button
                              onClick={() => {
                                if (item.quantity < 12) {
                                  onUpdateQuantity(item.id, item.quantity + 1);
                                }
                              }}
                              className={`p-2 transition-colors ${item.quantity >= 12 ? 'opacity-20 cursor-not-allowed' : 'hover:text-[#D4AF37]'}`}
                              title={item.quantity >= 12 ? "Maximum Limit Reached" : "Add Selection"}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-[10px] uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors ml-auto"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 space-y-6 bg-white/[0.02] border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/40 uppercase tracking-widest text-[9px]">Estimated Crafting Time</span>
                    <span className="font-serif italic text-[#D4AF37] text-lg">
                      {itemCount <= 2 ? (
                        `${itemCount * 7}-${itemCount * 10} Days`
                      ) : itemCount <= 8 ? (
                        `${Math.floor((itemCount * 7) / 7)}-${Math.ceil((itemCount * 10) / 7)} Weeks`
                      ) : (
                        `${Math.floor((itemCount * 7) / 30)}-${Math.ceil((itemCount * 10) / 30)} Months`
                      )}
                    </span>
                  </div>
                  
                  {itemCount > 3 && (
                    <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-none">
                      <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mb-1 italic">High Volume Commission</p>
                      <p className="text-[10px] leading-relaxed text-[#FDFBF7]/60 font-light">
                        This request exceeds standard individual crafting slots. Moses will provide a bespoke priority timeline during your discussion.
                      </p>
                    </div>
                  )}

                  {!itemCount || itemCount <= 3 && (
                    <p className="text-[10px] leading-relaxed text-white/30 font-light">
                      *Each piece is a singular labor of 7-10 days. Total timeline reflects cumulative hand-twisting of miles of wire.
                    </p>
                  )}
                </div>

                <a 
                  href={`https://m.me/MosesRagay?text=${encodeURIComponent(
                    `Hello Moses! I am interested in inquiring about the following works from your collection:\n\n${items.map(i => `- ${i.name} (Qty: ${i.quantity})`).join('\n')}\n\nI have noted the estimated ${
                      itemCount <= 2 ? `${itemCount * 7}-${itemCount * 10} Day` : 
                      itemCount <= 8 ? `${Math.floor((itemCount * 7) / 7)}-${Math.ceil((itemCount * 10) / 7)} Week` : 
                      `${Math.floor((itemCount * 7) / 30)}-${Math.ceil((itemCount * 10) / 30)} Month`
                    } crafting timeline. Are you currently accepting new commissions for this window?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#D4AF37] text-black py-5 text-center text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-all"
                >
                  Confirm Inquiry via Messenger
                </a>
                
                <button
                  onClick={onClose}
                  className="w-full text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                  Return to Gallery
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
