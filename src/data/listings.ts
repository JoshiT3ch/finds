export interface Listing {
  id: number;
  slug: string;
  name: string;
  price: number;
  size: string;
  condition: string;
  category: string;
  description: string;
  sellerName: string;
  location: string;
  image: string;
  brand?: string;
}

export const listings: Listing[] = [
  {
    id: 1,
    slug: 'vintage-denim-jacket',
    name: 'Vintage Denim Jacket',
    price: 1200,
    size: 'M',
    condition: 'Good',
    category: 'Jackets',
    description:
      'Classic vintage denim jacket in excellent condition. Perfect for layering over any outfit. Has some fading that adds to the vintage charm.',
    sellerName: 'Maria Santos',
    location: 'Manila, Metro Manila',
    image: '🧥',
    brand: 'Levi\'s',
  },
  {
    id: 2,
    slug: 'oversized-graphic-tee',
    name: 'Oversized Graphic Tee',
    price: 450,
    size: 'L',
    condition: 'Like New',
    category: 'Tops',
    description:
      'Comfortable oversized graphic tee with a cool vintage band design. Barely worn, in pristine condition.',
    sellerName: 'Alex Rivera',
    location: 'Quezon City, Metro Manila',
    image: '👕',
  },
  {
    id: 3,
    slug: 'linen-trousers',
    name: 'Linen Trousers',
    price: 800,
    size: '30',
    condition: 'Good',
    category: 'Bottoms',
    description:
      'Lightweight linen trousers perfect for warm weather. Natural color, relaxed fit. Great for casual or smart-casual looks.',
    sellerName: 'James Reyes',
    location: 'Makati, Metro Manila',
    image: '👖',
  },
  {
    id: 4,
    slug: 'vintage-floral-dress',
    name: 'Vintage Floral Dress',
    price: 950,
    size: 'S',
    condition: 'Good',
    category: 'Dresses',
    description:
      'Beautiful vintage floral dress from the 90s. Midi length with a flattering fit. Some gentle wear consistent with age.',
    sellerName: 'Sofia Chen',
    location: 'Pasig, Metro Manila',
    image: '👗',
  },
  {
    id: 5,
    slug: 'white-canvas-sneakers',
    name: 'White Canvas Sneakers',
    price: 600,
    size: '7',
    condition: 'Like New',
    category: 'Shoes',
    description:
      'Clean white canvas sneakers in a timeless style. Worn only a few times. Perfect everyday shoes.',
    sellerName: 'Juan Dela Cruz',
    location: 'Taguig, Metro Manila',
    image: '👟',
  },
  {
    id: 6,
    slug: 'canvas-tote-bag',
    name: 'Canvas Tote Bag',
    price: 350,
    size: 'One Size',
    condition: 'Good',
    category: 'Accessories',
    description:
      'Sturdy canvas tote bag, perfect for daily use or travel. Natural color, spacious interior. Shows minimal signs of wear.',
    sellerName: 'Emma Gonzalez',
    location: 'Las Piñas, Metro Manila',
    image: '👜',
  },
];

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((listing) => listing.slug === slug);
}

export function getListingsByCategory(category: string): Listing[] {
  return listings.filter(
    (listing) => listing.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRelatedListings(
  currentSlug: string,
  limit: number = 3
): Listing[] {
  const currentListing = getListingBySlug(currentSlug);
  if (!currentListing) return [];

  // First, get items from same category (excluding current item)
  const sameCategory = listings.filter(
    (listing) =>
      listing.category === currentListing.category &&
      listing.slug !== currentSlug
  );

  // If we have enough from same category, return those
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Otherwise, combine with other items
  const others = listings.filter(
    (listing) =>
      listing.category !== currentListing.category &&
      listing.slug !== currentSlug
  );

  return [...sameCategory, ...others].slice(0, limit);
}
