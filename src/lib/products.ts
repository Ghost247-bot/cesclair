export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  category: string;
  gender: 'women' | 'men';
}

export const products: Product[] = [
  // Women's Sweaters
  { id: 'w1', name: 'The Cashmere Crew', price: 100, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg', colors: 8, category: 'sweaters', gender: 'women' },
  { id: 'w2', name: 'The Wool-Cashmere Oversized Crew', price: 110, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 6, category: 'sweaters', gender: 'women' },
  { id: 'w3', name: 'The Alpaca Cardigan', price: 150, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg', colors: 5, category: 'sweaters', gender: 'women' },
  { id: 'w4', name: 'The ReCashmere Mockneck', price: 95, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/5cde1622_bc63-14.jpg', colors: 4, category: 'sweaters', gender: 'women' },
  
  // Women's Pants
  { id: 'w5', name: 'The Way-High Drape Pant', price: 108, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/0f25034f_872d-5.jpg', colors: 5, category: 'pants', gender: 'women' },
  { id: 'w6', name: 'The Dream Pant', price: 88, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg', colors: 6, category: 'pants', gender: 'women' },
  { id: 'w7', name: 'The Wide Leg Crop Pant', price: 98, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/0f25034f_872d-5.jpg', colors: 4, category: 'pants', gender: 'women' },
  
  // Women's Denim
  { id: 'w8', name: 'The Way-High Jean', price: 88, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 3, category: 'denim', gender: 'women' },
  { id: 'w9', name: 'The Relaxed Jean', price: 78, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 4, category: 'denim', gender: 'women' },
  { id: 'w10', name: 'The Authentic Stretch Jean', price: 68, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 5, category: 'denim', gender: 'women' },
  
  // Women's Outerwear
  { id: 'w11', name: 'The ReDown Puffer', price: 298, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 3, category: 'outerwear', gender: 'women' },
  { id: 'w12', name: 'The Wool Overcoat', price: 348, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 2, category: 'outerwear', gender: 'women' },
  { id: 'w13', name: 'The Quilted Jacket', price: 168, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 4, category: 'outerwear', gender: 'women' },
  
  // Women's Shoes
  { id: 'w14', name: 'The Day Heel', price: 155, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/f9db9668_e24a-8.jpg', colors: 4, category: 'shoes', gender: 'women' },
  { id: 'w15', name: 'The Editor Slingback', price: 165, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/f9db9668_e24a-8.jpg', colors: 5, category: 'shoes', gender: 'women' },
  { id: 'w16', name: 'The Day Boot', price: 225, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/f9db9668_e24a-8.jpg', colors: 3, category: 'shoes', gender: 'women' },
  
  // Women's Tees & Tops
  { id: 'w17', name: 'The Cotton Box-Cut Tee', price: 25, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 10, category: 'tees-tops', gender: 'women' },
  { id: 'w18', name: 'The Air Oversized Crew', price: 35, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 8, category: 'tees-tops', gender: 'women' },
  { id: 'w19', name: 'The Pima Micro-Rib Tank', price: 18, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 12, category: 'tees-tops', gender: 'women' },
  
  // Women's Sale
  { id: 'w20', name: 'The Cashmere Turtleneck', price: 70, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg', colors: 3, category: 'sale', gender: 'women' },
  { id: 'w21', name: 'The Slim Jean', price: 48, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 2, category: 'sale', gender: 'women' },
  
  // Men's Sweaters
  { id: 'm1', name: 'The Cashmere Crew', price: 100, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg', colors: 6, category: 'sweaters', gender: 'men' },
  { id: 'm2', name: 'The Organic Cotton Crewneck', price: 55, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg', colors: 8, category: 'sweaters', gender: 'men' },
  { id: 'm3', name: 'The Wool Bomber', price: 178, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg', colors: 3, category: 'sweaters', gender: 'men' },
  
  // Men's Pants
  { id: 'm4', name: 'The Performance Chino', price: 78, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg', colors: 5, category: 'pants', gender: 'men' },
  { id: 'm5', name: 'The Drape Pant', price: 98, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg', colors: 4, category: 'pants', gender: 'men' },
  { id: 'm6', name: 'The Track Pant', price: 68, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg', colors: 6, category: 'pants', gender: 'men' },
  
  // Men's Denim
  { id: 'm7', name: 'The Slim Fit Jean', price: 78, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 4, category: 'denim', gender: 'men' },
  { id: 'm8', name: 'The Regular Fit Jean', price: 68, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 3, category: 'denim', gender: 'men' },
  { id: 'm9', name: 'The Athletic Fit Jean', price: 78, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1996bc0b_bdd3-6.jpg', colors: 5, category: 'denim', gender: 'men' },
  
  // Men's Outerwear  
  { id: 'm10', name: 'The ReNew Parka', price: 248, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 3, category: 'outerwear', gender: 'men' },
  { id: 'm11', name: 'The Bomber Jacket', price: 198, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 2, category: 'outerwear', gender: 'men' },
  { id: 'm12', name: 'The Field Jacket', price: 178, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/74db686e_9039-7.jpg', colors: 4, category: 'outerwear', gender: 'men' },
  
  // Men's New Arrivals (mix of categories)
  { id: 'm13', name: 'The Cotton Poplin Shirt', price: 68, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 7, category: 'new-arrivals', gender: 'men' },
  { id: 'm14', name: 'The Performance Polo', price: 48, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 5, category: 'new-arrivals', gender: 'men' },
  
  // Men's Sale
  { id: 'm15', name: 'The Essential Tee', price: 15, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg', colors: 4, category: 'sale', gender: 'men' },
  { id: 'm16', name: 'The Weekend Chino', price: 45, image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg', colors: 3, category: 'sale', gender: 'men' },
];

export function getProductsByCategory(category: string, gender: 'women' | 'men'): Product[] {
  return products.filter(p => p.category === category && p.gender === gender);
}

export function getProductsByGender(gender: 'women' | 'men'): Product[] {
  return products.filter(p => p.gender === gender);
}
