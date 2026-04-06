import { X, Minus, Plus, MessageSquare, Trash2, ChevronRight, ChevronLeft, MapPin, Mail, Phone, Wallet, Info, Sparkles, Send } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface InquiryItem extends Product {
  quantity: number;
}

interface InquiryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: InquiryItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const BUDGET_TIERS = [
  "₱5,000 - ₱20,000",
  "₱20,000 - ₱50,000",
  "₱50,000 - ₱100,000",
  "₱100,000 - ₱250,000",
  "₱250,000+"
];

export function InquiryDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: InquiryDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: '',
    budget: '',
    notes: '',
    isBesoke: false,
    rememberMe: true
  });

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('moses_wire_brief_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (formData.rememberMe) {
      const { email, phone, location } = formData;
      localStorage.setItem('moses_wire_brief_profile', JSON.stringify({ email, phone, location }));
    } else {
      localStorage.removeItem('moses_wire_brief_profile');
    }
  }, [formData]);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const generateMessengerLink = () => {
    const selectionText = items.map(i => `• ${i.name} (Qty: ${i.quantity})`).join('\n');
    const briefText = `
Hello Moses! I am interested in a commission.

- My Selections:
${selectionText}

- Brief Details:
Location: ${formData.location || 'Not specified'}
Budget: ${formData.budget || 'Not specified'}
Project: ${formData.isBesoke ? 'Bespoke/Custom' : 'Collection-based'}

- Client Identity:
Email: ${formData.email || 'Provided via Chat'}
Contact: ${formData.phone || 'Provided via Chat'}

- Artistic Vision:
${formData.notes || 'No additional notes.'}

Looking forward to hearing from you.
`.trim();

    return `https://m.me/MosesRagay?text=${encodeURIComponent(briefText)}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-[#030303]/85 backdrop-blur-3xl border-l border-[#D4AF37]/10 shadow-2xl z-50 flex flex-col text-[#FDFBF7] overflow-hidden"
          >
            {/* Premium Gold Glow Line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent z-20" />
            
            <div className="flex items-center justify-between p-8 border-b border-white/5 relative">
              {/* Header Glow Accent */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-serif tracking-tighter">Inquiry List</h2>
                <p className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold mt-1">
                  {itemCount} {itemCount === 1 ? 'Selection' : 'Selections'} Reserved
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <X className="w-6 h-6" strokeWidth={1} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-8 pt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={`h-0.5 flex-1 transition-all duration-500 ${
                    s <= currentStep ? 'bg-[#D4AF37]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    <div className="mb-8">
                      <h3 className="text-lg font-serif mb-1">Review Selections</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Step 1 of 5</p>
                    </div>

                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <MessageSquare className="w-12 h-12 text-[#D4AF37]/20 mb-4" />
                        <p className="text-sm text-white/40">Your vault is currently empty.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 group hover:border-[#D4AF37]/20 transition-colors">
                            <div className="w-16 h-16 bg-black border border-white/5 flex-shrink-0">
                              <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-serif truncate">{item.name}</h4>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center border border-white/10 bg-black/20 text-[10px]">
                                  <button onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))} className="p-1.5 hover:text-[#D4AF37]"><Minus className="w-2.5 h-2.5" /></button>
                                  <span className="px-2 font-mono">{item.quantity}</span>
                                  <button onClick={() => item.quantity < 12 && onUpdateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:text-[#D4AF37]"><Plus className="w-2.5 h-2.5" /></button>
                                </div>
                                <button onClick={() => onRemoveItem(item.id)} className="text-[9px] uppercase tracking-widest text-white/20 hover:text-red-500">Remove</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-10"
                  >
                    <div>
                      <h3 className="text-lg font-serif mb-1">Logistics & Budget</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Step 2 of 5</p>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                          <MapPin className="w-3 h-3" /> Delivery Region
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Local (PH)', 'International'].map(loc => (
                            <button
                              key={loc}
                              onClick={() => updateForm({ location: loc })}
                              className={`py-4 text-[10px] uppercase tracking-widest border transition-all ${
                                formData.location === loc 
                                  ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                                  : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                          <Wallet className="w-3 h-3" /> Target Budget Alignment
                        </label>
                        <select
                          value={formData.budget}
                          onChange={(e) => updateForm({ budget: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 text-[11px] uppercase tracking-widest text-white/80 outline-none focus:border-[#D4AF37]/50"
                        >
                          <option value="" className="bg-[#030303]">Select Tier</option>
                          {BUDGET_TIERS.map(tier => (
                            <option key={tier} value={tier} className="bg-[#030303]">{tier}</option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-4 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                        <div className="flex gap-3">
                          <Info className="w-4 h-4 text-[#D4AF37] flex-shrink-0" strokeWidth={1.5} />
                          <p className="text-[10px] leading-relaxed text-white/60 font-light italic">
                            Honest budget alignment helps Moses suggest appropriate base materials and framing options for your specific vision.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-10"
                  >
                    <div>
                      <h3 className="text-lg font-serif mb-1">Client Identity</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Step 3 of 5</p>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                          <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="artifact@example.com"
                          value={formData.email}
                          onChange={(e) => updateForm({ email: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 text-[11px] uppercase tracking-widest text-white/80 outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                          <Phone className="w-3 h-3" /> Contact Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+63 --- --- ----"
                          value={formData.phone}
                          onChange={(e) => updateForm({ phone: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-4 text-[11px] uppercase tracking-widest text-white/80 outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            onClick={() => updateForm({ rememberMe: !formData.rememberMe })}
                            className={`w-10 h-5 rounded-full transition-all flex items-center p-1 ${
                              formData.rememberMe ? 'bg-[#D4AF37]' : 'bg-white/10'
                            }`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                              formData.rememberMe ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Remember my details</p>
                            <p className="text-[9px] text-white/30 mt-1">Saves encrypted contact info to this browser for future inquiries.</p>
                          </div>
                        </label>
                        
                        {!formData.rememberMe && (
                          <button 
                            onClick={() => updateForm({ email: '', phone: '', location: '' })}
                            className="mt-6 text-[9px] uppercase tracking-widest text-red-500/50 hover:text-red-500 flex items-center gap-2"
                          >
                             <Trash2 className="w-3 h-3" /> Clear Profile Data
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 space-y-10"
                  >
                    <div>
                      <h3 className="text-lg font-serif mb-1">Artistic Vision</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Step 4 of 5</p>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-4">
                        <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                          <Sparkles className="w-3 h-3" /> The Narrative
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Tell Moses the story or purpose behind this piece. Is it a gift? Is there a special deadline?"
                          value={formData.notes}
                          onChange={(e) => updateForm({ notes: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 p-5 text-sm text-white/80 outline-none focus:border-[#D4AF37]/50 font-light leading-relaxed resize-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer group p-4 border border-white/5 bg-white/[0.02]">
                          <input 
                            type="checkbox"
                            checked={formData.isBesoke}
                            onChange={(e) => updateForm({ isBesoke: e.target.checked })}
                            className="w-4 h-4 accent-[#D4AF37]"
                          />
                          <div className="flex-1">
                            <p className="text-[10px] uppercase tracking-widest text-white/80 font-bold">Request Besoke Customization</p>
                            <p className="text-[9px] text-white/30 mt-1">If you want to modify existing designs or create something entirely new from scratch.</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8"
                  >
                    <div className="text-center mb-12">
                      <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-serif mb-2">Finalize Brief</h3>
                      <p className="text-[10px] uppercase tracking-widest text-white/40">Review Summary</p>
                    </div>

                    <div className="space-y-1 bg-white/[0.02] border border-white/5 p-6 mb-8">
                       <div className="pb-4 mb-4 border-b border-white/5">
                          <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-3">Masterpieces</p>
                          <div className="space-y-1">
                            {items.map(i => (
                              <p key={i.id} className="text-xs text-white/70">{i.name} (x{i.quantity})</p>
                            ))}
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Region</p>
                            <p className="text-xs text-white/80">{formData.location || '---'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Budget</p>
                            <p className="text-xs text-white/80">{formData.budget || '---'}</p>
                          </div>
                       </div>
                       <div className="pt-4">
                          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Correspondence</p>
                          <p className="text-xs text-white/80">{formData.email || 'None provided'}</p>
                          <p className="text-xs text-white/80">{formData.phone || 'None provided'}</p>
                       </div>
                    </div>

                    <p className="text-[10px] text-center text-white/30 italic mb-8">
                      Moses will review this brief and respond via Messenger to coordinate the crafting timeline and logistics.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step Navigation Bar */}
            <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/5 space-y-4">
               {currentStep < 5 ? (
                 <div className="flex gap-4">
                   {currentStep > 1 && (
                     <button
                       onClick={handleBack}
                       className="px-6 py-5 bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                     >
                       <ChevronLeft className="w-5 h-5" />
                     </button>
                   )}
                   <button
                     onClick={handleNext}
                     disabled={items.length === 0}
                     className="flex-1 bg-white text-black py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#D4AF37] hover:text-black transition-all flex items-center justify-center gap-2 group disabled:opacity-20"
                   >
                     Next Phase <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <a 
                      href={generateMessengerLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-[#D4AF37] text-black py-5 text-center text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#FDFBF7] transition-all flex items-center justify-center gap-3 animate-pulse"
                    >
                      Initialize Consultation <MessageSquare className="w-4 h-4" />
                    </a>
                    <button
                      onClick={handleBack}
                      className="w-full text-[9px] uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors py-2 text-center"
                    >
                      Edit Brief Details
                    </button>
                 </div>
               )}

               {currentStep === 1 && items.length > 0 && (
                 <p className="text-[9px] text-center text-white/20 uppercase tracking-[0.2em]">
                    Estimated {itemCount <= 2 ? '7-10 Days' : 'Multiple Weeks'} Crafting Window
                 </p>
               )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
