import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Header } from './components/Header';
import { TreeScrollytelling } from './components/TreeScrollytelling';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Product } from './components/ProductCard';
import { ProductGrid } from './components/ProductGrid';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPanel } from './components/admin/AdminPanel';
import { fetchProducts } from '../lib/products';
import { CircularGallery, GalleryItem } from '../components/ui/circular-gallery';

const FAKE_GALLERY_DATA: GalleryItem[] = [
  {
    common: 'Lion',
    binomial: 'Panthera leo',
    photo: { url: 'https://images.unsplash.com/photo-1583499871880-de841d1ace2a?w=900&auto=format&fit=crop&q=80', text: 'lion', by: 'Clément Roy' }
  },
  {
    common: 'Asiatic elephant',
    binomial: 'Elephas maximus',
    photo: { url: 'https://images.unsplash.com/photo-1571406761758-9a3eed5338ef?w=900&auto=format&fit=crop&q=80', text: 'elephant', by: 'Alex Azabache' }
  },
  {
    common: 'Giant panda',
    binomial: 'Ailuropoda melanoleuca',
    photo: { url: 'https://images.unsplash.com/photo-1659540181281-1d89d6112832?w=900&auto=format&fit=crop&q=80', text: 'panda', by: 'Jiachen Lin' }
  },
  {
    common: 'Polar bear',
    binomial: 'Ursus maritimus',
    photo: { url: 'https://images.unsplash.com/photo-1589648751789-c8ecb7a88bd5?w=900&auto=format&fit=crop&q=80', text: 'polar bear', by: 'Hans-Jurgen Mager' }
  },
  {
    common: 'Cheetah',
    binomial: 'Acinonyx jubatus',
    photo: { url: 'https://images.unsplash.com/photo-1541707519942-08fd2f6480ba?w=900&auto=format&fit=crop&q=80', text: 'cheetah', by: 'Mike Bird' }
  }
];

// Firestore Product type maps 1-to-1 with the existing Product interface
// so no re-typing needed.

interface CartItem extends Product {
  quantity: number;
}

// Secret key sequence to open admin login: press Shift+A three times
const ADMIN_KEY = 'AAA';

export default function App() {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [keyBuffer, setKeyBuffer] = useState('');

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      if (!user) {
        setShowAdminPanel(false);
      }
    });
    return () => unsub();
  }, []);

  // Secret keyboard shortcut: Shift+A × 3 to open admin login
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'A') {
        const next = (keyBuffer + 'A').slice(-3);
        setKeyBuffer(next);
        if (next === ADMIN_KEY) {
          setKeyBuffer('');
          if (adminUser) {
            setShowAdminPanel(true);
          } else {
            setShowAdminLogin(true);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyBuffer, adminUser]);

  // ─── Mobile Admin Login Methods ───────────────────────────────────────────
  // 1. Secret URL parameter `?admin=login`
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'login') {
      if (adminUser) {
        setShowAdminPanel(true);
      } else {
        setShowAdminLogin(true);
      }
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.replaceState({}, '', url);
    }
  }, [adminUser]);

  // 2. Secret Tap Zone: Tap bottom-left corner 5 times rapidly
  const [tapCount, setTapCount] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const handler = (e: TouchEvent) => {
      const touch = e.touches[0];
      // Bottom-left corner hit area (80x80 pixels)
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

  // ─── Products (Firestore) ─────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const loadProducts = async () => {
    try {
      const list = await fetchProducts();
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products from Firestore:', err);
    } finally {
      setProductsLoaded(true);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // ─── Shop & Cart ──────────────────────────────────────────────────────────
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
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
    } else {
      setCartItems(cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ));
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
            isAdmin={!!adminUser}
            onAdminClick={() => setShowAdminPanel(true)}
          />

          <main>
            {/* Intro text */}
            <section id="shop-section" className="py-20 px-6 md:px-16 max-w-[1400px] mx-auto pt-32">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h3 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">
                  The Anatomy of Time.
                </h3>
                <p className="font-sans text-sm md:text-base leading-relaxed text-black/70 mb-12">
                  We don't manufacture products; we cultivate heirlooms. Each Moses Wire Arts sculpture is grown by hand, weaving miles of raw metal thread into breathing, organic forms over hundreds of hours. Exclusively made-to-order, your piece is a singular study of nature's resilience. Claim a fragment of eternity for your space.
                </p>
                <div className="w-px h-24 bg-black/20 mx-auto"></div>
              </div>
            </section>

            {/* Circular Gallery Section */}
            {!productsLoaded ? (
              <div className="flex items-center justify-center py-32 text-black/30">
                <p className="text-sm uppercase tracking-[0.3em]">Loading collection…</p>
              </div>
            ) : (
              <div className="w-full bg-[#Fcfcfc] text-black" style={{ height: '300vh' }}>
                <div className="w-full h-screen sticky top-0 flex flex-col items-center justify-center overflow-hidden">
                  <div className="text-center mb-8 absolute top-24 z-10 pointer-events-none">
                    <p className="text-xs uppercase tracking-[0.3em] text-black/50">Scroll to rotate</p>
                  </div>
                  <div className="w-full h-full">
                    <CircularGallery 
                      items={
                        products.length > 0 
                          ? filteredProducts.map(p => ({
                              id: p.id,
                              common: p.name,
                              binomial: `$${p.price.toLocaleString()}`,
                              photo: { url: p.image, text: p.name, by: p.artist }
                            }))
                          : FAKE_GALLERY_DATA
                      } 
                      onItemClick={(item) => {
                        if (item.id) {
                          const product = products.find(p => p.id === item.id);
                          if (product) handleProductClick(product);
                        } else if (adminUser) {
                           // If clicking a fake item and admin, show panel to encourage adding real ones
                           setShowAdminPanel(true);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* ─── Cart & Product Modal ──────────────────────────────────────── */}
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

      {/* ─── Admin ────────────────────────────────────────────────────── */}
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
            loadProducts(); // Refresh products after admin makes changes
          }}
        />
      )}
    </div>
  );
}
