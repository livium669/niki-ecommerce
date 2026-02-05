export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in cents
  category: {
    name: string;
    slug: string;
  };
  gender: {
    label: string;
    slug: string;
  };
  colors: {
    name: string;
    slug: string;
    hexCode: string;
  }[];
  sizes: {
    name: string;
    slug: string;
  }[];
  images: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

export const mockProducts: MockProduct[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: "Air One Dark",
    slug: "air-one-dark",
    description: "High-performance running shoe.",
    price: 24000,
    category: { name: "Performance", slug: "performance" },
    gender: { label: "Men", slug: "men" },
    colors: [
      { name: "Black", slug: "black", hexCode: "#000000" },
      { name: "White", slug: "white", hexCode: "#FFFFFF" }
    ],
    sizes: [
      { name: "S", slug: "s" },
      { name: "M", slug: "m" },
      { name: "L", slug: "l" }
    ],
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop"],
    isFeatured: true,
    stock: 5
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: "Void Runner",
    slug: "void-runner",
    description: "Lifestyle shoe for everyday comfort.",
    price: 19000,
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Women", slug: "women" },
    colors: [
      { name: "White", slug: "white", hexCode: "#FFFFFF" },
      { name: "Red", slug: "red", hexCode: "#FF0000" }
    ],
    sizes: [
      { name: "M", slug: "m" },
      { name: "L", slug: "l" }
    ],
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"],
    isNew: true,
    stock: 3
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: "Onyx Stealth",
    slug: "onyx-stealth",
    description: "Racing shoe designed for speed.",
    price: 28000,
    category: { name: "Racing", slug: "racing" },
    gender: { label: "Men", slug: "men" },
    colors: [
      { name: "Black", slug: "black", hexCode: "#000000" }
    ],
    sizes: [
      { name: "S", slug: "s" },
      { name: "M", slug: "m" }
    ],
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop"],
    isFeatured: true,
    stock: 8
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: "Shadow Elite",
    slug: "shadow-elite",
    description: "Training shoe for gym sessions.",
    price: 16000,
    category: { name: "Performance", slug: "performance" },
    gender: { label: "Women", slug: "women" },
    colors: [
      { name: "Red", slug: "red", hexCode: "#FF0000" },
      { name: "Black", slug: "black", hexCode: "#000000" }
    ],
    sizes: [
      { name: "S", slug: "s" },
      { name: "L", slug: "l" }
    ],
    images: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=800&auto=format&fit=crop"],
    stock: 12
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: "Carbon Sprint",
    slug: "carbon-sprint",
    description: "Lightweight racing shoe.",
    price: 22000,
    category: { name: "Racing", slug: "racing" },
    gender: { label: "Men", slug: "men" },
    colors: [
      { name: "White", slug: "white", hexCode: "#FFFFFF" }
    ],
    sizes: [
      { name: "M", slug: "m" },
      { name: "L", slug: "l" }
    ],
    images: ["https://images.unsplash.com/photo-1539185441755-54339c08ad6c?q=80&w=800&auto=format&fit=crop"],
    isNew: true,
    stock: 4
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: "Aero Flux",
    slug: "aero-flux",
    description: "Breathable lifestyle shoe.",
    price: 18000,
    category: { name: "Lifestyle", slug: "lifestyle" },
    gender: { label: "Women", slug: "women" },
    colors: [
      { name: "Black", slug: "black", hexCode: "#000000" },
      { name: "Red", slug: "red", hexCode: "#FF0000" }
    ],
    sizes: [
      { name: "S", slug: "s" },
      { name: "M", slug: "m" }
    ],
    images: ["https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=800&auto=format&fit=crop"],
    stock: 7
  }
];
