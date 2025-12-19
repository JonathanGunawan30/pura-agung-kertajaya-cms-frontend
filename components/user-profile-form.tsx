"use client"

import type React from "react"
import { useState } from "react"
import { authApi } from "@/lib/api-client"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"
import {
  ShieldCheck,
  Save,
  Key,
  Mail,
  Lock,
  UserCircle,
  Eye,
  EyeOff
} from "lucide-react"

export function UserProfileForm() {
  const { user } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.")
      return
    }
    if (password.length < 8) {
      setError("Password minimal harus 8 karakter.")
      return
    }

    setLoading(true)

    try {
      await authApi.updateProfile(undefined, password)
      await showSuccessAlert("Berhasil!", "Password Anda berhasil diperbarui.")
      setPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setShowConfirmPassword(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui password"
      setError(errorMsg)
      await showErrorAlert("Error", errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm w-full overflow-hidden">

          <div className="bg-muted/30 border-b p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg border shadow-sm bg-orange-50 text-orange-600 border-orange-100">
                <ShieldCheck className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground leading-tight">
                  Keamanan & Login
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Update password secara berkala untuk menjaga keamanan akun.
                </p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">

                <div className="p-6 lg:p-10 space-y-6">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Info Pengguna
                  </h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs">Email Terdaftar</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={user?.email || "Memuat..."}
                            disabled
                            className="pl-9 bg-muted/50 border-dashed text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Email ini digunakan sebagai identitas login utama akun Anda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 lg:p-10 space-y-8">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4" /> Ganti Password
                  </h4>

                  {error && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                        <ShieldCheck className="w-4 h-4" /> {error}
                      </div>
                  )}

                  <div className="grid gap-6 max-w-2xl">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="pl-9 pr-10"
                            required
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Sembunyikan" : "Tampilkan"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="pl-9 pr-10"
                            required
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm min-w-[160px] h-11"
                    >
                      {loading ? "Menyimpan..." : (
                          <><Save className="w-4 h-4 mr-2" /> Simpan Password</>
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
  )
}