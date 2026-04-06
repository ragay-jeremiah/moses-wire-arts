import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Grid, User, Shield, Inbox } from 'lucide-react';

interface NavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  onCartClick: () => void;
}

export function FixedBottomNav({ currentView, setCurrentView, onCartClick }: NavProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    const handleBump = () => {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 500);
    };
    window.addEventListener('vault-bump', handleBump);
    return () => window.removeEventListener('vault-bump', handleBump);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide immediately on downscroll, show on upscroll
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="md:hidden fixed bottom-6 left-6 right-6 z-50 overflow-hidden rounded-3xl"
        >
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-between px-6 py-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            {/* Premium Gold Glow Line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-20" />
            
            <button 
              onClick={() => {
                setCurrentView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'landing' ? 'text-white' : 'text-white/40'}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-bold">Home</span>
            </button>
            
            <button 
              onClick={() => {
                const gallery = document.getElementById('collections');
                gallery?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 transition-colors text-white/40`}
            >
              <Grid className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-bold">Gallery</span>
            </button>

            <button 
              onClick={() => {
                const artist = document.getElementById('artist');
                artist?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 transition-colors text-white/40`}
            >
              <User className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-bold">Artist</span>
            </button>

            <button 
              id="inquiry-bag-target-mobile"
              onClick={onCartClick}
              className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                isBumping ? 'scale-125 text-[#D4AF37]' : 'text-white/40'
              }`}
            >
              <div className={`p-2 rounded-full transition-all ${isBumping ? 'bg-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : ''}`}>
                <Inbox className="w-5 h-5" />
              </div>
              <span className="text-[8px] uppercase tracking-[0.1em] font-bold">Inquire</span>
            </button>

            <button 
              onClick={() => setCurrentView('admin')}
              className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'admin' ? 'text-white' : 'text-white/40'}`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-bold">Admin</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
