import { Category } from '@/types';

export const categories: Category[] = [
  {
    "name": "5 Frames Set",
    "slug": "5-frames-set",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.45.04-AM.webp",
    "description": "Grand 5-piece gallery wall collections designed for master bedrooms, living lounges, and expansive accent walls."
  },
  {
    "name": "Abstract Wall Frame",
    "slug": "abstract-wall-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.38.03-AM.webp",
    "description": "Contemporary abstract artwork and modern minimalism crafted to inspire emotion and dialogue."
  },
  {
    "name": "Animal Wall Frame",
    "slug": "animal-wall-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Majestic wildlife, majestic horses, and artistic animal portraits with vibrant character."
  },
  {
    "name": "Best Selling",
    "slug": "best-selling",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg",
    "description": "Our all-time most popular frame sets chosen by thousands of proud homeowners across Bangladesh."
  },
  {
    "name": "BOHO Theme Frame",
    "slug": "boho-theme-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.37.22-AM.webp",
    "description": "Warm earth tones, botanical abstracts, and bohemian chic aesthetics for serene home interiors."
  },
  {
    "name": "Car’s Frame Collection",
    "slug": "cars-frame-collection",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.39.42-AM.webp",
    "description": "High-octane supercar editions, iconic Porsche 911s, JDM legends, and automotive enthusiasm prints."
  },
  {
    "name": "Door Hanger",
    "slug": "door-hanger",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Custom engraved and printed decorative wooden door plaques and welcoming signs."
  },
  {
    "name": "Floral Frame",
    "slug": "floral-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-4.00.44-PM.webp",
    "description": "Fresh botanicals, roses, golden leaves, and vibrant flower gardens that bring nature indoors."
  },
  {
    "name": "Kids Wall Frame",
    "slug": "kids-wall-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Playful, colorful, and educational wall frames tailored for kids bedrooms and study corners."
  },
  {
    "name": "Kitchen Decor Frame",
    "slug": "kitchen-decor-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Culinary art, cozy coffee corner quotes, and chef motifs to brighten up dining and kitchen spaces."
  },
  {
    "name": "Motivational Wall Frame",
    "slug": "motivational-wall-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Powerful hustle quotes, mindset reminders, and executive office wall art to fuel ambition daily."
  },
  {
    "name": "Nature inspired Frame",
    "slug": "nature-inspired-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.37.22-AM.webp",
    "description": "Misty forests, serene ocean waves, sunsets, and picturesque landscapes for a calming aura."
  },
  {
    "name": "Religious Luxury Frame",
    "slug": "religious-luxury-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.36.27-AM.webp",
    "description": "Sacred Arabic calligraphy, Ayat-ul-Kursi, 4 Quls, and Makkah & Madinah artistic masterpieces."
  },
  {
    "name": "Top Articles",
    "slug": "top-articles",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/08/IMG_3056-1-300x225.jpeg",
    "description": "Handpicked premium editions and trending masterworks with highest customer satisfaction."
  },
  {
    "name": "Typography wall frame",
    "slug": "typography-wall-frame",
    "image": "https://genuinetask.com.bd/wp-content/uploads/2026/04/WhatsApp-Image-2026-04-02-at-2.46.39-AM.webp",
    "description": "Stylized typography, typography quotes, and graphic letterforms."
  }
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug);
}
