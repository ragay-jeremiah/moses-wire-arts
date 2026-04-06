import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { Plus, Pencil, Trash2, LogOut, Loader2, X, RefreshCw, Upload, Video, Image as ImageIcon, Tags, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../../firebase';
import { fetchProducts, deleteProduct, Product } from '../../../lib/products';
import { fetchSettings, updateHeroVideo, updateArtistImage, updateHeroImages } from '../../../lib/settings';
import { fetchCategories, addCategory, updateCategory, deleteCategory, Category } from '../../../lib/categories';
import { ProductForm } from './ProductForm';
import { toast } from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminView = 'products' | 'categories';

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [view, setView] = useState<AdminView>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  // undefined = closed, null = adding new, Product = editing existing

  // Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Site Appearance state
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [artistImageUrl, setArtistImageUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingHeroImages, setUploadingHeroImages] = useState(false);
  const [uploadingArtistImage, setUploadingArtistImage] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const heroImagesInputRef = useRef<HTMLInputElement>(null);
  const artistImageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, settings, catList] = await Promise.all([
        fetchProducts(),
        fetchSettings(),
        fetchCategories()
      ]);
      setProducts(list);
      setCategories(catList);
      if (settings?.heroVideoUrl) {
        setHeroVideoUrl(settings.heroVideoUrl);
      }
      if (settings?.heroImages) {
        setHeroImages(settings.heroImages);
      }
      if (settings?.artistImageUrl) {
        setArtistImageUrl(settings.artistImageUrl);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const url = await updateHeroVideo(file, heroVideoUrl ?? undefined);
      if (url) {
        setHeroVideoUrl(url);
        window.dispatchEvent(new CustomEvent('heroVideoUpdated', { detail: url }));
        toast.success('Hero video updated live!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleHeroImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map(file => ({ type: 'file' as const, val: file, preview: URL.createObjectURL(file) }));
    const existingItems = heroImages.map(url => ({ type: 'url' as const, val: url }));
    const combined = [...existingItems, ...newItems].slice(0, 5);

    setUploadingHeroImages(true);
    try {
      const urls = await updateHeroImages(combined);
      setHeroImages(urls);
      window.dispatchEvent(new CustomEvent('heroImagesUpdated', { detail: urls }));
      toast.success('Hero slideshow updated live!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images');
    } finally {
      setUploadingHeroImages(false);
      if (heroImagesInputRef.current) heroImagesInputRef.current.value = '';
    }
  };

  const handleClearHeroImages = async () => {
    if (!window.confirm("Clear all slideshow images and fall back to the hero video?")) return;
    setUploadingHeroImages(true);
    try {
      await updateHeroImages([]);
      setHeroImages([]);
      window.dispatchEvent(new CustomEvent('heroImagesUpdated', { detail: [] }));
      toast.success('Hero slideshow cleared.');
    } catch (err: any) {
      toast.error('Failed to clear slideshow');
    } finally {
      setUploadingHeroImages(false);
    }
  };

  const handleArtistImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingArtistImage(true);
    try {
      const url = await updateArtistImage(file, artistImageUrl ?? undefined);
      if (url) {
        setArtistImageUrl(url);
        window.dispatchEvent(new CustomEvent('artistImageUpdated', { detail: url }));
        toast.success('Artist profile image updated!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingArtistImage(false);
      if (artistImageInputRef.current) artistImageInputRef.current.value = '';
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await deleteProduct(product.id, product.storagePath);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(`Removed collection piece.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete piece');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      const cat = await addCategory(newCategoryName);
      setCategories([...categories, cat]);
      setNewCategoryName('');
      toast.success('Category added.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;
    try {
      await updateCategory(id, editCategoryName);
      setCategories(categories.map(c => c.id === id ? { ...c, name: editCategoryName } : c));
      setEditingCategoryId(null);
      toast.success('Category updated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    // Check if category is in use
    const inUse = products.some(p => p.category === name);
    if (inUse) {
      toast.error(`"${name}" is currently used by products. Please change them first.`);
      return;
    }

    if (!window.confirm(`Delete "${name}" category?`)) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category removed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleSaved = () => {
    setEditingProduct(undefined);
    loadData();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success('Signed out securely.');
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
        className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-[#030303] shadow-2xl z-[160] flex flex-col overflow-hidden text-[#FDFBF7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Gold Glow Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-[170]" />
        
        {/* Header - Compact for Mobile */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black shrink-0">

          <div className="flex items-center gap-3">
            {view !== 'products' && (
              <button 
                onClick={() => setView('products')}
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="font-serif text-base tracking-tighter">{view === 'products' ? 'Artist Console' : 'Categories'}</p>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#D4AF37] rounded-full animate-pulse" />
                <p className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">Live Status</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadData}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-white/40 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors ml-1">
              <X className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {view === 'products' ? (
            <>
              {/* Appearance Management - Compact Side-by-Side */}
              <div className="px-6 py-6 bg-black border-b border-white/5 mb-1 shrink-0 space-y-6">
                {/* Hero Video */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Video className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/60">Hero Video</h3>
                      <p className="text-[8px] text-white/30 hidden sm:block">Fallback if no slideshow</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-10 bg-black rounded border border-white/10 overflow-hidden flex-shrink-0">
                      {heroVideoUrl ? (
                        <video src={heroVideoUrl} className="w-full h-full object-cover opacity-60" muted playsInline />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-[7px] uppercase text-white/20">Empty</div>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      accept="video/mp4,video/webm" 
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      className="hidden" 
                    />
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingVideo}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold rounded-none hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {uploadingVideo ? 'Updating...' : 'Change'}
                    </button>
                  </div>
                </div>

                {/* Hero Slideshow */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/60">Hero Slideshow</h3>
                      <p className="text-[8px] text-white/30 hidden sm:block">{heroImages.length}/5 images (Overrides video)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    <div className="flex items-center gap-1">
                      {heroImages.map((img, idx) => (
                         <div key={idx} className="relative w-10 h-10 bg-black rounded border border-white/10 overflow-hidden flex-shrink-0">
                           <img src={img} className="w-full h-full object-cover opacity-60" alt="Hero Slide" />
                         </div>
                      ))}
                      {heroImages.length === 0 && (
                        <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-[7px] border border-white/10 rounded uppercase text-white/20">Empty</div>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      ref={heroImagesInputRef}
                      onChange={handleHeroImagesUpload}
                      className="hidden" 
                    />
                    
                    {heroImages.length > 0 && (
                      <button
                        onClick={handleClearHeroImages}
                        disabled={uploadingHeroImages}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                        title="Clear Slideshow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => heroImagesInputRef.current?.click()}
                      disabled={uploadingHeroImages || heroImages.length >= 5}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold rounded-none hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {uploadingHeroImages ? 'Uploading...' : 'Add Images'}
                    </button>
                  </div>
                </div>

                {/* Artist Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/60">Artist Bio</h3>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-white/5 rounded border border-white/10 overflow-hidden flex-shrink-0">
                      {artistImageUrl ? (
                        <img src={artistImageUrl} className="w-full h-full object-cover grayscale" alt="Profile" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] uppercase text-white/20">Empty</div>
                      )}
                    </div>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={artistImageInputRef}
                      onChange={handleArtistImageUpload}
                      className="hidden" 
                    />
                    <button
                      onClick={() => artistImageInputRef.current?.click()}
                      disabled={uploadingArtistImage}
                      className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold rounded-none hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      {uploadingArtistImage ? 'Updating...' : 'Change'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Toolbar */}
              <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-white/5">
                <div>
                  <p className="text-xs font-serif tracking-tight text-white/90">Masterpieces</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/30">{products.length} documented</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('categories')}
                    className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Tags className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="p-3 bg-[#D4AF37] text-black rounded-full hover:bg-[#FDFBF7] transition-colors shadow-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Product List - Ultra Compact */}
              <div className="bg-black divide-y divide-white/5">
                {loading ? (
                  <div className="flex items-center justify-center h-48 gap-3 text-white/20">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">No creations found</p>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-[9px] uppercase tracking-widest font-bold text-[#D4AF37] underline underline-offset-4"
                    >
                      Document first piece
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    <AnimatePresence initial={false}>
                      {products.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-sm overflow-hidden bg-white/5 flex-shrink-0 border border-white/5">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale opacity-60"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-serif tracking-tight text-white/90 truncate">{product.name}</p>
                            <p className="text-[8px] uppercase tracking-[0.1em] text-white/20 truncate">
                              {product.category} · ${product.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-1.5 text-white/20 hover:text-white transition-colors"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              className="p-1.5 text-white/10 hover:text-red-500 transition-colors"
                            >
                              {deletingId === product.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Trash2 className="w-3 h-3" />
                              }
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="px-6 py-6 min-h-full bg-black">
              {/* Add Category Form - Premium Dark */}
              <form onSubmit={handleAddCategory} className="mb-10 flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New collection name..."
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-none px-5 py-4 text-[11px] uppercase tracking-widest text-[#FDFBF7] focus:outline-none focus:border-[#D4AF37]/40 transition-all font-light"
                  required
                />
                <button
                  type="submit"
                  disabled={isAddingCategory}
                  className="bg-[#D4AF37] text-black px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#FDFBF7] transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {isAddingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
                </button>
              </form>

              {/* Category List - Integrated Style */}
              <div className="divide-y divide-white/5 bg-white/[0.02] border border-white/5 overflow-hidden">
                {categories.length === 0 ? (
                  <div className="px-6 py-12 text-center text-white/20 text-[9px] uppercase tracking-[0.3em]">
                    No categories defined
                  </div>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between px-6 py-5 group hover:bg-white/[0.02] transition-colors">
                      {editingCategoryId === cat.id ? (
                        <div className="flex gap-2 flex-1 items-center">
                          <input
                            type="text"
                            autoFocus
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="flex-1 bg-black border border-white/20 rounded-none px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="bg-[#D4AF37] text-black px-4 py-2 text-[8px] uppercase tracking-widest font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="text-white/40 px-2 text-[8px] uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-white/20 font-mono italic">#{cat.id.slice(-2)}</span>
                            <p className="font-serif text-sm tracking-tight text-white/90">{cat.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setEditCategoryName(cat.name);
                              }}
                              className="text-white/20 hover:text-[#D4AF37] transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="text-white/10 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="border-t border-white/5 bg-black px-6 py-4 shrink-0 text-center">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-medium italic">
            Secure Encryption Active · Artist Console
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

