
import { metadata } from "./layout";
import Image from 'next/image'
metadata.title = "Clinica Esteban Porras - Inicio";
metadata.description = "Inicio de la pagina"
export default function Home() {
	return (
		<div className="">
			<section className="relative h-screen flex items-center justify-center overflow-hidden">
				{/* cambiar a futuro por url de nuestro servidor s3*/}
				<video
					autoPlay
					loop
					muted
					className="absolute top-0 left-0 w-full h-full object-cover object-[35%_75%]  md:object-cover  z-0"
				>
					<source src="/massage.mp4" type="video/mp4" />
				</video>

				<div className="absolute top-0 left-0 w-full h-full  bg-opacity-30 z-10"></div>

				<div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
								Recupera tu
								<span className="block text-white">bienestar</span>
								con nosotros
							</h2>
							<p className="text-xl text-white mb-8">
								Ofrecemos tratamientos personalizados de fisioterapia con un
								enfoque integral para tu salud y recuperación.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<button className="bg-secondary-button text-text-primary px-8 py-3 rounded-lg font-semibold delay-150  ease-in-out hover:-translate-y-1  transition-transform duration-200">
									Agendar Cita
								</button>
								<button className="bg-primary text-primary-foreground shadow-2xl px-8 py-3 rounded-lg font-semibold delay-150  ease-in-out hover:-translate-y-1 hover:shadow-cyan-500 transition-all duration-100">
									Conocer Más
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-16 bg-background">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-text-primary mb-4">
							Nuestros Servicios
						</h2>
						<p className="text-text-primary max-w-2xl mx-auto">
							Ofrecemos una amplia gama de tratamientos especializados para
							ayudarte a recuperar tu movilidad y calidad de vida.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-center">
							<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
								<svg
									className="w-6 h-6 text-accent "
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 10V3L4 14h7v7l9-11h-7z"
									></path>
								</svg>
							</div>
							<h3 className="text-xl font-semibold  text-text-primary mb-2">
								Terapia Manual
							</h3>
							<p className="text-text-primary">
								Técnicas especializadas para el tratamiento de lesiones
								musculoesqueléticas.
							</p>
						</div>

						<div className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-center">
							<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
								<svg
									className="w-6 h-6 text-accent"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									></path>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-text-primary mb-2">
								Rehabilitación
							</h3>
							<p className="text-text-primary">
								Programas personalizados para la recuperación post-quirúrgica y
								lesiones.
							</p>
						</div>

						<div className="bg-card rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 text-center">
							<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
								<svg
									className="w-6 h-6 text-accent"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
									></path>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-text-primary mb-2">
								Prevención
							</h3>
							<p className="text-text-primary">
								Evaluaciones y programas preventivos para mantener tu salud
								óptima.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-background py-20 lg:py-28">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-start">
						<div className="relative">
							<div className="text-center lg:text-left mb-8">
								<h3 className="text-3xl font-bold text-text-primary mb-4">
									Cuidado Integral para tu Salud
								</h3>
							</div>

							<div className="space-y-6">
								<div className="bg-card-secondary p-6 rounded-xl hover:shadow-md transition-shadow duration-200 ">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-accent"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
										</div>
										<div>
											<h4 className="font-semibold text-text-primary mb-2">
												Evaluación Personalizada
											</h4>
											<p className="text-text-primary text-sm leading-relaxed">
												Análisis completo de tu condición física para
												desarrollar un plan de tratamiento específico para tus
												necesidades.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-card-secondary p-6 rounded-xl hover:shadow-md transition-shadow duration-200 ">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-accent"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M13 10V3L4 14h7v7l9-11h-7z"
												></path>
											</svg>
										</div>
										<div>
											<h4 className="font-semibold text-text-primary mb-2">
												Técnicas Avanzadas
											</h4>
											<p className="text-text-primary text-sm leading-relaxed">
												Utilizamos terapia manual, electroterapia y ejercicios
												terapéuticos basados en evidencia científica.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-card-secondary p-6 rounded-xl hover:shadow-md transition-shadow duration-200 ">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-accent"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
										</div>
										<div>
											<h4 className="font-semibold text-text-primary mb-2">
												Seguimiento Continuo
											</h4>
											<p className="text-text-primary text-sm leading-relaxed">
												Monitoreo constante de tu progreso con ajustes
												personalizados en cada sesión.
											</p>
										</div>
									</div>
								</div>

								<div className="bg-card-secondary p-6 rounded-xl hover:shadow-md transition-shadow duration-200 ">
									<div className="flex items-start space-x-4">
										<div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-accent"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												></path>
											</svg>
										</div>
										<div>
											<h4 className="font-semibold text-text-primary mb-2">
												Atención Empática
											</h4>
											<p className="text-text-primary text-sm leading-relaxed">
												Profesionales comprometidos con tu bienestar, brindando
												apoyo y motivación en cada etapa.
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-12 grid grid-cols-3 gap-4">
								<div className="text-center p-4 bg-card rounded-lg">
									<div className="text-2xl font-bold text-accent">95%</div>
									<div className="text-sm text-text-primary">Satisfacción</div>
								</div>
								<div className="text-center p-4 bg-card rounded-lg">
									<div className="text-2xl font-bold text-accent">500+</div>
									<div className="text-sm text-text-primary">Pacientes</div>
								</div>
								<div className="text-center p-4 bg-card rounded-lg">
									<div className="text-2xl font-bold text-accent">10+</div>
									<div className="text-sm text-text-primary">Años</div>
								</div>
							</div>
						</div>

						<div className="space-y-12">
							<div className="overflow-hidden rounded-2xl shadow-2xl relative h-[480px] md:h-[720px]">
								<Image 
								src="/section.webp" 
								priority={true} 
								fill
								alt="Fisioterapeuta trabajando con paciente" 
								className="object-cover object-bottom" 
								/>
							</div> 
							</div>
					</div>
				</div>
			</section>

			<section className="bg-background py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-text-primary mb-4">
							Lo que <span className="text-text-accent">nuestros</span> clientes
							tienen que decir
						</h2>
						<p className="text-lg text-text-primary">
							Testimonios
							<span className="text-text-accent font-semibold"> reales </span> de
							clientes frecuentes
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
							<div className="flex items-center mb-4">
								<div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
									M
								</div>
								<div className="ml-3">
									<h4 className="font-semibold text-text-primary">
										María González
									</h4>
									<p className="text-sm text-text-primary">Paciente desde 2023</p>
								</div>
							</div>
							<p className="text-text-primary text-sm leading-relaxed">
								"Excelente atención profesional. Después de mi lesión de
								rodilla, el tratamiento personalizado me ayudó a recuperar
								completamente mi movilidad."
							</p>
						</div>

						<div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
							<div className="flex items-center mb-4">
								<div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
									C
								</div>
								<div className="ml-3">
									<h4 className="font-semibold text-text-primary">Carlos Ruiz</h4>
									<p className="text-sm text-text-primary">Atleta profesional</p>
								</div>
							</div>
							<p className="text-text-primary text-sm leading-relaxed">
								"Como deportista, necesito un cuidado especializado. Aquí
								encontré profesionales que entienden las demandas del alto
								rendimiento."
							</p>
						</div>

						<div className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
							<div className="flex items-center mb-4">
								<div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
									A
								</div>
								<div className="ml-3">
									<h4 className="font-semibold text-text-primary">Ana López</h4>
									<p className="text-sm text-text-primary">
										Recuperación post-cirugía
									</p>
								</div>
							</div>
							<p className="text-text-primary text-sm leading-relaxed">
								"El seguimiento continuo y la dedicación del equipo fueron
								fundamentales en mi proceso de rehabilitación. Muy recomendado."
							</p>
						</div>
					</div>

					<div className="text-center mt-12">
						<button className="bg-primary text-primary-foreground shadow-2xl px-8 py-3 rounded-lg font-semibold delay-150  ease-in-out hover:-translate-y-1 hover:shadow-cyan-500 transition-all duration-100">
							Envíanos tu feedback
						</button>
					</div>
				</div>
			</section>

			<section className="bg-background py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-text-primary mb-4">
							Nuestro <span className="text-text-accent">Equipo</span> Profesional
						</h2>
						<p className="text-lg text-text-primary max-w-2xl mx-auto">
							Profesionales altamente capacitados comprometidos con tu
							<span className="text-text-accent font-semibold"> bienestar</span> y
							recuperación
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="text-center group">
							<div className="relative mb-6">
								<div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden"></div>
								<div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
							<h3 className="text-xl font-semibold text-text-primary mb-2">
								test text
							</h3>
							<p className="text-text-accent font-medium mb-2">
								Fisioterapeuta Principal
							</p>
							<p className="text-sm text-text-primary leading-relaxed">
								Especialista en terapia manual y rehabilitación deportiva con
								más de 12 años de experiencia
							</p>
						</div>

						<div className="text-center group">
							<div className="relative mb-6">
								<div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden"></div>
								<div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
							<h3 className="text-xl font-semibold text-text-primary mb-2">
								test text
							</h3>
							<p className="text-text-accent font-medium mb-2">
								Especialista en Rehabilitación
							</p>
							<p className="text-sm text-text-primary leading-relaxed">
								Experto en recuperación post-quirúrgica y tratamiento de
								lesiones musculoesqueléticas
							</p>
						</div>

						<div className="text-center group">
							<div className="relative mb-6">
								<div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center overflow-hidden"></div>
								<div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
							<h3 className="text-xl font-semibold text-text-primary mb-2">
								test text
							</h3>
							<p className="text-text-accent font-medium mb-2">
								Terapeuta Especializada
							</p>
							<p className="text-sm text-text-primary leading-relaxed">
								Certificada en técnicas de electroterapia y ejercicios
								terapéuticos personalizados
							</p>
						</div>
					</div>

					<div className="mt-16 bg-card rounded-2xl p-8">
						<div className="text-center">
							<h3 className="text-2xl font-bold text-text-primary mb-4">
								Comprometidos con tu Recuperación
							</h3>
							<p className="text-text-primary max-w-3xl mx-auto leading-relaxed">
								Nuestro equipo multidisciplinario trabaja en conjunto para
								brindarte la mejor atención posible. Cada profesional aporta su
								experiencia y conocimiento especializado para garantizar 
								<span className="text-text-accent font-semibold"> resultados efectivos </span>
								  
								
								 en tu proceso de rehabilitación.
							</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
