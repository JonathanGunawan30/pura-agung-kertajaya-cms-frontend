"use client"

export default function AppLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="flex gap-2">
        <div className="dot dot-bounce dot1"></div>
        <div className="dot dot-bounce dot2"></div>
        <div className="dot dot-bounce dot3"></div>
      </div>
      <p className="absolute bottom-16 text-sm text-orange-400/80 tracking-wide animate-breathing">
        Loading dashboard…
      </p>
      
      <style jsx global>{`
        .dot {
          width: 12px;
          height: 12px;
          background-color: #ff7a00; /* Warna orange Anda */
          border-radius: 50%;
        }

        .dot-bounce {
          animation: bounce 1.4s ease-in-out infinite both;
        }

        /* Delay untuk setiap titik */
        .dot1 {
          animation-delay: -0.32s;
        }
        .dot2 {
          animation-delay: -0.16s;
        }
        .dot3 {
          animation-delay: 0s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-12px); /* Seberapa tinggi lompatannya */
          }
        }

        @keyframes breathing {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
