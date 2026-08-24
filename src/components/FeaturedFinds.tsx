import React from 'react';
import ProductCard from './ProductCard';

const mockProducts = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 1200,
    size: 'M',
    condition: 'Good',
    image: '🧥',
  },
  {
    id: 2,
    name: 'Oversized Graphic Tee',
    price: 450,
    size: 'L',
    condition: 'Like New',
    image: '👕',
  },
  {
    id: 3,
    name: 'Linen Trousers',
    price: 800,
    size: '30',
    condition: 'Good',
    image: '👖',
  },
  {
    id: 4,
    name: 'Vintage Floral Dress',
    price: 950,
    size: 'S',
    condition: 'Good',
    image: '👗',
  },
  {
    id: 5,
    name: 'White Canvas Sneakers',
    price: 600,
    size: '7',
    condition: 'Like New',
    image: '👟',
  },
  {
    id: 6,
    name: 'Canvas Tote Bag',
    price: 350,
    size: 'One Size',
    condition: 'Good',
    image: '👜',
  },
];

export default function FeaturedFinds() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Finds</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            size={product.size}
            condition={product.condition}
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
}
