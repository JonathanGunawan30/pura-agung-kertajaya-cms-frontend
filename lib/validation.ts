export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): ValidationError | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { field: "email", message: "Email is required" }
  if (!emailRegex.test(email)) return { field: "email", message: "Invalid email format" }
  return null
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) return { field: "password", message: "Password is required" }
  if (password.length < 6) return { field: "password", message: "Password must be at least 6 characters" }
  return null
}

export function validateRequired(value: string, fieldName: string): ValidationError | null {
  if (!value || value.trim() === "") return { field: fieldName, message: `${fieldName} is required` }
  return null
}

export function validateNumber(value: number, fieldName: string, min?: number, max?: number): ValidationError | null {
  if (value === null || value === undefined) return { field: fieldName, message: `${fieldName} is required` }
  if (min !== undefined && value < min) return { field: fieldName, message: `${fieldName} must be at least ${min}` }
  if (max !== undefined && value > max) return { field: fieldName, message: `${fieldName} must be at most ${max}` }
  return null
}

export function validateFile(file: File | null, fieldName: string, maxSizeMB = 2): ValidationError | null {
  if (!file) return { field: fieldName, message: `${fieldName} is required` }
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) return { field: fieldName, message: `${fieldName} must be less than ${maxSizeMB}MB` }
  const validTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!validTypes.includes(file.type))
    return { field: fieldName, message: "File must be an image (JPEG, PNG, or WebP)" }
  return null
}
