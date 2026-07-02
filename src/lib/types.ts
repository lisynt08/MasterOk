// Shared types for the marketplace
export type CategoryColor = 'emerald' | 'amber' | 'rose' | 'sky' | 'orange' | 'violet' | 'cyan' | 'green';

export type ViewPage = 'home' | 'orders' | 'reviews';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  mastersCount: number;
}

export interface MasterListItemDTO {
  id: string;
  name: string;
  avatar: string;
  profession: string;
  city: string;
  area: string | null;
  priceFrom: number;
  priceTo: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  completedOrders: number;
  responseTime: string;
  verified: boolean;
  topRated: boolean;
  experienceYears: number;
  skills: string[];
  categoryId: string;
  categoryName: string;
  categoryColor: string;
}

export interface ReviewDTO {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  text: string;
  pros: string | null;
  cons: string | null;
  jobTitle: string | null;
  createdAt: string;
}

export interface ReviewWithMasterDTO extends ReviewDTO {
  masterId: string;
  master: {
    id: string;
    name: string;
    avatar: string;
    profession: string;
    category: { name: string; color: string };
  };
}

export interface ServiceReviewDTO {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  pros: string | null;
  cons: string | null;
  createdAt: string;
}

export interface MasterDetailDTO extends MasterListItemDTO {
  bio: string;
  cover: string | null;
  languages: string;
  skills: string[];
  reviews: ReviewDTO[];
}

export interface OrderDTO {
  id: string;
  masterId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  jobTitle: string;
  description: string;
  budget: number | null;
  preferredDate: string | null;
  address: string | null;
  status: string;
  createdAt: string;
}

export interface OrderListDTO extends Omit<OrderDTO, 'clientEmail'> {
  master: {
    id: string;
    name: string;
    avatar: string;
    profession: string;
    category: { name: string; color: string };
  };
}

export interface ChatMessageDTO {
  id: string;
  orderId: string;
  masterId: string;
  sender: string;
  text: string;
  createdAt: string;
}

export interface MastersQuery {
  category?: string;
  city?: string;
  search?: string;
  sort?: 'rating' | 'price-asc' | 'price-desc' | 'reviews' | 'newest';
  minRating?: string;
  maxPrice?: string;
  verifiedOnly?: string;
  topRatedOnly?: string;
  top?: string;
}