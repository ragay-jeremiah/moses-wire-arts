import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

interface CartItem extends Product {
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
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
            className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl">Shopping Cart</h2>
                <p className="text-sm text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-lg text-gray-600 mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-500">Add some beautiful wire art to your collection</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm mb-1 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-600 mb-2">by {item.artist}</p>
                        <p className="text-lg mb-3">${item.price.toLocaleString()}</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
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
              <div className="border-t p-6 space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <span>Subtotal</span>
                  <span className="text-2xl">${total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600">Shipping and taxes calculated at checkout</p>
                <button className="w-full bg-black text-white py-4 rounded-full hover:bg-gray-800 transition-colors">
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full border border-black py-4 rounded-full hover:bg-black hover:text-white transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
