import { EventType } from '../enums';

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  features: string[];
  eventType: EventType;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  eventType: EventType | null;
  eventDate: string | null;
  content: string;
  rating: number | null;
  avatarUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
