import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm tracking-wider text-gray-600 uppercase mb-4 block">
              Handcrafted Excellence
            </span>
            <h2 className="text-5xl lg:text-7xl mb-6 tracking-tight">
              Contemporary
              <br />
              Wire Art
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Discover unique, handcrafted wire sculptures that blend modern design
              with traditional craftsmanship. Each piece tells its own story.
            </p>
            <div className="flex gap-4">
              <button className="bg-black text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                Explore Collection
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right side - Featured image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758557839522-7d6150265d39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlJTIwYXJ0JTIwc2N1bHB0dXJlJTIwbWV0YWx8ZW58MXx8fHwxNzc0MTc2MTU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Featured wire art sculpture"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl">
                <p className="text-sm text-gray-600">Featured Piece</p>
                <p className="text-xl">Ethereal Dreams</p>
                <p className="text-lg">$2,450</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-gray-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gray-300 rounded-full blur-3xl opacity-20"></div>
    </section>
  );
}
