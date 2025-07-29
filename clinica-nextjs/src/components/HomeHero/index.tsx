import { Suspense } from "react"
import Link from "next/link";
export const HomeHero = () => {
    return (
        <Suspense>
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover object-[35%_75%]  md:object-cover  z-0"
        >
          <source
            src="https://pub-ea02a55403d04609aeb9b3b618e1c834.r2.dev/massage.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/40 via-black/20 to-black/40 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Recupera tu
                <span className="block text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                  bienestar
                </span>
                con nosotros
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                Ofrecemos tratamientos personalizados de fisioterapia con un
                enfoque integral para tu salud y recuperación completa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="group bg-secondary-button text-text-primary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Agendar Cita
                </button>
                <Link
                  href={"#about"}
                  className="group bg-primary/10 backdrop-blur-sm text-white border-2 border-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-black hover:-translate-y-1 shadow-xl hover:shadow-cyan-500  transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Conocer Más
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
        </Suspense>
    )
}