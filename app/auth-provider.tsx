"use client"

import type React from "react"
import { AuthProvider } from "./auth-context"

export function RootAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
