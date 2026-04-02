import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/app/components/ui/utils";

// --- PROPS INTERFACE ---
interface PhotoStackCardProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  category: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
}

// --- FRAMER MOTION VARIANTS ---
const imageContainerVariants = {
  initial: {},
  hover: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const imageVariants = {
  initial: { scale: 1, rotate: 0, y: 0 },
  hover: (i: number) => ({
    scale: 1.05,
    rotate: (i - 1) * 10,
    y: -20,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
    transition: { type: "spring", stiffness: 300, damping: 20 },
  }),
};

const cardVariants = {
  inactive: {
    scale: 1,
    y: 0,
    zIndex: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  active: {
    scale: 1.05,
    y: -15,
    zIndex: 10,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export const PhotoStackCard = React.forwardRef<
  HTMLDivElement,
  PhotoStackCardProps
>(({ className, images, category, title, subtitle, isActive, ...props }, ref) => {
  const displayImages = images.slice(0, 3);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "group relative flex h-72 w-72 cursor-pointer flex-col justify-start rounded-xl bg-zinc-900/50 backdrop-blur-sm p-6 shadow-xl border border-white/5",
        "transition-colors duration-300 ease-in-out hover:bg-zinc-800/80",
        className
      )}
      variants={cardVariants}
      animate={isActive ? "active" : "inactive"}
      {...props}
    >
      {/* Text Content */}
      <div className="z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {category}
        </p>
        <h2 className="mt-1 text-2xl font-serif font-bold text-white tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-xs text-white/30 font-medium">{subtitle}</p>
      </div>

      {/* Image Stack */}
      <motion.div
        className="absolute bottom-0 right-0 h-48 w-full pointer-events-none"
        variants={imageContainerVariants}
        initial="initial"
        whileHover="hover"
      >
        <AnimatePresence>
          {displayImages.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt={`${title} memory image ${i + 1}`}
              custom={i}
              variants={imageVariants}
              className="absolute bottom-[-10px] right-6 h-36 w-auto origin-bottom-center rounded-lg border-2 border-black/50 object-cover shadow-2xl"
              style={{
                transform: `rotate(${(i - 1) * 4}deg)`,
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});
PhotoStackCard.displayName = "PhotoStackCard";
