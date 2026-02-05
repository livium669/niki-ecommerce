
export interface Product {
  id: number | string;
  name: string;
  category: string;
  price: string;
  image: string;
  stock?: number;
}

export interface SectionProps {
  id: string;
}
