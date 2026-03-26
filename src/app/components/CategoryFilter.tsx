interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = ['All', 'Abstract', 'Geometric', 'Organic', 'Minimal'];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-3 rounded-full text-sm transition-all ${
            selectedCategory === category
              ? 'bg-black text-white shadow-lg'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-black'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
