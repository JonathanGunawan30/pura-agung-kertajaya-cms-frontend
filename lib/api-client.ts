// API client for communicating with the backend
// All authentication is handled via HttpOnly cookies

import type {
    User,
    Testimonial,
    HeroSlide,
    Gallery,
    ContactInfo,
    Activity,
    SiteIdentity,
    AboutSection,
    OrganizationMember,
    Facility,
    Remark,
    OrganizationDetail, EntityType, Category, Article
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface ApiResponse<T> {
    data?: T
    errors?: string
}

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
        ...options,
        credentials: "include", // Include cookies in request
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.errors || `API Error: ${response.status}`)
    }

    const responseData: ApiResponse<T> = await response.json()
    return responseData.data as T
}

// Auth endpoints
export const authApi = {
    login: (email: string, password: string, recaptcha_token: string) =>
        apiCall<User>("/api/users/_login", {
            method: "POST",
            body: JSON.stringify({email, password, recaptcha_token}),
        }),
    logout: () => apiCall<unknown>("/api/users/_logout", {method: "POST"}),
    getCurrentUser: () => apiCall<User>("/api/users/_current"),
    updateProfile: (name?: string, password?: string) =>
        apiCall<User>("/api/users/_current", {
            method: "PATCH",
            body: JSON.stringify({name, password}),
        }),
}

// Testimonials endpoints
export const testimonialsApi = {
    getAll: () => apiCall<Testimonial[]>("/api/testimonials"),
    getById: (id: string) => apiCall<Testimonial>(`/api/testimonials/${id}`),
    create: (data: any) =>
        apiCall<Testimonial>("/api/testimonials", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<Testimonial>(`/api/testimonials/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/testimonials/${id}`, {method: "DELETE"}),
}

// Site Identity endpoints
export const siteIdentityApi = {
    get: async (entityType: EntityType) => {
        const result = await apiCall<SiteIdentity[]>(`/api/site-identity?entity_type=${entityType}`)
        if (Array.isArray(result) && result.length > 0) {
            return result[0]
        }
        return null
    },

    create: (data: any) =>
        apiCall<SiteIdentity>("/api/site-identity", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        apiCall<SiteIdentity>(`/api/site-identity/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiCall<unknown>(`/api/site-identity/${id}`, {method: "DELETE"}),
}

// Hero Slides endpoints
export const heroSlidesApi = {
    getAll: (entityType: string) =>
        apiCall<HeroSlide[]>(`/api/hero-slides?entity_type=${entityType}`),

    getById: (id: string) => apiCall<HeroSlide>(`/api/hero-slides/${id}`),
    create: (data: any) =>
        apiCall<HeroSlide>("/api/hero-slides", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<HeroSlide>(`/api/hero-slides/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/hero-slides/${id}`, {method: "DELETE"}),
}

// Gallery endpoints
export const galleryApi = {
    getAll: (entityType: string) =>
        apiCall<Gallery[]>(`/api/galleries?entity_type=${entityType}`),

    getById: (id: string) => apiCall<Gallery>(`/api/galleries/${id}`),
    create: (data: any) =>
        apiCall<Gallery>("/api/galleries", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<Gallery>(`/api/galleries/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/galleries/${id}`, {method: "DELETE"}),
}

// Contact Info endpoints
export const contactInfoApi = {
    getAll: (entityType: string) =>
        apiCall<ContactInfo[]>(`/api/contact-info?entity_type=${entityType}`),

    getById: (id: string) => apiCall<ContactInfo>(`/api/contact-info/${id}`),
    create: (data: any) =>
        apiCall<ContactInfo>("/api/contact-info", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<ContactInfo>(`/api/contact-info/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/contact-info/${id}`, {method: "DELETE"}),
}

// Activities endpoints
export const activitiesApi = {
    getAll: (entityType: string) =>
        apiCall<Activity[]>(`/api/activities?entity_type=${entityType}`),

    getById: (id: string) => apiCall<Activity>(`/api/activities/${id}`),
    create: (data: any) =>
        apiCall<Activity>("/api/activities", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<Activity>(`/api/activities/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/activities/${id}`, {method: "DELETE"}),
}

// Facilities endpoints
export const facilitiesApi = {
    getAll: (entityType: string) =>
        apiCall<Facility[]>(`/api/facilities?entity_type=${entityType}`),

    getById: (id: string) => apiCall<Facility>(`/api/facilities/${id}`),
    create: (data: any) =>
        apiCall<Facility>("/api/facilities", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<Facility>(`/api/facilities/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/facilities/${id}`, {method: "DELETE"}),
}

// About endpoints
export const aboutApi = {
    getAll: (entityType: string) =>
        apiCall<AboutSection[]>(`/api/about?entity_type=${entityType}`),

    getById: (id: string) => apiCall<AboutSection>(`/api/about/${id}`),
    create: (data: any) =>
        apiCall<AboutSection>("/api/about", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<AboutSection>(`/api/about/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/about/${id}`, {method: "DELETE"}),
}

// Program endpoints
export const programsApi = {
    get: (entityType: string) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`),

    update: (entityType: string, data: any) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
}

// Vision & Mission endpoints
export const visionMissionApi = {
    get: (entityType: string) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`),

    update: (entityType: string, data: any) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
}

// Rules endpoints
export const rulesApi = {
    get: (entityType: string) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`),

    update: (entityType: string, data: any) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
}

// Organizaton image
export const organizationImageApi = {
    get: (entityType: string) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`),

    update: (entityType: string, data: any) =>
        apiCall<OrganizationDetail>(`/api/organization-details?entity_type=${entityType}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
}

// Organization Members endpoints
export const organizationMembersApi = {
    getAll: (entityType: string) =>
        apiCall<OrganizationMember[]>(`/api/organization-members?entity_type=${entityType}`),

    getById: (id: string) => apiCall<OrganizationMember>(`/api/organization-members/${id}`),
    create: (data: any) =>
        apiCall<OrganizationMember>("/api/organization-members", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<OrganizationMember>(`/api/organization-members/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/organization-members/${id}`, {method: "DELETE"}),
}

// Remarks endpoints
export const remarksApi = {
    getAll: (entityType: string) =>
        apiCall<Remark[]>(`/api/remarks?entity_type=${entityType}`),

    getById: (id: string) => apiCall<Remark>(`/api/remarks/${id}`),
    create: (data: any) =>
        apiCall<Remark>("/api/remarks", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: any) =>
        apiCall<Remark>(`/api/remarks/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    delete: (id: string) => apiCall<unknown>(`/api/remarks/${id}`, {method: "DELETE"}),
}

// Storage endpoints
export const storageApi = {
    upload: async (file: File): Promise<{ variants: Record<string, string>; filename: string }> => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${API_BASE_URL}/api/storage/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.errors || `Upload failed: ${response.status}`)
        }

        const data = await response.json()
        return data.data
    },

    delete: (key: string) =>
        apiCall<unknown>(`/api/storage/delete?key=${encodeURIComponent(key)}`, {
            method: "DELETE",
        }),

    getPresignedUrl: (key: string, expiration?: number) =>
        apiCall<{ url: string }>(
            `/api/storage/presigned-url?key=${encodeURIComponent(key)}${
                expiration ? `&expiration=${expiration}` : ""
            }`
        ),
}

// category endpoint

export const categoriesApi = {
    getAll: () => apiCall<Category[]>("/api/categories"),
    getById: (id: string) => apiCall<Category>(`/api/categories/${id}`),
    create: (data: any) => apiCall<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => apiCall<Category>(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    delete: (id: string) => apiCall<void>(`/api/categories/${id}`, {
        method: "DELETE"
    }),
}

// article endpoint
export const articlesApi = {
    getAll: () => apiCall<Article[]>("/api/articles"),
    getById: (id: string) => apiCall<Article>(`/api/articles/${id}`),
    create: (data: any) => apiCall<Article>("/api/articles", {
        method: "POST",
        body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => apiCall<Article>(`/api/articles/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
    }),
    delete: (id: string) => apiCall<void>(`/api/articles/${id}`, {
        method: "DELETE"
    }),
}