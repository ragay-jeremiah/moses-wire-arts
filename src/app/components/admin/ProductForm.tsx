import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, ChevronDown, Check, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, addProduct, updateProduct } from '../../../lib/products';
import { fetchCategories, Category } from '../../../lib/categories';

export type GalleryItem = 
  | { id: string; type: 'url'; val: string }
  | { id: string; type: 'file'; val: File; preview: string };

interface ProductFormProps {
  products?: Product[];
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM = {
  name: '',
  artist: 'Moises Ragay',
  price: '',
  category: '',
  image: '',
  description: '',
  dimensions: 'Custom sized',
  materials: 'Premium wire',
  authenticity: 'Certified original',
  shipping: 'Free worldwide',
};

// Custom Select Component for a premium feel
function CustomSelect({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: string[], label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-3 ml-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white/90 hover:bg-white/10 transition-all group"
      >
        <span className="font-sans">{value || 'Select category...'}</span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform duration-500 ${isOpen ? 'rotate-180 text-white/70' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[400] top-full mt-2 left-0 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {options.length === 0 ? (
              <div className="px-5 py-4 text-xs text-white/20">No categories found.</div>
            ) : options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm hover:bg-white/10 transition-colors group"
              >
                <span className={`transition-colors ${value === opt ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {opt}
                </span>
                {value === opt && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductForm({ product, products, onClose, onSaved }: ProductFormProps) {
  const isEditing = !!product;
  const [form, setForm] = useState({
    name: product?.name ?? EMPTY_FORM.name,
    artist: product?.artist ?? EMPTY_FORM.artist,
    price: product?.price?.toString() ?? EMPTY_FORM.price,
    category: product?.category ?? EMPTY_FORM.category,
    image: product?.image ?? EMPTY_FORM.image,
    description: product?.description ?? EMPTY_FORM.description,
    dimensions: product?.dimensions ?? EMPTY_FORM.dimensions,
    materials: product?.materials ?? EMPTY_FORM.materials,
    authenticity: product?.authenticity ?? EMPTY_FORM.authenticity,
    shipping: product?.shipping ?? EMPTY_FORM.shipping,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const initImages = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
    return initImages.map(url => ({ id: Math.random().toString(), type: 'url', val: url }));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const catList = await fetchCategories();
        setCategories(catList);
        if (!isEditing && catList.length > 0 && !form.category) {
          setForm(f => ({ ...f, category: catList[0].name }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing && form.category && products && products.length > 0) {
      const recentInCategory = products.find(p => p.category === form.category);
      if (recentInCategory) {
        setForm(f => {
          const update = { ...f };
          if (f.description === EMPTY_FORM.description) update.description = recentInCategory.description || EMPTY_FORM.description;
          if (f.materials === EMPTY_FORM.materials) update.materials = recentInCategory.materials || EMPTY_FORM.materials;
          if (f.dimensions === EMPTY_FORM.dimensions) update.dimensions = recentInCategory.dimensions || EMPTY_FORM.dimensions;
          if (f.authenticity === EMPTY_FORM.authenticity) update.authenticity = recentInCategory.authenticity || EMPTY_FORM.authenticity;
          if (f.shipping === EMPTY_FORM.shipping) update.shipping = recentInCategory.shipping || EMPTY_FORM.shipping;
          if (f.artist === EMPTY_FORM.artist) update.artist = recentInCategory.artist || EMPTY_FORM.artist;
          return update;
        });
      }
    }
  }, [form.category, isEditing, products]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newItems: GalleryItem[] = files.map(file => ({
      id: Math.random().toString(),
      type: 'file',
      val: file,
      preview: URL.createObjectURL(file)
    }));
    setGallery((prev) => [...prev, ...newItems]);
    setForm((f) => ({ ...f, image: '' }));
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setGallery(prev => {
      const newGallery = [...prev];
      if (direction === 'left' && index > 0) {
        [newGallery[index], newGallery[index - 1]] = [newGallery[index - 1], newGallery[index]];
      } else if (direction === 'right' && index < newGallery.length - 1) {
        [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
      }
      return newGallery;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (gallery.length === 0 && !form.image) {
      setError('Please provide a masterpiece visual.');
      return;
    }

    if (!form.category) {
      setError('Please select an aesthetic genre.');
      return;
    }

    setLoading(true);
    try {
      const mixedImages = gallery.map(item => item.val);
      const existingUrls = gallery.filter(item => item.type === 'url').map(item => item.val as string);

      const data = {
        name: form.name.trim(),
        artist: form.artist.trim(),
        price: Number(form.price),
        category: form.category,
        image: existingUrls[0] || form.image.trim(),
        images: existingUrls.length > 0 ? existingUrls : (form.image.trim() ? [form.image.trim()] : []),
        description: form.description.trim(),
        dimensions: form.dimensions.trim(),
        materials: form.materials.trim(),
        authenticity: form.authenticity.trim(),
        shipping: form.shipping.trim(),
        storagePath: product?.storagePath,
      };

      if (isEditing && product) {
        await updateProduct(product.id, data, mixedImages, product.storagePath);
      } else {
        await addProduct(data, mixedImages);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="bg-[#030303] border border-white/5 w-full max-w-2xl shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col relative my-auto"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
          
          {/* Header - Premium Minimal */}
          <div className="flex items-center justify-between px-8 py-8 border-b border-white/5">
            <div>
              <h2 className="font-serif text-2xl text-white tracking-tight flex items-center gap-3">
                {isEditing ? 'Curate Creation' : 'Manifest Product'}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                <p className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">
                  {isEditing ? 'Refining Archive' : 'New Masterpiece'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 md:px-10 pb-8 md:pb-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="grid md:grid-cols-2 gap-8 md:gap-10">
              {/* Left — Aesthetic Media */}
              <div className="space-y-8">
                <div>
                  <label className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-4 ml-1">
                    <span>Visual Presence (Gallery)</span>
                    <span>{gallery.length} / 5</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                    {gallery.map((item, i) => (
                      <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10 bg-white/[0.02]">
                        <img src={item.type === 'url' ? item.val as string : item.preview} alt="Masterpiece" className={`w-full h-full object-cover ${item.type === 'file' ? 'opacity-80' : ''}`} />
                        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-[8px] uppercase tracking-wider text-white border border-white/20 backdrop-blur-sm z-10 shadow-[0_0_15px_black]">
                          {i === 0 ? 'Primary' : `Image ${i+1}`}
                        </div>
                        {item.type === 'file' && (
                          <div className="absolute bottom-2 left-2 bg-white/20 px-2 py-1 rounded text-[8px] uppercase tracking-wider text-white backdrop-blur-md border border-white/30 z-10">
                            Pending
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeImage(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/90 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>

                        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(i, 'left')}
                              className="p-1.5 bg-black/60 hover:bg-black/90 rounded-full shadow-[0_4px_15px_black]"
                            >
                              <ArrowLeft className="w-3 h-3 text-white" />
                            </button>
                          )}
                          {i < gallery.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(i, 'right')}
                              className="p-1.5 bg-black/60 hover:bg-black/90 rounded-full shadow-[0_4px_15px_black]"
                            >
                              <ArrowRight className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div
                      className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white/[0.02] border border-white/10 border-dashed cursor-pointer hover:bg-white/5 transition-all flex flex-col items-center justify-center text-white/20 group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mb-3 stroke-1 group-hover:scale-110 transition-transform duration-500" />
                      <p className="text-[8px] uppercase tracking-[0.2em] font-bold">Add Media</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/30 ml-1">
                    Remote Asset URL
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, image: e.target.value }));
                      if (e.target.value) {
                        setGallery(prev => [...prev, { id: Math.random().toString(), type: 'url', val: e.target.value }]);
                        setForm((f) => ({ ...f, image: '' }));
                      }
                    }}
                    placeholder="https://cloudinary.com/..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-xs font-sans text-white/70 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Right — Core Metadata */}
              <div className="space-y-8">
                <div className="space-y-6">
                  {/* Name field */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-3 ml-1">
                      Creation Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\b\w/g, c => c.toUpperCase());
                        setForm((f) => ({ ...f, name: val }));
                      }}
                      placeholder="e.g. Celestial Orbit"
                      className="w-full bg-transparent border-b border-white/10 py-3 text-2xl font-serif text-white placeholder:text-white/10 focus:outline-none focus:border-white/40 transition-all"
                    />
                  </div>

                  {/* Artist field */}
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-3 ml-1">
                      Lead Sculptor
                    </label>
                    <input
                      type="text"
                      required
                      value={form.artist}
                      onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm font-sans text-white/80 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>

                  {/* Price + Category Dropdown */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-3 ml-1">
                        Price (PHP ₱)
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/5 rounded-xl px-5 py-4 text-sm font-sans text-white/80 focus:outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                    <CustomSelect 
                      label="Aesthetic Genre"
                      value={form.category}
                      options={categories.map(c => c.name)}
                      onChange={(val) => setForm(f => ({...f, category: val}))}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-3 ml-1">
                    The Narrative
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the soul of this piece..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] px-5 py-5 text-sm font-sans text-white/60 focus:outline-none focus:border-white/20 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Bottom — Technical Specs */}
            <div className="mt-12 pt-10 border-t border-white/5">
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8 font-bold flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                Technical Logistics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { id: 'dimensions', label: 'Dimensions', placeholder: 'H x W x D', value: form.dimensions },
                  { id: 'materials', label: 'Constitution', placeholder: 'e.g. Copper Wire', value: form.materials },
                  { id: 'authenticity', label: 'Verification', placeholder: 'e.g. Handmade', value: form.authenticity },
                  { id: 'shipping', label: 'Acquisition', placeholder: 'Shipping Terms', value: form.shipping }
                ].map((field) => (
                  <div key={field.id}>
                    <label className="block text-[8px] uppercase tracking-[0.3em] font-medium text-white/20 mb-3 ml-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5 text-xs font-sans text-white/50 focus:outline-none focus:border-white/20 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-red-400 text-[10px] uppercase tracking-widest mt-8 text-center bg-red-400/5 py-4 rounded-xl border border-red-400/10"
              >
                {error}
              </motion.p>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-5 text-xs uppercase tracking-wider font-bold transition-all border border-white/10"
              >
                Cancel Session
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-black rounded-full py-5 text-xs uppercase tracking-wider font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Committing…' : isEditing ? 'Finalize Masterpiece' : 'Manifest Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

