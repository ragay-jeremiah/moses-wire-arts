import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl tracking-tight">Moses Wire Arts</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm hover:text-gray-600 transition-colors">Collections</a>
            <a href="#" className="text-sm hover:text-gray-600 transition-colors">Featured</a>
            <a href="#" className="text-sm hover:text-gray-600 transition-colors">Artists</a>
            <a href="#" className="text-sm hover:text-gray-600 transition-colors">About</a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onCartClick}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-sm hover:text-gray-600 transition-colors">Collections</a>
              <a href="#" className="text-sm hover:text-gray-600 transition-colors">Featured</a>
              <a href="#" className="text-sm hover:text-gray-600 transition-colors">Artists</a>
              <a href="#" className="text-sm hover:text-gray-600 transition-colors">About</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}