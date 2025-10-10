
export const HomeHero = () => {
	return (

		<section className="relative h-screen flex items-center justify-center overflow-hidden">

			<video
				autoPlay
				loop
				muted
				className="absolute top-0 left-0 w-full h-full object-cover object-[35%_75%]  md:object-cover  z-0"
			>
				<source
					src="/output.webm"
					type="video/webm"
				/>
				video not supported
			</video>
			<div className="absolute inset-0 bg-black/45 z-5" aria-label="fondo-negro-frente-al-video" />
			<div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div className="text-center lg:text-left ">
						<h1 className="text-5xl lg:text-6xl  text-white mb-6  font-bold leading-tight  ">
							Recupera tu
							<span className="block text-transparent bg-accent  bg-clip-text">
								bienestar
							</span>
							con nosotros
						</h1>
						<p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
							Ofrecemos tratamientos personalizados de fisioterapia con un
							enfoque integral para tu salud y recuperación completa.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<a href={"#citas"} className="group bg-secondary px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
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
							</a>
							<a
								href={"#about"}
								className="group bg-primary/10 backdrop-blur-sm text-white border-2 border-primary px-8 py-4 rounded-xl font-semibold  hover:-translate-y-1    transition-all duration-300 flex items-center justify-center gap-2"
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
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
