// Type definitions for API responses

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
  image_url: string
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface Gallery {
  id: string
  title: string
  description: string
  image_url: string
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface ContactInfo {
  id: string
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
  title: string
  description: string
  time_info: string
  location: string
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface SiteIdentity {
  id: string
  site_name: string
  logo_url: string
  tagline: string
  primary_button_text: string
  primary_button_link: string
  secondary_button_text: string
  secondary_button_link: string
  created_at: number
  updated_at: number
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
  title: string
  description: string
  image_url: string
  is_active: boolean
  created_at: number
  updated_at: number
  values: AboutValue[]
}

export interface OrganizationMember {
  id: string
  name: string
  position: string
  position_order: number
  order_index: number
  photo_url: string | null
  description: string | null
  is_active: boolean
  created_at: number
  updated_at: number
}

export interface Facility {
  id: string
  name: string
  description: string
  image_url: string
  order_index: number
  is_active: boolean
  created_at: number
  updated_at: number
}
