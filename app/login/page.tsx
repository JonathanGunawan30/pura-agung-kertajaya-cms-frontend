"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { validateEmail, validatePassword } from "@/lib/validation"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"

function LoginLayout() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { executeRecaptcha } = useGoogleReCaptcha()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError.message)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError.message)
      return
    }

    if (!executeRecaptcha) {
      setError("reCAPTCHA is not loaded yet. Please try again in a moment.")
      return
    }

    setLoading(true)

    try {
      const recaptchaToken = await executeRecaptcha("login")
      await login(email, password, recaptchaToken)
      router.push("/dashboard")
    } catch (err) {
      setError("Email or password is wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl animate-fadeIn">
          <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/50 lg:rounded-l-2xl">
            <div className="w-full max-w-sm">
              <DotLottieReact
                src="/lottie/robot.json"
                loop
                autoplay
              />
            </div>
          </div>
          <div className="w-full lg:flex-1 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/sdhd_banjar_tangerang.svg" alt="Logo Pura Admin" width={64} height={64} className="drop-shadow-sm" />
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pura Admin</h1>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Kelola konten website pura Anda</p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Masuk ke Dashboard</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gunakan kredensial admin Anda untuk melanjutkan</p>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg flex gap-3 animate-slideIn">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 mt-6"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Website Utama
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Lf1O-wrAAAAANJxorfgqMudqvup81R40XKqIH-G"

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <LoginLayout />
    </GoogleReCaptchaProvider>
  )
}