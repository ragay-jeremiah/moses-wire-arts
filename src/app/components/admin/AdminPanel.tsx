import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Plus, Pencil, Trash2, LogOut, Loader2, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../../firebase';
import { fetchProducts, deleteProduct, Product } from '../../../lib/products';
import { ProductForm } from './ProductForm';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  // undefined = closed, null = adding new, Product = editing existing

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await fetchProducts();
      setProducts(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, product.storagePath);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setEditingProduct(undefined);
    loadProducts();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-[#fafafa] shadow-2xl z-[160] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-white">
          <div>
            <p className="font-serif text-lg">Admin Panel</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 font-medium">
              Moses Wire Arts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-black/50" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 hover:text-black transition-colors px-3 py-2 hover:bg-gray-100 rounded-lg"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div>
            <p className="text-sm font-medium">Products</p>
            <p className="text-xs text-black/40">{products.length} item{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setEditingProduct(null)}
            className="flex items-center gap-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 gap-2 text-black/40">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm">Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <p className="text-sm text-black/40 mb-4">No products yet.</p>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[10px] uppercase tracking-[0.2em] font-medium underline underline-offset-4 hover:opacity-60 transition-opacity"
              >
                Add your first product
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center gap-4 px-6 py-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-black/40 truncate">
                        {product.category} · ${product.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === product.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="border-t bg-white px-6 py-4">
          <p className="text-[10px] text-black/30 uppercase tracking-[0.2em]">
            Changes are reflected on the live site immediately.
          </p>
        </div>
      </motion.div>

      {/* Product Form Modal */}
      {editingProduct !== undefined && (
        <ProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(undefined)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
