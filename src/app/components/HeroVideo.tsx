import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { fetchSettings } from '../../lib/settings';

export function HeroVideo({ onNavigateToShop }: { onNavigateToShop?: () => void }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.05]);

  useEffect(() => {
    async function init() {
      try {
        const settings = await fetchSettings();
        if (settings?.heroVideoUrl) {
          let url = settings.heroVideoUrl;
          if (url.includes('res.cloudinary.com') && !url.includes('f_auto') && url.includes('/video/upload/')) {
            url = url.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
          }
          setVideoUrl(url);
        }
      } catch (e) {
        console.error("Failed to load hero video", e);
      } finally {
        setLoading(false);
      }
    }
    init();

    const handleVideoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        let url = customEvent.detail;
        if (url.includes('res.cloudinary.com') && !url.includes('f_auto') && url.includes('/video/upload/')) {
          url = url.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
        }
        setVideoUrl(url);
      }
    };
    window.addEventListener('heroVideoUpdated', handleVideoUpdate);
    return () => window.removeEventListener('heroVideoUpdated', handleVideoUpdate);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden flex flex-col items-center">
      
      {/* Immersive Video/Poster Layer */}
      <motion.div style={{ opacity, scale }} className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          {videoUrl ? (
            <motion.video
              key={videoUrl}
              ref={videoRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 2 }}
              src={videoUrl}
              poster="/hero-poster.png"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-center md:object-cover z-0 lg:scale-[1.15]"
              onLoadedMetadata={() => { if (videoRef.current) videoRef.current.playbackRate = 0.6; }}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-contain md:bg-cover z-0 saturate-50 lg:scale-[1.15]"
              style={{ backgroundImage: 'url("/hero-poster.png")' }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Extreme Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />

      {/* Web & Mobile: Text at Top, Art in Center */}
      <div className="relative z-20 w-full px-6 flex flex-col items-center text-center pt-24 md:pt-32 lg:pt-40">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 2.5 }}
        >
          <p className="text-[#D4AF37] uppercase tracking-[0.5em] text-[7px] md:text-[9px] mb-3 md:mb-6 drop-shadow-lg font-bold">Moses Wire Arts</p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight md:tracking-tighter text-[#FDFBF7] mb-3 md:mb-6 drop-shadow-2xl leading-[1.1] whitespace-nowrap md:whitespace-normal">
            Rooted in Craft.<br/>Shaped by Time.
          </h1>
          <p className="max-w-[240px] sm:max-w-xs md:max-w-md mx-auto text-[#FDFBF7]/70 font-sans text-[10px] md:text-xs font-light leading-snug md:leading-relaxed mb-6 md:mb-12">
            Handcrafted wire art rooted in growth, shaped into timeless forms.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 4.5 }}
          >
            <button 
              onClick={onNavigateToShop}
              className="group relative overflow-hidden px-8 py-3.5 md:px-10 md:py-4 bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/30 text-[#FDFBF7] uppercase tracking-[0.2em] text-[8px] md:text-xs font-bold transition-all hover:bg-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
            >
              <span className="relative z-10">Explore the Collection</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Subliminal Scroll Guide */}
      <motion.div 
        className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-4 z-20 opacity-40 mix-blend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2.5, duration: 2 }}
      >
        <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </div>
  );
}
