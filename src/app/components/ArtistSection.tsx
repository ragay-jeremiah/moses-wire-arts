import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchSettings } from '../../lib/settings';


export function ArtistSection() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const settings = await fetchSettings();
      if (settings?.artistImageUrl) {
        setImageUrl(settings.artistImageUrl);
      }
    }
    loadSettings();

    const handleUpdate = (e: any) => {
      setImageUrl(e.detail);
    };

    window.addEventListener('artistImageUpdated', handleUpdate);
    return () => window.removeEventListener('artistImageUpdated', handleUpdate);
  }, []);

  return (
    <section id="artist" className="py-24 md:py-32 bg-[#030303] flex items-center min-h-[70vh] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-white/5 blur-[150px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 w-full">
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           className="bg-[#080808] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,1)] p-8 md:p-16 lg:p-20 relative overflow-hidden"
        >
          {/* Premium Gold Glow Line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-[#D4AF37]/30 blur-sm pointer-events-none" />

          {/* Subtle Card Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            
            <div className="lg:col-span-7 order-2 lg:order-1">
              {/* Mobile: Lowkey Image beside Name */}
              <div className="flex items-center gap-5 md:gap-8 mb-10">
                {/* Profile Image (Glow & Transition Reveal) */}
                <div className="relative w-20 h-20 md:w-28 md:h-28 lg:hidden rounded-none overflow-hidden flex-shrink-0 border border-white/10 shadow-2xl group/img">
                  <ImageWithFallback
                    src={imageUrl || "/artist-fallback.png"}
                    alt="Moses Ragay - Wire Artist"
                    className="w-full h-full object-cover grayscale brightness-90 transition-all duration-[1.5s] ease-out hover:grayscale-0 hover:brightness-100"
                    loading="lazy"
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                    <span className="text-[8px] tracking-[0.4em] text-[#D4AF37] uppercase font-bold">
                      The Master Sculptor
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-5xl font-serif tracking-tighter text-[#FDFBF7] leading-[1.1]">
                    Moises Ragay
                  </h2>
                </div>
              </div>

              <div className="space-y-6 text-[13px] md:text-sm text-[#FDFBF7]/60 leading-[1.8] max-w-xl mb-12 font-light">
                <p>
                  A single complex tree demands <strong className="text-[#FDFBF7]">7 to 10 days of unyielding labor</strong>—a grueling physical toll where every twist is a testament to decade-long mastery. 
                </p>
                <p>
                  Moises physically commands miles of stubborn industrial wire into breathing majesty, a test of endurance that results in a timeless legacy. There are no shortcuts; each sculpture is a dialogue between human resolve and unyielding steel.
                </p>
                <blockquote className="pl-6 border-l border-[#D4AF37]/30 italic text-[#FDFBF7]/80 my-10 py-1">
                  "It takes everything. But when the wire finally bends to the will of the form, it captures a permanence that outlives the hands that shaped it."
                </blockquote>
              </div>

              {/* Social & Contact */}
              <div className="flex items-center gap-6 mt-12 lg:mb-0 pb-0 border-none">
                 <a href="https://www.instagram.com/moseswireartworks/" target="_blank" rel="noopener noreferrer" className="text-[#FDFBF7]/40 hover:text-[#D4AF37] transition-colors">
                    <Instagram size={18} strokeWidth={1} />
                 </a>
                 <a href="https://www.facebook.com/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-[#FDFBF7]/40 hover:text-[#D4AF37] transition-colors">
                    <Facebook size={18} strokeWidth={1} />
                 </a>
                 <div className="w-8 h-px bg-white/10 mx-1" />
                 <a href="https://m.me/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-[#FDFBF7]/80 hover:text-[#D4AF37] transition-colors flex items-center gap-3 font-bold">
                    <MessageCircle size={14} />
                    Contact The Artist
                 </a>
              </div>
            </div>

            {/* Desktop Only: Large Profile Image (Hover Reveal) */}
            <div className="hidden lg:block lg:col-span-5 order-1 lg:order-2 w-full lg:pl-12 relative group/mainimg">
              <div className="relative aspect-[3/4] rounded-none overflow-hidden max-w-md ml-auto border border-white/5">
                <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none group-hover/mainimg:bg-transparent transition-colors duration-[1.5s]"></div>
                <ImageWithFallback
                  src={imageUrl || "/artist-fallback.png"}
                  alt="Moises Ragay - Wire Artist"
                  className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 hover:brightness-100 transition-all duration-[1.5s] ease-out"
                  loading="lazy"
                />
                <div className="absolute bottom-10 left-10 z-20">
                  <p className="text-4xl lg:text-5xl font-serif mb-1 text-[#FDFBF7]">15+</p>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] font-bold">Years of Mastery</p>
                </div>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}
