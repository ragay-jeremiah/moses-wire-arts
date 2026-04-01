import { ShoppingCart, Search, Menu, Settings, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLogoClick?: () => void;
  isAdmin?: boolean;
  onAdminClick?: () => void;
}

export function Header({ cartCount, onCartClick, onLogoClick, isAdmin, onAdminClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md py-4 transition-all duration-500 border-b border-white/5">
      <div className="w-full px-8 md:px-16">
        <div className="flex items-center justify-between h-20 text-white">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity" onClick={onLogoClick}>
            <h1 className="font-serif text-2xl tracking-[0.2em] uppercase font-medium">Moses Wire Arts</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <a href="#shop-section" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Collections</a>
            <a href="#featured" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Featured</a>
            <a href="#artist" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Artists</a>
            <a href="https://m.me/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity flex items-center gap-2">
              <MessageCircle size={14} />
              Inquire
            </a>
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
            <button className="hover:opacity-50 transition-opacity">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button 
              onClick={onCartClick}
              className="hover:opacity-50 transition-opacity relative group"
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] uppercase font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
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
            <nav className="flex flex-col space-y-8 text-center text-white mb-10">
              <a href="#shop-section" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Collections</a>
              <a href="#featured" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Featured</a>
              <a href="#artist" onClick={() => setIsMenuOpen(false)} className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Artists</a>
              <a href="https://m.me/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Contact via Messenger</a>
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