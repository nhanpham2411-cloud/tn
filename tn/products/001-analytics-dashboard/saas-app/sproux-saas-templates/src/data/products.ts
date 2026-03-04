export interface Product {
  id: string
  name: string
  description: string
  category: "electronics" | "fashion" | "accessories" | "sports" | "home"
  price: number
  status: "active" | "draft" | "archived"
  stock: number
  sales: number
  rating: number
  image: string
  imageUrl: string
  images: string[]
  createdAt: string
}

// Helper: build image array from CDN path (most products have 1-4 images)
function imgs(base: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `${base}/${i + 1}.webp`)
}

// Consumer products — all URLs verified against dummyjson.com/products API
const productCatalog: { name: string; category: Product["category"]; price: number; images: string[] }[] = [
  // Electronics
  { name: "Apple AirPods Pro", category: "electronics", price: 249, images: imgs("https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods", 3) },
  { name: "MacBook Pro 14\"", category: "electronics", price: 1999, images: imgs("https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey", 3) },
  { name: "iPhone 13 Pro", category: "electronics", price: 1199, images: imgs("https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro", 3) },
  { name: "Samsung Galaxy S10", category: "electronics", price: 899, images: imgs("https://cdn.dummyjson.com/product-images/smartphones/samsung-galaxy-s10", 3) },
  { name: "iPad Mini 2021", category: "electronics", price: 599, images: imgs("https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight", 4) },
  { name: "Apple AirPods Max", category: "electronics", price: 549, images: ["https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp"] },
  // Fashion
  { name: "Nike Air Jordan 1", category: "fashion", price: 179, images: imgs("https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black", 4) },
  { name: "Puma Future Rider", category: "fashion", price: 119, images: imgs("https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers", 4) },
  { name: "Sports Sneakers", category: "fashion", price: 89, images: imgs("https://cdn.dummyjson.com/product-images/mens-shoes/sports-sneakers-off-white-red", 4) },
  { name: "Nike Baseball Cleats", category: "fashion", price: 169, images: imgs("https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats", 4) },
  { name: "Calvin Klein Heels", category: "fashion", price: 189, images: imgs("https://cdn.dummyjson.com/product-images/womens-shoes/calvin-klein-heel-shoes", 4) },
  { name: "Red Shoes", category: "fashion", price: 99, images: imgs("https://cdn.dummyjson.com/product-images/womens-shoes/red-shoes", 4) },
  // Accessories
  { name: "Rolex Datejust", category: "accessories", price: 4999, images: imgs("https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust", 3) },
  { name: "Black Sun Glasses", category: "accessories", price: 89, images: imgs("https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses", 3) },
  { name: "Prada Women Bag", category: "accessories", price: 129, images: imgs("https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag", 3) },
  { name: "Green Crystal Earring", category: "accessories", price: 79, images: imgs("https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring", 3) },
  { name: "Gucci Bloom Perfume", category: "accessories", price: 149, images: imgs("https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de", 3) },
  { name: "Longines Master Watch", category: "accessories", price: 2499, images: imgs("https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection", 3) },
  // Sports
  { name: "Cricket Bat", category: "sports", price: 69, images: ["https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/1.webp"] },
  { name: "Tennis Racket", category: "sports", price: 159, images: ["https://cdn.dummyjson.com/product-images/sports-accessories/tennis-racket/1.webp"] },
  { name: "Football", category: "sports", price: 39, images: ["https://cdn.dummyjson.com/product-images/sports-accessories/football/1.webp"] },
  { name: "Basketball", category: "sports", price: 49, images: ["https://cdn.dummyjson.com/product-images/sports-accessories/basketball/1.webp"] },
  { name: "Baseball Glove", category: "sports", price: 89, images: imgs("https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove", 3) },
  { name: "Cricket Helmet", category: "sports", price: 129, images: imgs("https://cdn.dummyjson.com/product-images/sports-accessories/cricket-helmet", 4) },
  // Home
  { name: "Table Lamp", category: "home", price: 69, images: ["https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp"] },
  { name: "Decoration Swing", category: "home", price: 45, images: imgs("https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing", 3) },
  { name: "House Showpiece Plant", category: "home", price: 39, images: imgs("https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant", 3) },
  { name: "Plant Pot", category: "home", price: 55, images: imgs("https://cdn.dummyjson.com/product-images/home-decoration/plant-pot", 4) },
  { name: "Family Photo Frame", category: "home", price: 29, images: ["https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/1.webp"] },
  { name: "Annibale Colombo Sofa", category: "home", price: 2499, images: imgs("https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa", 3) },
]

const descriptions: Record<Product["category"], string> = {
  electronics: "Premium tech for modern living",
  fashion: "Stylish footwear for every occasion",
  accessories: "Complete your look with timeless pieces",
  sports: "Performance gear for active lifestyles",
  home: "Elevate your living space",
}

const statuses: Product["status"][] = ["active", "active", "active", "active", "draft", "archived"]

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0]
}

export const products: Product[] = productCatalog.map((item, i) => ({
  id: `PRD-${String(i + 1).padStart(3, "0")}`,
  name: item.name,
  description: `${item.name} — ${descriptions[item.category]}.`,
  category: item.category,
  price: item.price,
  status: statuses[i % statuses.length],
  stock: randomBetween(0, 500),
  sales: randomBetween(50, 5000),
  rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
  image: item.name.slice(0, 2).toUpperCase(),
  imageUrl: item.images[0],
  images: item.images,
  createdAt: randomDate("2024-01-01", "2026-02-01"),
}))
