import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onSelectForInquiry: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onSelectForInquiry, onProductClick }: ProductGridProps) {
  return (
    <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectForInquiry={onSelectForInquiry}
              onProductClick={onProductClick}
            />
          ))}
        </div>
    </div>
  );
}