// Type definitions for API responses

export type EntityType = 'pura' | 'yayasan' | 'pasraman';

export interface User {
  id: string
  name: string
  email: string
  created_at: number
  updated_at: number
}

export interface Testimonial {
  id: string
  name: string
  avatar_url: string
  rating: number
  comment: string
  is_active: boolean
  order_index: number
  created_at: number
  updated_at: number
}

export interface HeroSlide {
  id: string
  entity_type: EntityType
  images: string[]
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface Gallery {
  id: string
  entity_type: EntityType
  title: string
  description: string
  images: string[]
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface ContactInfo {
  id: string
  entity_type: EntityType
  address: string
  phone: string
  email: string
  visiting_hours: string
  map_embed_url: string
  created_at: number
  updated_at: number
}

export interface Activity {
  id: string
  entity_type: EntityType
  title: string
  description: string
  time_info: string
  event_date: string
  location: string
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface SiteIdentity {
  id: string
  entity_type: EntityType
  site_name: string
  logo_url: string
  tagline: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  created_at: string
  updated_at: string
}

export interface AboutValue {
  id: string
  about_id: string
  title: string
  value: string
  order_index: number
  created_at: number
  updated_at: number
}

export interface AboutSection {
  id: string
  entity_type: EntityType
  title: string
  description: string
  images: string[]
  is_active: boolean
  created_at: number
  updated_at: number
  values: AboutValue[]
}

export interface OrganizationMember {
  id: string
  entity_type: EntityType
  name: string
  position: string
  position_order: number
  order_index: number
  images: string[]
  description: string | null
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface Facility {
  id: string
  entity_type: EntityType
  name: string
  description: string
  images: string[]
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface Remark {
  id: string
  entity_type: EntityType
  name: string
  position: string
  content: string
  image_url: string | null
  order_index: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface OrganizationDetail {
  id: string
  entity_type: EntityType
  vision: string | null
  mission: string | null
  rules: string | null
  work_program: string | null
  vision_mission_image_url: string | null
  work_program_image_url: string | null
  rules_image_url: string | null
  structure_image_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  category_id: string
  category?: Category
  title: string
  slug: string
  author_name: string
  author_role: string
  excerpt: string
  content: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  is_featured: boolean
  published_at: string | null
  images: any
  created_at: string
  updated_at: string
}