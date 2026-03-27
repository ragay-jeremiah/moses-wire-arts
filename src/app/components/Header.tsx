import { ShoppingCart, Search, Menu, Settings } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent py-4 transition-all duration-500">
      <div className="w-full px-8 md:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity" onClick={onLogoClick}>
            <h1 className="font-serif text-2xl tracking-[0.2em] uppercase font-medium">Moses Wire Arts</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <a href="#" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Collections</a>
            <a href="#" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Featured</a>
            <a href="#" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">Artists</a>
            <a href="#" className="text-xs uppercase tracking-[0.15em] font-medium hover:opacity-50 transition-opacity">About</a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-6">
            {isAdmin && (
              <button
                onClick={onAdminClick}
                className="hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-black/40 hover:text-black transition-colors"
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
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] uppercase font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
          <div className="md:hidden py-8 absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-8 flex flex-col items-center">
            <nav className="flex flex-col space-y-6 text-center">
              <a href="#" className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Collections</a>
              <a href="#" className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Featured</a>
              <a href="#" className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Artists</a>
              <a href="#" className="text-sm uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">About</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}