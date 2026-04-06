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
    <section id="artist" className="py-24 md:py-32 bg-black scroll-mt-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Artist Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-zinc-900 w-full h-[350px] md:h-[700px]">
              <ImageWithFallback
                src={imageUrl || "/artist-fallback.png"}
                alt="Moises Ragay - Wire Artist"
                className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                loading="lazy"
              />
            </div>
            {/* Experience Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-10 -right-4 md:-right-10 bg-[#111]/80 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl"
            >
              <p className="text-4xl md:text-5xl font-serif mb-1 text-white">15+</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Years of Mastery</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2"
          >
            <span className="text-[10px] tracking-[0.4em] text-white/40 uppercase mb-6 block">
              The Sculptor Behind it All
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif mb-8 md:mb-12 tracking-tight text-white">
              Moises Ragay
            </h2>
            <div className="space-y-6 text-sm md:text-base text-white/60 leading-relaxed max-w-xl">
              <p>
                A master wire sculptor with over 15 years of singular focus, Moises Ragay transforms cold, industrial metal thread into breathing, organic monuments.
              </p>
              <p>
                His philosophy centers on the tension between strength and fragility. By weaving miles of wire by hand, he creates works that capture the transient beauty of nature with eternal permanence.
              </p>
            </div>

            {/* Social & Contact */}
            <div className="flex items-center gap-6 mt-12 mb-16">
               <a href="https://www.instagram.com/moseswireartworks/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                  <Instagram size={20} strokeWidth={1.5} />
               </a>
               <a href="https://www.facebook.com/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
                  <Facebook size={20} strokeWidth={1.5} />
               </a>
               <div className="w-12 h-px bg-white/10 mx-2" />
               <a href="https://m.me/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors flex items-center gap-3">
                  <MessageCircle size={16} />
                  Message Moises
               </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 border-t border-white/5 pt-12">
              <div className="text-left">
                <p className="text-xl md:text-2xl font-serif mb-1 text-white">12+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Awards</p>
              </div>
              <div className="text-left">
                <p className="text-xl md:text-2xl font-serif mb-1 text-white">200+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Creations</p>
              </div>
              <div className="text-left">
                <p className="text-xl md:text-2xl font-serif mb-1 text-white">1k+</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30">Collectors</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
