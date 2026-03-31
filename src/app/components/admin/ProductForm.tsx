import { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
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
    setForm((f) => ({ ...f, image: '' })); // clear URL if file chosen
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!imageFile && !form.image) {
      setError('Please upload an image or provide an image URL.');
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
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b">
            <div>
              <p className="font-serif text-xl">{isEditing ? 'Edit Product' : 'Add New Product'}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mt-0.5">
                {isEditing ? `Editing: ${product.name}` : 'Fill in the details below'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6">
            {/* Left — Image Upload */}
            <div className="flex flex-col gap-4">
              <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50">
                Product Image
              </label>

              {/* Preview */}
              <div
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 cursor-pointer group hover:border-black/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-black/30">
                    <Upload className="w-8 h-8 mb-2" />
                    <p className="text-xs uppercase tracking-[0.15em]">Click to upload</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* OR: image URL */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  — or paste image URL
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
                  placeholder="https://..."
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>
            </div>

            {/* Right — Core Fields */}
            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ethereal Dreams"
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>

              {/* Artist */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  required
                  value={form.artist}
                  onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>

              {/* Price + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="e.g. 2450"
                    className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Description / Story
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Each piece is meticulously crafted over hundreds of hours..."
                  rows={3}
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors resize-none"
                />
              </div>
            </div>
            </div>

            {/* Bottom — Detail Fields (full width) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-black/10">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))}
                  placeholder="Custom sized"
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Materials
                </label>
                <input
                  type="text"
                  value={form.materials}
                  onChange={(e) => setForm((f) => ({ ...f, materials: e.target.value }))}
                  placeholder="Premium wire"
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Authenticity
                </label>
                <input
                  type="text"
                  value={form.authenticity}
                  onChange={(e) => setForm((f) => ({ ...f, authenticity: e.target.value }))}
                  placeholder="Certified original"
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-black/50 mb-2">
                  Shipping
                </label>
                <input
                  type="text"
                  value={form.shipping}
                  onChange={(e) => setForm((f) => ({ ...f, shipping: e.target.value }))}
                  placeholder="Free worldwide"
                  className="w-full border border-black/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs mt-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-black/10">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-black/20 rounded-lg py-3 text-xs uppercase tracking-[0.2em] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white rounded-lg py-3 text-xs uppercase tracking-[0.2em] hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
