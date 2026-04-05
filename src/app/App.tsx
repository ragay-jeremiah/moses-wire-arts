import { useState, useEffect, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Toaster, toast } from 'react-hot-toast';
import { MessageCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HeroVideo } from './components/HeroVideo';
import { ArtistSection } from './components/ArtistSection';
import { Footer } from './components/Footer';
import PhotoStackDemo from './components/PhotoStackDemo';
import { Product } from './components/ProductCard';
import { ProductGrid } from './components/ProductGrid';
import { fetchProducts } from '../lib/products';
import { fetchCategories, Category } from '../lib/categories';

// Lazy load heavy components
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const CartDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));

interface CartItem extends Product {
  quantity: number;
}

const ADMIN_KEY = 'AAA';

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-t-2 border-white/20 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white animate-pulse" />
      </div>
    </div>
    <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium">Synchronizing Artifacts...</p>
  </div>
);

export default function App() {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      if (!user) setShowAdminPanel(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        const next = (keyBuffer + 'A').slice(-3);
        setKeyBuffer(next);
        if (next === ADMIN_KEY) {
          setKeyBuffer('');
          if (adminUser) setShowAdminPanel(true);
          else setShowAdminLogin(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyBuffer, adminUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'login') {
      if (adminUser) setShowAdminPanel(true);
      else setShowAdminLogin(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url);
    }
  }, [adminUser]);

  const [tapCount, setTapCount] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handler = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX < 80 && touch.clientY > window.innerHeight - 80) {
        setTapCount(prev => {
          const next = prev + 1;
          if (next >= 5) {
            if (adminUser) setShowAdminPanel(true);
            else setShowAdminLogin(true);
            return 0;
          }
          return next;
        });
        clearTimeout(timeout);
        timeout = setTimeout(() => setTapCount(0), 1500);
      } else {
        setTapCount(0);
      }
    };
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('touchstart', handler);
      clearTimeout(timeout);
    };
  }, [adminUser]);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadProductsAndCategories = async () => {
    try {
      const [productList, categoryList] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      console.error('Failed to load data from Firestore:', err);
    } finally {
      setProductsLoaded(true);
    }
  };

  useEffect(() => { loadProductsAndCategories(); }, []);

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
    const existing = cartItems.find((item) => item.id === product.id);
    if (existing) {
      setCartItems(cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to reservation.`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) handleRemoveItem(id);
    else setCartItems(cartItems.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (id: string) => setCartItems(cartItems.filter((item) => item.id !== id));
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen text-white bg-black font-sans">
      <Toaster 
        position="bottom-center" 
        toastOptions={{ 
          style: { 
            background: '#111', 
            color: '#fff', 
            fontSize: '12px', 
            border: '1px solid rgba(255,255,255,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          } 
        }} 
      />
      
      <Header
        cartCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        isAdmin={!!adminUser}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      <main>
        <HeroVideo onNavigateToShop={() => {
          document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <section id="shop-section" className="py-24 px-6 md:px-16 max-w-[1400px] mx-auto pt-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h3 className="font-serif text-4xl md:text-5xl tracking-tight mb-8 text-white">
              The Anatomy of Time.
            </h3>
            <p className="font-sans text-sm md:text-base leading-relaxed text-white/70 mb-12">
              We don't manufacture products; we cultivate heirlooms. Each Moses Wire Arts sculpture is grown by hand, weaving miles of raw metal thread into breathing, organic forms over hundreds of hours. Exclusively made-to-order, your piece is a singular study of nature's resilience. Claim a fragment of eternity for your space.
            </p>
            <div className="flex justify-center gap-6 mb-12">
              <a 
                href="https://m.me/MosesRagay"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-[0.3em] font-medium hover:bg-white/10 transition-colors rounded-full"
              >
                Inquire via Messenger
              </a>
            </div>
            <div className="w-px h-24 bg-white/20 mx-auto"></div>
          </div>
        </section>

        <ArtistSection />

        {/* Featured Gallery Section - New PhotoStack showcase */}
        <section id="featured" className="w-full bg-black relative z-20">
          <PhotoStackDemo />
        </section>

        <section id="collections" className="py-24 md:py-32 px-6 md:px-16 max-w-[1500px] mx-auto relative z-10 block">
          
          <div className="mb-12">
            <p className="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-4">Complete Series</p>
            <h2 className="text-4xl md:text-6xl font-serif text-white tracking-tight">The Modern Gallery</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 relative items-start">
            
            {/* Category Sidebar (Desktop) & Scrollable Bar (Mobile) */}
            <div className="w-full md:w-48 lg:w-64 md:sticky md:top-32 flex-shrink-0 z-20 bg-black/80 md:bg-transparent py-4 md:py-0 border-b border-white/10 md:border-b-0 -mx-6 px-6 md:mx-0 md:px-0 sticky top-20 backdrop-blur-xl md:backdrop-blur-none">
              <div className="flex flex-row md:flex-col gap-4 md:gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x">
                
                <button
                   onClick={() => setSelectedCategory('All')}
                   className={`snap-start whitespace-nowrap text-left px-5 py-3 md:px-4 md:py-3 rounded-full md:rounded-xl text-sm transition-all border ${
                     selectedCategory === 'All'
                       ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold'
                       : 'bg-[#111] text-white/60 hover:text-white hover:bg-[#222] border-white/5 font-medium'
                   }`}
                >
                  All Artworks
                </button>
                
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`snap-start whitespace-nowrap text-left px-5 py-3 md:px-4 md:py-3 rounded-full md:rounded-xl text-sm transition-all border ${
                      selectedCategory === cat.name
                        ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold'
                        : 'bg-[#111] text-white/60 hover:text-white hover:bg-[#222] border-white/5 font-medium'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Gallery Grid Area */}
            <div className="flex-1 w-full min-w-0">
              <ProductGrid 
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            </div>
          </div>
        </section>

        <section className="py-32 px-6 md:px-16 border-t border-white/5 bg-[#050505]">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="font-serif text-4xl md:text-7xl mb-8 text-white leading-tight">Bring Moises' artistry <br/>to your sanctuary.</h2>
              <p className="text-white/50 text-sm md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed font-sans">
                Every sculpture is a unique journey. For custom commissions, worldwide shipping inquiries, or private viewings, reach out directly.
              </p>
              <a 
                href="https://m.me/MosesRagay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-200 transition-all rounded-full transform hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              >
                <MessageCircle size={18} />
                Start Inquiring Now
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ─── Cart & Product Modal (Lazy Loaded) ────────────────────────── */}
      <Suspense fallback={<LoadingOverlay />}>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {isProductModalOpen && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onAddToCart={handleAddToCart}
          />
        )}

        {showAdminLogin && (
          <AdminLogin 
            onClose={() => setShowAdminLogin(false)} 
            onSuccess={() => {
              setShowAdminLogin(false);
              setShowAdminPanel(true);
            }}
          />
        )}

        {showAdminPanel && adminUser && (
          <AdminPanel
            onClose={() => {
              setShowAdminPanel(false);
              loadProducts();
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
