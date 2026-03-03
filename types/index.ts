import { Role, BadgeType, SubscriptionPlan, ProductStatus } from "@prisma/client";

export type { Role, BadgeType, SubscriptionPlan, ProductStatus };

export interface UserWithRelations {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  bio: string | null;
  ecoPoints: number;
  createdAt: Date;
  subscription: SubscriptionSummary | null;
  badges: BadgeSummary[];
  _count?: { products: number; orders: number; reviews: number };
}

export interface SubscriptionSummary {
  plan: SubscriptionPlan;
  currentPeriodEnd: Date | null;
}

export interface BadgeSummary {
  badge: BadgeType;
  awardedAt: Date;
}

export interface ProductWithSeller {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  materials: string[];
  origin: string;
  ecoScore: number;
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: Date;
  sellerId: string;
  seller: {
    id: string;
    name: string | null;
    image: string | null;
    subscription: SubscriptionSummary | null;
  };
  reviews: ReviewSummary[];
  _count?: { reviews: number };
}

export interface ReviewSummary {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
}

export interface ChatRoomWithDetails {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string | null;
  updatedAt: Date;
  buyer: { id: string; name: string | null; image: string | null };
  seller: { id: string; name: string | null; image: string | null };
  messages: MessageSummary[];
}

export interface MessageSummary {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  read: boolean;
}

export interface ProductFilters {
  category?: string;
  materials?: string[];
  minEcoScore?: number;
  maxPrice?: number;
  minPrice?: number;
  origin?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "eco_score";
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  totalRevenue: number;
  premiumSubscriptions: number;
}

// Next-auth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
