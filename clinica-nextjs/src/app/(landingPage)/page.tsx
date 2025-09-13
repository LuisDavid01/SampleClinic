
import { ArrowRight, Award, Calendar, Heart } from "lucide-react";

import { TeamSection } from "@/components/TeamSection";
import { ReviewsSection } from "@/components/ReviewSection";
import { AcercaDeSection } from "@/components/AcercaDeSection";
import { HomeHero } from "@/components/HomeHero";

import { CitasForm } from "@/components/CitasForm";

import { NewTestimonio } from "@/components/NewTestimonio";


export default function Home() {
	return (
		<div className="">
			{/* Hero Section */}
			<section id="inicio">
				<HomeHero />
			</section>

			{/* Services Section */}
			<section id="servicios" className="py-24 bg-background relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-2 bg-primary/10  rounded-full text-sm font-medium mb-4">
							Nuestros Servicios
						</span>
						<h2 className="text-4xl lg:text-5xl font-bold  mb-6">
							Tratamientos
							<span className="text-transparent bg-accent bg-clip-text">
								{" "}
								Especializados
							</span>
						</h2>
						<p className="text-lg  max-w-3xl mx-auto leading-relaxed">
							Ofrecemos una amplia gama de tratamientos especializados diseñados
							para ayudarte a recuperar tu movilidad y mejorar tu calidad de
							vida.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Servicio 1 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg
									className="w-8 h-8 text-white"
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
							<h3 className="text-2xl font-bold  mb-3  transition-colors">
								Terapia Manual
							</h3>
							<p className=" leading-relaxed mb-4">
								Técnicas especializadas de manipulación y movilización para el
								tratamiento efectivo de lesiones musculoesqueléticas y mejora de
								la función corporal.
							</p>
							<a href="#citas" className=" font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<svg
									className="w-4 h-4"
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

						{/* Servicio 2 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg
									className="w-8 h-8 text-white"
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
							<h3 className="text-2xl font-bold  mb-3  transition-colors">
								Rehabilitación
							</h3>
							<p className=" leading-relaxed mb-4">
								Programas personalizados de rehabilitación post-quirúrgica,
								deportiva y funcional para recuperar tu máximo potencial físico.
							</p>
							<a href="#citas" className=" font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<svg
									className="w-4 h-4"
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

						{/* Servicio 3 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<Calendar className="text-white" />
							</div>
							<h3 className="text-2xl font-bold  mb-3  transition-colors">
								Prevención
							</h3>
							<p className=" leading-relaxed mb-4">
								Evaluaciones biomecánicas y programas preventivos especializados
								para mantener tu salud óptima y prevenir lesiones futuras.
							</p>
							<a href="#citas" className=" font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<ArrowRight />
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="acerca-de">
				<AcercaDeSection />
			</section>

			{/* Testimonials Section*/}
			<section id="testimonios" className="bg-background py-24 relative overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-2 bg-primary/10  rounded-full text-sm font-medium mb-4">
							Testimonios
						</span>
						<h2 className="text-4xl lg:text-5xl font-bold  mb-6">
							Lo que dicen nuestros
							<span className="text-transparent bg-accent bg-clip-text">
								{" "}
								pacientes
							</span>
						</h2>
						<p className="text-lg  max-w-2xl mx-auto">
							Historias reales de recuperación y transformación que nos motivan
							cada día
						</p>
					</div>
					{/*Contenido de los testimonios */}
					<ReviewsSection />
					<div className="text-center mt-12">
						<NewTestimonio />
					</div>



				</div>

			</section>
			<section id="equipo" className="relative bg-gradient-to-br from-card/50 to-background py-24 overflow-hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
					{/* Header */}
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold  mb-6 leading-tight">
							Nuestro
							<span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
								{" "}
								Equipo{" "}
							</span>
							Profesional
						</h2>

						<div className="max-w-3xl mx-auto">
							<p className="text-xl /80 leading-relaxed mb-4">
								Profesionales altamente capacitados comprometidos con tu{" "}
								<span className="text-text-accent font-semibold relative">
									bienestar
								</span>{" "}
								y recuperación
							</p>

							{/* Stats rápidas */}
							<div className="flex flex-wrap justify-center gap-8 mt-8">
								<div className="flex items-center gap-2 /70">
									<Award className="w-5 h-5 text-primary" />
									<span className="text-sm font-medium">
										30+ Años Experiencia Combinada
									</span>
								</div>
								<div className="flex items-center gap-2 /70">
									<Heart className="w-5 h-5 text-accent" />
									<span className="text-sm font-medium">
										500+ Pacientes Satisfechos
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* contendio del equipo */}
					<TeamSection />

					{/* CTA mejorado */}
					<div className="relative">
						<div className="bg-card rounded-3xl p-12 shadow-2xl border border-card-foreground/10 overflow-hidden">
							<div className="relative text-center max-w-4xl mx-auto">
								<h3 className="text-2xl md:text-4xl font-bold  mb-6">
									Comprometidos con
									<span className="block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
										tu Recuperación
									</span>
								</h3>

								<p className="text-lg /80 leading-relaxed mb-8">
									Nuestro equipo multidisciplinario trabaja en conjunto para
									brindarte la mejor atención posible. Cada profesional aporta
									su experiencia y conocimiento especializado para garantizar{" "}
									<span className="text-accent font-semibold relative">
										resultados efectivos{" "}
									</span>
									en tu proceso de rehabilitación.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Formulario de Citas */}
			<CitasForm />
		</div>
	);
}
