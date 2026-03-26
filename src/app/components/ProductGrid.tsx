import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart, onProductClick }: ProductGridProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4 tracking-tight">Our Collection</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each piece is meticulously crafted by hand, merging artistry with exceptional craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}