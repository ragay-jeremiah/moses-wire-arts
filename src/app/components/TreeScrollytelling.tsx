'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';

interface TreeScrollytellingProps {
  totalPages?: number;
}

const TOTAL_FRAMES = 242;
const FRAME_PREFIX = 'frame-';
const FRAME_SUFFIX = '.png';
const FRAME_DIR = 'wire-frames';

export function TreeScrollytelling({ totalPages = 4 }: TreeScrollytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          img.onload = () => resolve(img);
          img.onerror = () => {
             console.warn(`Failed to load: /${FRAME_DIR}/${FRAME_PREFIX}${i + 1}${FRAME_SUFFIX}`);
             // Resolve with null to avoid blocking Promise.all
             resolve(null as any); 
          };
        });
      });

      try {
        const loadedImages = await Promise.all(imgPromises);
        setImages(loadedImages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    loadImages();
  }, []);

  // 3. Draw to Canvas on Scroll Frame Change
  useEffect(() => {
    if (images.length === 0 || !canvasRef.current) return;

    const renderFrame = (latestFrameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgIndex = Math.clamp(Math.floor(latestFrameIndex), 0, TOTAL_FRAMES - 1);
      const img = images[imgIndex];

      if (img) {
        // Clear canvas and draw maintain aspect ratio (cover)
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = img.width;
        const imgHeight = img.height;

        const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const x = (canvasWidth / 2) - (imgWidth / 2) * scale;
        const y = (canvasHeight / 2) - (imgHeight / 2) * scale;

        // Use pure white for clearing canvas to match new images
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, imgWidth * scale, imgHeight * scale);
      }
    };

    // Use motion's onChange to trigger canvas updates
    const unsubscribe = frameIndex.on("change", renderFrame);
    
    // Initial draw
    renderFrame(frameIndex.get());

    return () => unsubscribe();
  }, [images, frameIndex]);

  // 4. Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Re-render current frame if images are loaded
        if (images.length > 0) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
             const latestFrameIndex = frameIndex.get();
             const imgIndex = Math.clamp(Math.floor(latestFrameIndex), 0, TOTAL_FRAMES - 1);
             const img = images[imgIndex];
             if (img) {
                const scale = Math.max(canvasRef.current.width / img.width, canvasRef.current.height / img.height);
                const x = (canvasRef.current.width / 2) - (img.width / 2) * scale;
                const y = (canvasRef.current.height / 2) - (img.height / 2) * scale;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
             }
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, [images, frameIndex]);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-white">
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        <canvas 
          ref={canvasRef}
          className="w-full h-full object-cover pointer-events-none"
        />

        {/* Loading State Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white flex items-center justify-center z-50"
            >
              <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Overlays - Scroll Triggered Sections */}
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0, 0.15]} 
          title="Rooted in Artistry." 
        />
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.25, 0.45]} 
          title="Stone & Thread." 
          subtitle="A Foundation for Excellence."
          align="left"
        />
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.55, 0.75]} 
          title="Organic Balance." 
          subtitle="Crafted for the Modern Space."
          align="right"
        />
        <SectionOverlay 
          progress={scrollYProgress} 
          range={[0.85, 1]} 
          title="Experience the Evolution."
          subtitle="A New Standard in Wire Art."
        />
      </div>
    </div>
  );
}

// Math.clamp helper
const Math = {
  ...window.Math,
  clamp: (val: number, min: number, max: number) => window.Math.min(window.Math.max(val, min), max)
};

// Helper component for animated text sections
function SectionOverlay({ 
  progress, 
  range, 
  title, 
  subtitle, 
  align = 'center' 
}: { 
  progress: any, 
  range: [number, number], 
  title: string, 
  subtitle?: string,
  align?: 'left' | 'right' | 'center'
}) {
  const opacity = useTransform(progress, [range[0], range[0] + 0.05, range[1] - 0.05, range[1]], [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[0] + 0.1, range[1]], [20, 0, -20]);

  const alignmentClasses = {
    left: 'left-10 md:left-24 text-left items-start',
    right: 'right-10 md:right-24 text-right items-end',
    center: 'left-1/2 -translate-x-1/2 text-center items-center'
  };

  return (
    <motion.div 
      style={{ opacity, y }}
      className={`absolute top-1/2 -translate-y-1/2 flex flex-col pointer-events-none z-20 ${alignmentClasses[align]}`}
    >
      <h2 className="text-4xl md:text-7xl font-light tracking-tight text-black mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-2xl text-black/60 font-medium">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
