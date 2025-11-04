"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-[300px] h-[300px] md:w-[350px] md:h-[350px]">
        <DotLottieReact src="/lottie/404.json" loop autoplay/>
      </div>

      <h1 className="text-3xl font-bold mt-6 text-gray-800">
        Oops! Page Not Found
      </h1>

      <p className="mt-2 text-gray-600">
        Halaman tidak ditemukan.
      </p>

      <a href="/" className="mt-6 px-6 py-2 rounded-lg bg-gray-800 text-white font-semibold shadow-md hover:bg-gray-900 transition-colors">
        Kembali ke Home
      </a>
    </div>
  );
}
