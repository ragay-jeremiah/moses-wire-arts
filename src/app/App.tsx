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
import { FixedBottomNav } from './components/FixedBottomNav';
import { fetchProducts } from '../lib/products';
import { fetchCategories, Category } from '../lib/categories';

// Lazy load heavy components
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const InquiryDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.InquiryDrawer })));
const ProductDetailModal = lazy(() => import('./components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal })));
import { FlyToVault } from './components/animations/FlyToVault';

interface InquiryItem extends Product {
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

  const [currentView, setCurrentView] = useState<'landing' | 'admin'>('landing');
  const [inquiryItems, setInquiryItems] = useState<InquiryItem[]>(() => {
    // Persistent Inquiry: Load from local browser storage on start
    const saved = localStorage.getItem('moses_wire_inquiry');
    return saved ? JSON.parse(saved) : [];
  });
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  // Auto-save Inquiry Vault to browser
  useEffect(() => {
    localStorage.setItem('moses_wire_inquiry', JSON.stringify(inquiryItems));
  }, [inquiryItems]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Sync fixed nav logic with showAdminPanel
  useEffect(() => {
    if (currentView === 'admin') setShowAdminPanel(true);
    else setShowAdminPanel(false);
  }, [currentView]);

  useEffect(() => {
    if (showAdminPanel) setCurrentView('admin');
    else setCurrentView('landing');
  }, [showAdminPanel]);

  // Group products by category, Trees first as flagship
  const groupedByCategory = (() => {
    const map = new Map<string, Product[]>();
    // Ensure Trees comes first
    const sorted = [...products].sort((a, b) => {
      const aIsTree = a.category.toLowerCase().includes('tree');
      const bIsTree = b.category.toLowerCase().includes('tree');
      if (aIsTree && !bIsTree) return -1;
      if (!aIsTree && bIsTree) return 1;
      return a.category.localeCompare(b.category);
    });
    for (const product of sorted) {
      const cat = product.category.trim();
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(product);
    }
    return Array.from(map.entries()); // [category, products[]]
  })();

  const handleAddToInquiry = (product: Product) => {
    const existing = inquiryItems.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= 12) {
        toast.error("Maximum commission limit reached (12 per piece).");
        return;
      }
      setInquiryItems(inquiryItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setInquiryItems([...inquiryItems, { ...product, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity > 12) {
      toast.error("Maximum commission limit is 12 pieces.");
      return;
    }
    if (quantity === 0) handleRemoveItem(id);
    else setInquiryItems(inquiryItems.map((item) => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (id: string) => setInquiryItems(inquiryItems.filter((item) => item.id !== id));
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const totalInquiryItems = inquiryItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen text-white bg-black font-sans">
      <FlyToVault />
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
      <div className="hidden md:block">
        <Header
          cartCount={totalInquiryItems}
          onCartClick={() => setIsInquiryOpen(true)}
          onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          isAdmin={!!adminUser}
          onAdminClick={() => setShowAdminPanel(true)}
        />
      </div>

      <FixedBottomNav 
        currentView={currentView}
        setCurrentView={setCurrentView}
        onCartClick={() => setIsInquiryOpen(true)}
      />

      <AnimatePresence mode="wait">
        {!showAdminPanel ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="pb-24 md:pb-0" // space for bottom nav
          >
        <HeroVideo onNavigateToShop={() => {
          document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
        }} />

        <section id="shop-section" className="py-32 px-6 relative z-10 bg-black flex items-center justify-center min-h-[70vh] m-0 overflow-hidden border-b border-white/5 border-t">
          {/* Vault Atmosphere: Golden Haze */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)] pointer-events-none opacity-60"></div>
          <div className="absolute w-[200vw] h-px bg-[#D4AF37]/5 rotate-12 -top-32 opacity-30"></div>
          <div className="absolute w-[200vw] h-px bg-[#D4AF37]/5 -rotate-12 bottom-32 opacity-30"></div>
          <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-white/5 via-white/5 to-transparent -translate-x-1/2 opacity-20 pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#D4AF37] mb-8 font-bold">The Meaning</p>
            <h3 className="font-serif text-3xl md:text-5xl tracking-tighter mb-10 text-[#FDFBF7] leading-tight drop-shadow-2xl">
              Every piece begins with <br className="hidden md:block"/><span className="text-[#FDFBF7]/60 italic font-light">a single wire.</span>
            </h3>
            <p className="font-sans text-[13px] md:text-sm leading-loose text-[#FDFBF7]/60 mb-8 max-w-xl mx-auto font-light">
              Shaped with patience, precision, and purpose. Inspired by growth and transformation, our creations reflect the beauty of becoming.
            </p>
            <p className="font-serif text-[15px] md:text-lg italic text-[#FDFBF7]/40 mb-8 md:mb-12">
              "From seed to sculpture, nothing is wasted."
            </p>
            {/* The Gold Wire Bridge (Glowing) */}
            <div className="relative w-[1.5px] h-32 md:h-56 mx-auto">
              <div className="absolute inset-0 bg-[#D4AF37] opacity-80" />
              <div className="absolute inset-0 bg-[#D4AF37] blur-[6px] opacity-40 animate-pulse" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#D4AF37]/10 blur-xl rounded-full" />
            </div>
          </motion.div>
        </section>
        
        <ArtistSection />

        {/* Featured Gallery Section - New PhotoStack showcase */}
        <section id="featured" className="w-full bg-black relative z-20">
          <PhotoStackDemo />
        </section>

        <section id="collections" className="py-24 md:py-32 max-w-[1500px] mx-auto relative z-10 block">
          {groupedByCategory.map(([category, categoryProducts], index) => {
            const isFirst = index === 0;
            const isTree = category.toLowerCase().includes('tree');
            return (
              <div key={category}>
                {/* Category Header */}
                <div className={`relative px-6 md:px-16 text-center ${isFirst ? 'mb-16 md:mb-24' : 'mb-12 md:mb-16'}`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent -translate-y-8 md:-translate-y-12" />
                  <p className={`text-[10px] tracking-[0.4em] uppercase mb-4 font-bold ${isFirst ? 'text-[#D4AF37]' : 'text-white/40'}`}>
                    {isFirst && isTree ? 'Signature Collection' : 'The Collection'}
                  </p>
                  <h2 className={`font-serif tracking-tight text-white ${isFirst ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`}>
                    {category}
                  </h2>
                  {isFirst && isTree && (
                    <p className="font-sans text-sm text-white/50 mt-6 max-w-xl mx-auto">
                      Where our story begins. Each piece grows intentionally from a solitary root into complex, sprawling mastery.
                    </p>
                  )}
                </div>

                {/* Product Grid */}
                <div className="w-full relative px-6 md:px-16">
                  <ProductGrid
                    products={categoryProducts}
                    onSelectForInquiry={handleAddToInquiry}
                    onProductClick={handleProductClick}
                  />
                </div>

                {/* Poetic Gold Divider between categories */}
                {index < groupedByCategory.length - 1 && (
                  <div className="w-full py-16 md:py-24 my-8 bg-[#0a0a0a] border-y border-white/5 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent mx-auto mb-8" />
                    <p className="font-serif text-xl md:text-3xl leading-relaxed text-[#FDFBF7]/40 max-w-2xl italic font-light">
                      "Each wire, a dedication. Each form, a story."
                    </p>
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-8" />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="py-32 px-6 md:px-16 border-t border-white/5 bg-[#050505]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-8">Secure Your Centerpiece</h2>
            <p className="font-sans text-white/60 text-sm leading-relaxed mb-12">
              Due to the immense 7-10 day labor required for each piece, commissions are fiercely limited to preserve quality and exclusivity. Secure yours today.
            </p>
            <a 
              href="https://m.me/MosesRagay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-12 py-5 bg-white text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-white/90 transition-colors"
            >
              Direct Message The Artist
            </a>
          </div>
        </section>

        <Footer />
      </motion.main>
      ) : (
        <motion.div
           key="admin"
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.5 }}
           className="pb-24 md:pb-0 min-h-screen"
        >
          {adminUser ? (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white/50"><Loader2 className="animate-spin w-8 h-8" /></div>}>
              <AdminPanel 
                onClose={() => setShowAdminPanel(false)} 
              />
            </Suspense>
          ) : (
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white/50"><Loader2 className="animate-spin w-8 h-8" /></div>}>
              <AdminLogin onClose={() => setShowAdminPanel(false)} />
            </Suspense>
          )}
        </motion.div>
        )}
      </AnimatePresence>

      {/* Inquiry & Product Modal (Lazy Loaded) ────────────────────────── */}
      <Suspense fallback={<LoadingOverlay />}>
        {isInquiryOpen && (
          <InquiryDrawer
            isOpen={isInquiryOpen}
            onClose={() => setIsInquiryOpen(false)}
            items={inquiryItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}

        {isProductModalOpen && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onSelectForInquiry={handleAddToInquiry}
          />
        )}
      </Suspense>
    </div>
  );
}
