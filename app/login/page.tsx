"use client"

import type React from "react"
import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {useAuth} from "@/app/auth-context"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {AlertCircle, Eye, EyeOff, ArrowLeft} from "lucide-react"
import {validateEmail, validatePassword} from "@/lib/validation"
import {ThemeToggle} from "@/components/theme-toggle"
import Link from "next/link"
import Image from "next/image"
import {GoogleReCaptchaProvider, useGoogleReCaptcha} from "react-google-recaptcha-v3"
import {DotLottieReact} from "@lottiefiles/dotlottie-react"

function LoginLayout() {
    const router = useRouter()
    const {login, isAuthenticated} = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {executeRecaptcha} = useGoogleReCaptcha()

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "/"
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
            setError("reCAPTCHA belum siap. Silakan coba lagi sebentar lagi.")
            return
        }

        setLoading(true)

        try {
            const recaptchaToken = await executeRecaptcha("login")
            await login(email, password, recaptchaToken)
            router.push("/dashboard")
        } catch (err) {
            setError("Email atau password salah")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="relative min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-20 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl animate-blob"></div>
                <div
                    className="absolute top-40 -right-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div
                    className="absolute -bottom-20 left-1/2 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle/>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <div
                    className="flex flex-col lg:flex-row w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-fadeIn overflow-hidden">

                    <div
                        className="hidden lg:flex flex-1 items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-full max-w-sm relative">
                            <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full"></div>
                            <div className="relative z-10">
                                <DotLottieReact
                                    src="/lottie/robot.json"
                                    loop
                                    autoplay
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <div className="w-full max-w-sm mx-auto">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <Image src="/sdhd_banjar_tangerang.svg" alt="Logo Pura Admin" width={56} height={56}
                                           className="drop-shadow-sm"/>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pura
                                        Admin</h1>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Selamat datang kembali. Silakan login untuk mengelola konten website.
                                </p>
                            </div>

                            {error && (
                                <div
                                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex gap-3 animate-slideIn">
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5"/>
                                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        className="h-11 w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label
                                            className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            className="h-11 w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-orange-500 pr-10 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={loading}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 transform hover:-translate-y-0.5 mt-2"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                              Memproses...
                                        </span>
                                    ) : "Masuk Dashboard"}
                                </Button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
                                <Link
                                    href={frontendUrl}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1"/>
                                    Kembali ke Website Utama
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
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

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                .grecaptcha-badge {
                    z-index: 2147483647 !important;
                    pointer-events: auto !important;
                }
            `}</style>
        </div>
    )
}

export default function LoginPage() {
    const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Lf1O-wrAAAAANJxorfgqMudqvup81R40XKqIH-G"

    return (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
            <LoginLayout/>
        </GoogleReCaptchaProvider>
    )
}