import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Heart, Ruler, Package, Shield } from "lucide-react";
import { cn } from "./ui/utils";

interface PhotoStackDetailProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    images: string[];
    category: string;
    title: string;
    subtitle: string;
    price?: number;
    description?: string;
    artist?: string;
    dimensions?: string;
    materials?: string;
    authenticity?: string;
    shipping?: string;
  } | null;
}

export function PhotoStackDetail({ isOpen, onClose, data }: PhotoStackDetailProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  if (!data) return null;

  const images = data.images || [];
  const artist = data.artist || "Moises Ragay";
  const price = data.price || 11000;
  const description = data.description || "Each piece is meticulously crafted over hundreds of hours, weaving raw metal wire into organic breathing forms. Made exclusively to order, this intricate study of nature's resilience brings an elegant, timeless artistic presence to any space.";

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    const nextIndex = (currentIndex + newDirection + images.length) % images.length;
    setDirection(newDirection);
    setCurrentIndex(nextIndex);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-6xl h-auto md:h-[85vh] bg-[#0A0A0A] border border-white/5 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-[80] p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-colors group"
              >
                <X size={20} className="text-white group-hover:scale-110 transition-transform" />
              </button>

              {/* Left Side: Photo Carousel */}
              <div className="relative w-full md:w-[60%] h-[400px] md:h-full bg-black overflow-hidden flex items-center justify-center border-r border-white/5">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </AnimatePresence>

                {/* Category Badge */}
                <div className="absolute top-8 left-8 z-20">
                  <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-[0.3em] font-bold text-white/90">
                    {data.category}
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 flex justify-between z-30 pointer-events-none">
                  <button
                    onClick={() => paginate(-1)}
                    className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/60 hover:text-white pointer-events-auto transition-all hover:scale-110"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => paginate(1)}
                    className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white/60 hover:text-white pointer-events-auto transition-all hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Instagram indicators (Dots) */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setDirection(i > currentIndex ? 1 : -1);
                        setCurrentIndex(i);
                      }}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        i === currentIndex 
                          ? "bg-white w-4 scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                          : "bg-white/30 hover:bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-[40%] h-full p-8 md:p-14 flex flex-col justify-between bg-[#050505]/85 backdrop-blur-3xl border-l border-[#D4AF37]/10">
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <header className="mb-10">
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white mb-2 leading-tight tracking-tight">
                      {data.title}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium">
                      BY {artist}
                    </p>
                  </header>

                  <div className="mb-12">
                    <p className="text-2xl md:text-3xl font-serif italic text-white/90 mb-10">
                      ₱{price.toLocaleString()}
                    </p>

                    <div className="space-y-10">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-4">THE STORY</h3>
                        <p className="text-sm md:text-base leading-relaxed text-white/60 font-sans tracking-wide">
                          {description}
                        </p>
                      </div>

                      {/* Specs Table */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-white/5">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                             <Ruler size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white/80">Dimensions</p>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{data.dimensions || "Custom sized"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                             <Package size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white/80">Materials</p>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{data.materials || "Premium wire"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                             <Shield size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white/80">Authenticity</p>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{data.authenticity || "Certified original"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-white/5 text-white/40">
                             <Package size={18} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white/80">Shipping</p>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">{data.shipping || "Free worldwide"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-10 border-t border-white/5">
                  <button className="w-full bg-white text-black py-6 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-zinc-200 transition-all rounded-2xl flex items-center justify-center gap-3 active:scale-95">
                    <ShoppingCart size={16} />
                    Reserve Your Piece
                  </button>
                  <button className="w-full border border-white/10 bg-white/5 text-white py-6 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-3 active:scale-95">
                    <Heart size={16} />
                    Save Piece
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
