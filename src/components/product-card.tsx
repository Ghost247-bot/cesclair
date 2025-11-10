import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  href: string;
  originalPrice?: number;
  isOnSale?: boolean;
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  colors, 
  href,
  originalPrice,
  isOnSale 
}: ProductCardProps) {
  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link href={href} className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-400 group-hover:scale-105"
        />
        {isOnSale && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-xs font-medium">
            {discountPercentage}% OFF
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-medium text-primary-text group-hover:opacity-70 transition-opacity line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs sm:text-sm text-primary-text font-medium">${price.toFixed(2)}</p>
          {originalPrice && originalPrice > price && (
            <p className="text-xs text-secondary-text line-through">${originalPrice.toFixed(2)}</p>
          )}
        </div>
        {colors && colors > 1 && (
          <p className="text-xs text-secondary-text">{colors} colors</p>
        )}
      </div>
    </Link>
  );
}
