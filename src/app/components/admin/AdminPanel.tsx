import { useEffect, useState, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { Plus, Pencil, Trash2, LogOut, Loader2, X, RefreshCw, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../../../firebase';
import { fetchProducts, deleteProduct, Product } from '../../../lib/products';
import { fetchSettings, updateHeroVideo, updateArtistImage } from '../../../lib/settings';
import { ProductForm } from './ProductForm';
import { toast } from 'react-hot-toast';

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  // undefined = closed, null = adding new, Product = editing existing

  // Site Appearance state
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null);
  const [artistImageUrl, setArtistImageUrl] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingArtistImage, setUploadingArtistImage] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const artistImageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, settings] = await Promise.all([
        fetchProducts(),
        fetchSettings()
      ]);
      setProducts(list);
      if (settings?.heroVideoUrl) {
        setHeroVideoUrl(settings.heroVideoUrl);
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
              onClick={loadData}
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

          {/* Site Appearance Management */}
          <div className="px-6 py-6 bg-white border-b mb-1 shrink-0 space-y-8">
            {/* Hero Video */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-2 text-black/60">
                <Video className="w-3.5 h-3.5" />
                Landing Page Video
              </h3>
              
              <div className="flex gap-4 items-start">
                <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 group ring-1 ring-black/5">
                  {heroVideoUrl ? (
                    <video src={heroVideoUrl} className="w-full h-full object-cover opacity-80" muted playsInline />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[9px] uppercase tracking-widest text-black/20">Empty</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white uppercase tracking-widest">Preview</p>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
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
                    className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-3 h-3" /> Update Video</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Artist Profile Image */}
            <div className="pt-2">
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-bold mb-4 flex items-center gap-2 text-black/60">
                <ImageIcon className="w-3.5 h-3.5" />
                Artist Profile Image
              </h3>
              
              <div className="flex gap-4 items-start">
                <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 group ring-1 ring-black/5">
                  {artistImageUrl ? (
                    <img src={artistImageUrl} className="w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 transition-all duration-500" alt="Artist Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] uppercase tracking-widest text-black/20">Empty</div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] text-white uppercase tracking-widest">Grayscale Active</p>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-2">
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
                    className="flex items-center gap-2 bg-white border border-black/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {uploadingArtistImage ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-3 h-3" /> Update Profile Pic</>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-500 mt-3 leading-relaxed uppercase tracking-wider">
                    Recommended: 1080x1350 for portrait. High contrast works best with the grayscale effect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div>
            <p className="text-sm font-medium">Collection Pieces</p>
            <p className="text-xs text-black/40">{products.length} masterwork{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setEditingProduct(null)}
            className="flex items-center gap-2 bg-black text-white text-[10px] uppercase tracking-[0.2em] font-medium px-4 py-2.5 rounded-lg hover:bg-black/80 transition-colors shadow-black/10 shadow-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            New Creation
          </button>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center justify-center h-48 gap-3 text-black/30">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-sm uppercase tracking-widest">Accessing Vault…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-6">
              <p className="text-sm text-black/40 mb-4">No creations documented yet.</p>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[10px] uppercase tracking-[0.2em] font-medium underline underline-offset-4 hover:opacity-60 transition-opacity"
              >
                Document your first piece
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
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5">
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
                      <p className="text-xs text-black/40 truncate uppercase tracking-widest">
                        {product.category} · ${product.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-black/40 hover:text-black transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === product.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
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
        <div className="border-t bg-white px-6 py-5">
          <p className="text-[9px] text-black/30 uppercase tracking-[0.25em] font-medium">
            Live Synchronization Active · Moses Wire Arts Console
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

