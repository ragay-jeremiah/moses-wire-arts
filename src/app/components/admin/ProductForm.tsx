import { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, ChevronDown, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, addProduct, updateProduct } from '../../../lib/products';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = ['Abstract', 'Geometric', 'Organic', 'Minimal'];

const EMPTY_FORM = {
  name: '',
  artist: 'Moises Ragay',
  price: '',
  category: 'Abstract',
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
        <span className="font-sans">{value}</span>
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
            {options.map((opt) => (
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

export function ProductForm({ product, onClose, onSaved }: ProductFormProps) {
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageFile && !form.image) {
      setError('Please provide a masterpiece visual.');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name.trim(),
        artist: form.artist.trim(),
        price: Number(form.price),
        category: form.category,
        image: form.image.trim(),
        description: form.description.trim(),
        dimensions: form.dimensions.trim(),
        materials: form.materials.trim(),
        authenticity: form.authenticity.trim(),
        shipping: form.shipping.trim(),
        storagePath: product?.storagePath,
      };

      if (isEditing && product) {
        await updateProduct(product.id, data, imageFile ?? undefined, product.storagePath);
      } else {
        await addProduct(data, imageFile ?? undefined);
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
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="bg-zinc-950/95 border border-white/10 w-full max-w-3xl rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
        >
          {/* Background Highlight */}
          <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-10 py-10">
            <div>
              <h2 className="font-serif text-3xl text-white tracking-tight flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white/30" />
                {isEditing ? 'Curate Creation' : 'Manifest Product'}
              </h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mt-2 font-medium">
                {isEditing ? `Refining: ${product.name}` : 'Documenting a new masterpiece'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-full transition-all border border-white/5 rotate-0 hover:rotate-90 duration-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-10 pb-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Left — Aesthetic Media */}
              <div className="space-y-8">
                <div>
                  <label className="block text-[9px] uppercase tracking-[0.3em] font-medium text-white/40 mb-4 ml-1">
                    Visual Presence
                  </label>
                  <div
                    className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white/[0.02] border border-white/10 cursor-pointer group shadow-inner"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="curated preview"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                        <Upload className="w-10 h-10 mb-4 stroke-1" />
                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold">Select Masterpiece</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-white text-black p-4 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500">
                        <Upload className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                        setImagePreview(e.target.value);
                        setImageFile(null);
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
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                        Price (USD)
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
                      options={CATEGORIES}
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
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 rounded-full py-5 text-[10px] uppercase tracking-[0.3em] font-bold transition-all border border-white/5"
              >
                Cancel Session
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-black rounded-full py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
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

