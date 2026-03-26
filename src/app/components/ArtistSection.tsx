import { motion } from 'motion/react';
import { Award, Palette, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ArtistSection() {
  return (
    <section id="artist" className="py-16 md:py-24 bg-gray-50 scroll-mt-16 md:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Artist Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 md:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1731850040444-5194b805f2b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjB3aXJlJTIwYXJ0JTIwZGVzaWdufGVufDF8fHx8MTc3NDE3NjE2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Moises Ragay - Wire Artist"
                className="w-full h-[400px] md:h-[600px] object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-[200px] md:max-w-xs">
              <p className="text-3xl md:text-4xl mb-1">15+</p>
              <p className="text-sm text-gray-600">Years of Experience</p>
            </div>
          </motion.div>

          {/* Artist Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <span className="text-xs md:text-sm tracking-wider text-gray-600 uppercase mb-3 md:mb-4 block">
              Meet the Artist
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-4 md:mb-6 tracking-tight">
              Moises Ragay
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
              A master wire sculptor with over 15 years of experience, Moises Ragay transforms simple
              wire into extraordinary works of art. His unique approach combines traditional metalworking
              techniques with contemporary design philosophy, resulting in pieces that are both
              timeless and modern.
            </p>
            <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-10 leading-relaxed">
              Each sculpture is a testament to his dedication to craftsmanship, attention to detail,
              and passion for pushing the boundaries of what's possible with wire as a medium.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="text-center p-4 bg-white rounded-xl">
                <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-lg md:text-2xl mb-1">12+</p>
                <p className="text-xs md:text-sm text-gray-600">Awards</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <Palette className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-lg md:text-2xl mb-1">200+</p>
                <p className="text-xs md:text-sm text-gray-600">Creations</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <Heart className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-700" />
                <p className="text-lg md:text-2xl mb-1">1000+</p>
                <p className="text-xs md:text-sm text-gray-600">Happy Clients</p>
              </div>
            </div>

            <button className="bg-black text-white px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-gray-800 transition-colors text-sm md:text-base">
              View Full Portfolio
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
