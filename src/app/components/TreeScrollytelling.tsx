'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

interface TreeScrollytellingProps {
  totalPages?: number;
  onNavigateToShop?: () => void;
}

const TOTAL_FRAMES = 242;
const FRAME_PREFIX = 'frame-';
const FRAME_SUFFIX = '.png';
const FRAME_DIR = 'wire-frames';

export function TreeScrollytelling({ totalPages = 4, onNavigateToShop }: TreeScrollytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const prevFrameRef = useRef<number>(-1);
  const geometryRef = useRef<{ scale: number, x: number, y: number } | null>(null);

  // 1. Scroll-linked mapping
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress (0-1) to frame index (0-241)
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  // 2. Preload Images
  useEffect(() => {
    const loadImages = async () => {
      const imgPromises = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          // No padding needed, using frame-1.png...frame-242.png
          // Cache buster v=1 for fresh load
          img.src = `/${FRAME_DIR}/${FRAME_PREFIX}${i + 1}${FRAME_SUFFIX}?v=1`;
          img.onload = () => {
            setLoadedCount(prev => prev + 1);
            resolve(img);
          };
          img.onerror = () => {
             console.warn(`Failed to load: /${FRAME_DIR}/${FRAME_PREFIX}${i + 1}${FRAME_SUFFIX}`);
             setLoadedCount(prev => prev + 1);
             // Resolve with null to avoid blocking Promise.all
             resolve(null as any); 
          };
        });
      });

      try {
        const loadedImages = await Promise.all(imgPromises);
        setImages(loadedImages);
        
        // Extract the exact background color from the corner of the first frame
        // to make the blend completely seamless
        let extractedColor = '#FFFFFF';
        if (loadedImages[0]) {
           const tempCanvas = document.createElement('canvas');
           tempCanvas.width = 20;
           tempCanvas.height = 20;
           const tCtx = tempCanvas.getContext('2d');
           if (tCtx) {
              // Draw image without scaling it down
              tCtx.drawImage(loadedImages[0], 0, 0);
              // Sample a pixel slightly inward to avoid edge artifacts
              const [r, g, b] = tCtx.getImageData(10, 10, 1, 1).data;
              extractedColor = `rgb(${r}, ${g}, ${b})`;
              setBgColor(extractedColor);
              // Also apply to document body so entire page matches
              document.body.style.backgroundColor = extractedColor;
           }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    loadImages();
  }, []);

  // 3. Draw to Canvas on Scroll Frame Change

  // 3. Render logic

  const renderFrame = (latestFrameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const imgIndex = clamp(Math.floor(latestFrameIndex), 0, TOTAL_FRAMES - 1);
    
    // OPTIMIZATION: Skip re-draw if frame hasn't changed
    if (imgIndex === prevFrameRef.current && geometryRef.current) return;
    prevFrameRef.current = imgIndex;

    const img = images[imgIndex];
    if (img) {
      if (!geometryRef.current) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        geometryRef.current = {
          scale,
          x: (canvasWidth / 2) - (imgWidth / 2) * scale,
          y: (canvasHeight / 2) - (imgHeight / 2) * scale
        };
      }

      const { scale, x, y } = geometryRef.current;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  // 3. Draw to Canvas on Scroll Frame Change
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    // Use motion's onChange to trigger canvas updates
    const unsubscribe = frameIndex.on("change", renderFrame);
    
    // Initial draw
    renderFrame(frameIndex.get());

    return () => unsubscribe();
  }, [images, frameIndex, renderFrame]);

  // 4. Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Invalidate geometry cache on resize
        geometryRef.current = null;
        prevFrameRef.current = -1;
        
        if (images.length > 0) {
          renderFrame(frameIndex.get());
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameIndex]);

  return (
    <div ref={containerRef} className="relative h-[600vh]" style={{ backgroundColor: bgColor }}>
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Elegant Editorial Watermark Cover */}
        <div 
          className="absolute bottom-0 right-0 z-10 w-[80vw] max-w-[800px] h-[50vh] max-h-[500px] pointer-events-none flex items-end justify-end p-8 md:p-12"
          style={{ 
            background: `radial-gradient(ellipse at bottom right, ${bgColor} 15%, transparent 70%)`
          }}
        >
          <div className="text-right">
            <p className="font-sans text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-semibold text-black/50 leading-relaxed mb-6 md:mb-12">
              © 2026 Moses Wire Arts<br/>
              Handcrafted Excellence
            </p>
          </div>
        </div>

        {/* Premium Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }}
              // Changed from absolute to fixed and high z-index to cover Header during loading
              className="fixed inset-0 flex flex-col items-center justify-center z-[100] px-6"
              style={{ backgroundColor: bgColor }}
            >
              <div className="w-full max-w-sm flex flex-col items-center gap-8">
                {/* Generative Wire Art SVG Loader */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  className="mb-4"
                >
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible stroke-[1.5px] stroke-black drop-shadow-sm">
                    {/* Shadow/Ghost Wire */}
                    <path
                      d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 C20,30 65,30 65,50 C65,70 35,70 35,50 C35,40 55,40 55,50 C55,60 45,60 45,50"
                      className="stroke-black/5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* The Unspooling Wire, tracking load progress perfectly */}
                    <motion.path
                      d="M20,50 C20,20 80,20 80,50 C80,80 20,80 20,50 C20,30 65,30 65,50 C65,70 35,70 35,50 C35,40 55,40 55,50 C55,60 45,60 45,50"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: loadedCount / TOTAL_FRAMES }}
                      transition={{ ease: "linear", duration: 0.1 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>

                <p className="font-serif text-2xl md:text-3xl tracking-wide text-black text-center">
                  Moses Wire Arts
                </p>
                
                <div className="w-full relative">
                  <div className="flex justify-between text-xs uppercase tracking-[0.3em] text-black/40 mb-3">
                    <span>Threading</span>
                    <span className="text-black font-medium">{Math.round((loadedCount / TOTAL_FRAMES) * 100)}%</span>
                  </div>
                  {/* Fine Line representing pulled wire */}
                  <div className="h-[1px] w-full bg-black/5 relative overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Scroll Prompt */}
        <ScrollIndicator progress={scrollYProgress} />

        {/* Text Overlays - Scroll Triggered Sections */}
        {/* First text block */}
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.1, 0.35]} 
          title="Rooted in Mastery."
          subtitle="A FOUNDATION FOR EXCELLENCE."
          align="center"
        />
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.45, 0.7]} 
          title="Organic Balance."
          subtitle="CRAFTED FOR THE MODERN SPACE."
          align="center"
        />
        {/* Final Action Hub: 85% to 100% */}
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.85, 1]} 
          primaryCTA={{
            label: "Inquire About Commission",
            onClick: () => window.location.href = 'mailto:inquiries@moseswirearts.com?subject=Inquiry:%20Custom%20Wire%20Art%20Commission'
          }}
          secondaryCTA={{
            label: "Explore Full Collection",
            onClick: onNavigateToShop || (() => {})
          }}
          align="bottom-center"
        />
      </div>
    </div>
  );
}

// Helper clamp function
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

function SectionOverlay({ 
  progress, 
  range, 
  title, 
  subtitle, 
  align = 'center',
  primaryCTA,
  secondaryCTA
}: { 
  progress: any, 
  range: [number, number], 
  title?: string, 
  subtitle?: string,
  align?: 'middle-left' | 'top-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'center',
  primaryCTA?: { label: string, onClick: () => void },
  secondaryCTA?: { label: string, onClick: () => void }
}) {
  const [showSecondary, setShowSecondary] = useState(false);

  useEffect(() => {
    let timer: any;
    const unsubscribe = progress.on("change", (latest: number) => {
      if (secondaryCTA && latest >= range[0] && latest <= range[1] && !showSecondary) {
        if (!timer) {
          timer = setTimeout(() => setShowSecondary(true), 5000);
        }
      }
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [secondaryCTA, progress, range, showSecondary]);
  // If this is the final section (range ends at 1), keep it fully visible at the end
  const endOpacity = range[1] === 1 ? 1 : 0;
  const opacity = useTransform(progress, [range[0], range[0] + 0.05, range[1] - 0.05, range[1]], [0, 1, 1, endOpacity]);
  
  // Subtle parallax
  const endY = range[1] === 1 ? 0 : -20;
  const y = useTransform(progress, [range[0], range[0] + 0.1, range[1]], [20, 0, endY]);

  const alignmentClasses = {
    'middle-left': 'top-1/2 -translate-y-1/2 left-6 md:left-12 lg:left-24 text-left items-start',
    'middle-right': 'top-1/2 -translate-y-1/2 right-6 md:right-12 lg:right-24 text-right items-end',
    'bottom-center': 'bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 text-center items-center',
    'center': 'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-center items-center w-[95vw] md:w-auto'
  };

  return (
    <motion.div 
      style={{ opacity, y }}
      className={`absolute flex flex-col pointer-events-none z-20 md:max-w-none ${alignmentClasses[align as keyof typeof alignmentClasses] || alignmentClasses['center']}`}
    >
      {/* High-Contrast Radial Glow Behind Text (only if title exists) */}
      {title && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.6)_40%,transparent_70%)] -z-10 scale-[1.5] md:scale-[1.8] blur-xl pointer-events-none" />}

      {title && (
        <h2 className="font-serif text-5xl md:text-7xl lg:text-[7rem] tracking-tight text-black leading-[1.05] mb-6 font-medium drop-shadow-[0_2px_10px_rgba(255,255,255,1)]">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="font-sans text-[10px] md:text-sm uppercase tracking-[0.3em] text-black/70 font-medium mb-12 drop-shadow-[0_2px_10px_rgba(255,255,255,1)]">
          {subtitle}
        </p>
      )}
      
      {(primaryCTA || secondaryCTA) && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-0 mt-8 w-full max-w-2xl px-6 pointer-events-auto overflow-hidden rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-black/5 bg-white/20 backdrop-blur-2xl">
          {primaryCTA && (
            <motion.button 
              onClick={primaryCTA.onClick}
              animate={{ 
                boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 30px rgba(0,0,0,0.2)", "0 0 0px rgba(0,0,0,0)"] 
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="group relative flex-1 px-8 md:px-12 py-6 bg-black text-white text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold overflow-hidden transition-all duration-500 hover:bg-black/90 active:scale-[0.98]"
            >
              <span className="relative z-10">{primaryCTA.label}</span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                animate={{ translateX: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear", delay: 1 }}
              />
            </motion.button>
          )}
          {secondaryCTA && showSecondary && (
            <motion.button 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onClick={secondaryCTA.onClick}
              className="group flex-1 px-8 md:px-12 py-6 bg-white/10 hover:bg-white/40 text-black text-[10px] md:text-xs uppercase tracking-[0.25em] font-semibold whitespace-nowrap transition-all duration-500 border-l border-black/5 active:scale-[0.98]"
            >
              {secondaryCTA.label}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ScrollIndicator({ progress }: { progress: any }) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer: any;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), 4000);
    };

    // Initial timer
    timer = setTimeout(() => setIsIdle(true), 4000);

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('scroll', resetIdle);
    window.addEventListener('touchstart', resetIdle);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('scroll', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
    };
  }, []);

  // Fade out completely by 5% scroll depth
  const scrollOpacity = useTransform(progress, [0, 0.05], [1, 0]);
  
  // Only show if we are near the top (progress < 0.1) and we are idle
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    const unsubscribe = progress.on("change", (latest: number) => {
      // Show ONLY if the user is idle AND we haven't reached the action hub yet
      setShouldShow(latest < 0.8 && isIdle);
    });
    return () => unsubscribe();
  }, [progress, isIdle]);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        opacity: shouldShow ? 1 : 0,
        y: ["-50%", "-45%", "-50%"] 
      }}
      transition={{ 
        opacity: { duration: 1 },
        y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
      }}
      className="absolute left-12 md:left-24 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-[30] pointer-events-none drop-shadow-lg"
    >
      <div className="w-8 h-12 md:w-10 md:h-16 border-[1.5px] md:border-2 border-black/40 rounded-full flex justify-center p-2 backdrop-blur-md bg-white/30 shadow-xl">
        <motion.div 
          className="w-2 h-3 bg-black/80 rounded-full shadow-sm"
          animate={{ y: [0, 20, 0], opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </div>
      <p className="font-sans text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-black font-bold whitespace-nowrap [writing-mode:vertical-lr] opacity-60">
        Scroll
      </p>
    </motion.div>
  );
}
