import { ShoppingBag, Menu, Settings, Instagram, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick?: () => void;
  isAdmin?: boolean;
  onAdminClick?: () => void;
}

export function Header({ cartCount, onCartClick, onLogoClick, isAdmin, onAdminClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-md py-4 border-b border-white/5 opacity-100 translate-y-0' 
        : 'bg-transparent py-6 opacity-0 -translate-y-full pointer-events-none'
    }`}>
      {/* Premium Gold Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-[60]" />

      <div className="w-full px-8 md:px-16">
        <div className="flex items-center justify-between h-20 text-white">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity" onClick={onLogoClick}>
            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.2em] uppercase font-medium">Moses Wire Arts</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a href="#collections" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Gallery</a>
            <a href="#featured" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Featured</a>
            <a href="#artist" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Artist</a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-4 border-r border-white/10 pr-6 mr-2">
              <a href="https://www.instagram.com/moseswireartworks/" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href="https://www.facebook.com/MosesRagay" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40 hover:text-white transition-colors"
                title="Admin Panel"
              >
                <Settings className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
            <button 
              id="inquiry-bag-target"
              onClick={onCartClick}
              className={`hover:opacity-50 transition-all duration-500 relative group p-2 rounded-full ${
                isBumping ? 'scale-125 bg-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 'scale-100'
              }`}
            >
              <ShoppingBag className={`w-5 h-5 md:w-6 md:h-6 stroke-[1.5] transition-colors ${isBumping ? 'text-[#D4AF37]' : 'text-white'}`} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={cartCount}
                  className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-[9px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-lg"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            <button 
              className="md:hidden hover:opacity-50 transition-opacity"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-12 absolute top-full left-0 right-0 bg-black/98 backdrop-blur-3xl border-b border-white/10 px-8 flex flex-col items-center shadow-2xl">
            <nav className="flex flex-col space-y-8 text-center text-white mb-10 w-full">
              <a href="#collections" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Gallery</a>
              <a href="#featured" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Featured</a>
              <a href="#artist" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Artist</a>
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onAdminClick?.();
                  }}
                  className="text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white transition-opacity flex items-center justify-center gap-2 pt-4 border-t border-white/5"
                >
                  <Settings size={14} />
                  Admin Console
                </button>
              )}
            </nav>
            
            <div className="flex gap-8 border-t border-white/10 pt-10 w-full justify-center">
              <a href="https://www.instagram.com/moseswireartworks/" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                <Instagram size={24} strokeWidth={1.5} />
              </a>
              <a href="https://www.facebook.com/MosesRagay" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">
                <Facebook size={24} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}