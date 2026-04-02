import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { fetchSettings } from '../../lib/settings';

export function HeroVideo({ onNavigateToShop }: { onNavigateToShop?: () => void }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Scroll-linked animations for CTAs
  const { scrollY } = useScroll();
  const ctaOpacity = useTransform(scrollY, [20, 120], [0, 1]);
  const ctaTranslateY = useTransform(scrollY, [20, 120], [20, 0]);

  // Handle slow motion for a more premium, serene feel
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.playbackRate = 0.6; // 60% speed for elegant "slow spin"
    }
  }, [videoUrl, loading]);

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

    return () => {
      window.removeEventListener('heroVideoUpdated', handleVideoUpdate);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Fallback pattern while waiting for connection or if no video */}
      <div className="absolute inset-0 premium-grain opacity-20" />
      
      {/* Native Video Player */}
      <AnimatePresence mode="wait">
        {videoUrl ? (
          <motion.video
            key={videoUrl}
            ref={videoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            src={videoUrl}
            poster="/hero-poster.png"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-[center_85%] md:object-bottom z-0"
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.playbackRate = 0.6;
            }}
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-0 bg-cover bg-center grayscale opacity-40 transition-opacity duration-1000"
            style={{ backgroundImage: 'url("/hero-poster.png")' }}
          />
        )}
      </AnimatePresence>

      {/* Lowkey Watermark Cover - Opaque black core with heavily blurred edges to completely swallow the text without looking like a box */}
      <div className="absolute bottom-[2%] right-[2%] md:bottom-[5%] md:right-[5%] w-[300px] h-[150px] bg-black blur-3xl z-10 pointer-events-none rounded-full opacity-100" />
      <div className="absolute bottom-[4%] right-[4%] md:bottom-[8%] md:right-[8%] w-[200px] h-[100px] bg-black blur-2xl z-10 pointer-events-none rounded-full opacity-100" />

      {/* Elegant Vignette to darken edges for text readability */}
      <div className="absolute inset-0 premium-vignette opacity-80 z-10 pointer-events-none" />

      {/* Main Content Overlay - Title Area pushed up to clear the artwork */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-start pt-[12vh] text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        >
          {/* Subtle logo/branding indicator */}
          <div className="flex justify-center mb-6 opacity-60">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                <path d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 C20,30 65,30 65,50 C65,70 35,70 35,50 C35,40 55,40 55,50 C55,60 45,60 45,50" />
            </svg>
          </div>

          <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl tracking-tight text-white mb-6 drop-shadow-2xl">
            Moses Wire Arts
          </h1>
          
          <p className="font-sans text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium text-white/70 mb-12 drop-shadow-lg">
            Rooted in Mastery. Crafted for the Modern Space.
          </p>
        </motion.div>
      </div>

      {/* Scroll-Revealed CTA Container - Absolute bottom to stay clear of the central art */}
      <motion.div 
        style={{ 
          opacity: ctaOpacity,
          y: ctaTranslateY
        }}
        className="absolute bottom-32 left-0 right-0 z-30 flex flex-col items-center gap-10 px-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl">
          <button 
            onClick={onNavigateToShop}
            className="w-full sm:w-auto px-12 py-5 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-100 transition-all rounded-full shadow-2xl transform hover:scale-105"
          >
            Explore Collection
          </button>
          <a 
            href="https://m.me/MosesRagay"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 border border-white/20 bg-black/20 backdrop-blur-md text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 hover:border-white/50 transition-all rounded-full shadow-2xl transform hover:scale-105"
          >
            <MessageCircle size={16} />
            Message Designer
          </a>
        </div>

        {/* Social Links inside the revealed group */}
        <div className="flex gap-8 justify-center">
          <a href="https://www.instagram.com/moseswireartworks/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" title="Follow on Instagram">
             <Instagram strokeWidth={1} size={24} />
          </a>
          <a href="https://www.facebook.com/MosesRagay" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" title="Follow on Facebook">
             <Facebook strokeWidth={1} size={24} />
          </a>
        </div>
      </motion.div>

      {/* Scroll indicator line */}
      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2, duration: 2 }}
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </div>
  );
}

