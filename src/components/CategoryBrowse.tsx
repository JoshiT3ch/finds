import React from 'react';

const categories = [
  { name: 'Tops', icon: '👕' },
  { name: 'Bottoms', icon: '👖' },
  { name: 'Jackets', icon: '🧥' },
  { name: 'Dresses', icon: '👗' },
  { name: 'Shoes', icon: '👟' },
  { name: 'Accessories', icon: '👜' },
];

export default function CategoryBrowse() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <a
            key={category.name}
            href="#"
            className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
}
