import { useState } from 'react';
import { Header } from './components/Header';
import { TreeScrollytelling } from './components/TreeScrollytelling';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Product } from './components/ProductCard';
import { ProductGrid } from './components/ProductGrid';

interface CartItem extends Product {
  quantity: number;
}

// Mock product data
const products: Product[] = [
  {
    id: '1',
    name: 'Ethereal Dreams',
    artist: 'Moises Ragay',
    price: 2450,
    image: 'https://images.unsplash.com/photo-1758557839522-7d6150265d39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlJTIwYXJ0JTIwc2N1bHB0dXJlJTIwbWV0YWx8ZW58MXx8fHwxNzc0MTc2MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Abstract',
  },
  {
    id: '2',
    name: 'Golden Flow',
    artist: 'Moises Ragay',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1758800367555-94e5b085597b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHdpcmUlMjBzY3VscHR1cmUlMjBnb2xkZW58ZW58MXx8fHwxNzc0MTc2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Abstract',
  },
  {
    id: '3',
    name: 'Mesh Harmony',
    artist: 'Moises Ragay',
    price: 1650,
    image: 'https://images.unsplash.com/photo-1718463382422-8b9449599ed8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRhbCUyMHdpcmUlMjBtZXNoJTIwYXJ0fGVufDF8fHx8MTc3NDE3NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Geometric',
  },
  {
    id: '4',
    name: 'Copper Waves',
    artist: 'Moises Ragay',
    price: 2100,
    image: 'https://images.unsplash.com/photo-1758560534921-07ea719ab8d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3BwZXIlMjB3aXJlJTIwc2N1bHB0dXJlJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzc0MTc2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Organic',
  },
  {
    id: '5',
    name: 'Minimalist Lines',
    artist: 'Moises Ragay',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1770573215406-c392122436b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2lyZSUyMGFydCUyMG1vZGVybnxlbnwxfHx8fDE3NzQxNzYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Minimal',
  },
  {
    id: '6',
    name: 'Steel Sculpture',
    artist: 'Moises Ragay',
    price: 2850,
    image: 'https://images.unsplash.com/photo-1759390304919-eec9e37f5030?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMHdpcmUlMjBzY3VscHR1cmUlMjBjb250ZW1wb3Jhcnl8ZW58MXx8fHwxNzc0MTc2MTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Geometric',
  },
  {
    id: '7',
    name: 'Geometric Poetry',
    artist: 'Moises Ragay',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1731850040444-5194b805f2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjB3aXJlJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc3NDE3NjE2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Geometric',
  },
  {
    id: '8',
    name: 'Handcrafted Spirit',
    artist: 'Moises Ragay',
    price: 1750,
    image: 'https://images.unsplash.com/photo-1759153748331-f33556c4e69e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdpcmUlMjBzY3VscHR1cmUlMjBjcmFmdHxlbnwxfHx8fDE3NzQxNzYxNjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'Organic',
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'shop'>('landing');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen text-black bg-[#Fcfcfc]">
      {currentView === 'landing' ? (
        <main>
          <TreeScrollytelling onNavigateToShop={() => {
            window.scrollTo(0, 0);
            setCurrentView('shop');
          }} />
        </main>
      ) : (
        <>
          <Header 
            cartCount={totalCartItems} 
            onCartClick={() => setIsCartOpen(true)} 
            onLogoClick={() => setCurrentView('landing')} 
          />
          
          <main className="pt-24">
            {/* Made to Order Shop Section */}
            <section id="shop-section" className="py-20 px-6 md:px-16 max-w-[1400px] mx-auto min-h-screen">
              <div className="max-w-3xl mx-auto text-center mb-24">
                <h3 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">
                  The Anatomy of Time.
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed text-black/70 mb-12">
                  We don't manufacture products; we cultivate heirlooms. Each Moses Wire Arts sculpture is grown by hand, weaving miles of raw metal thread into breathing, organic forms over hundreds of hours. Exclusively made-to-order, your piece is a singular study of nature's resilience. Claim a fragment of eternity for your space.
                </p>
                <div className="w-px h-24 bg-black/20 mx-auto"></div>
              </div>
              
              <ProductGrid products={filteredProducts} onProductClick={handleProductClick} onAddToCart={handleAddToCart} />
            </section>
          </main>
        </>
      )}

      {/* Modals and Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
