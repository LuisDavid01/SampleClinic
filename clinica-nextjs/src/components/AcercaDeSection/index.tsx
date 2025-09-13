import { Suspense } from "react"
import Image from "next/image";

import { CometCard } from "../ui/comet-card";

export const AcercaDeSection = () => {
	return (
		<Suspense fallback={<div>loading....</div>}>
			<section
				id="about"
				className="bg-gradient-to-br from-background to-card py-24"
			>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="order-2 lg:order-1">
							<span className="inline-block px-4 py-2 bg-primary/10 text-text-primary rounded-full text-sm font-medium mb-6">
								¿Por qué elegirnos?
							</span>
							<h3 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
								Cuidado
								<span className="text-transparent bg-accent bg-clip-text">
									Integral
								</span>
								<br />
								para tu Salud
							</h3>
							<p className="text-lg text-text-primary mb-8 leading-relaxed">
								Nuestro enfoque holístico combina técnicas avanzadas con
								atención personalizada para garantizar tu recuperación completa
								y bienestar a largo plazo.
							</p>

							<div className="space-y-6 mb-8">
								{[
									{
										icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
										title: "Evaluación Personalizada",
										description:
											"Análisis biomecánico completo para desarrollar un plan de tratamiento específico y efectivo.",
									},
									{
										icon: "M13 10V3L4 14h7v7l9-11h-7z",
										title: "Técnicas Avanzadas",
										description:
											"Terapia manual, electroterapia y ejercicios terapéuticos basados en evidencia científica actual.",
									},
									{
										icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
										title: "Seguimiento Continuo",
										description:
											"Monitoreo constante del progreso con ajustes personalizados en tiempo real.",
									},
								].map((item, index) => (
									<div
										key={index}
										className="group flex items-start space-x-4 p-4 rounded-xl  transition-all duration-300"
									>
										<div className="flex-shrink-0 w-12 h-12 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
											<svg
												className="w-6 h-6 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d={item.icon}
												></path>
											</svg>
										</div>
										<div>
											<h4 className="font-bold text-text-primary mb-2 text-lg">
												{item.title}
											</h4>
											<p className="text-text-primary leading-relaxed">
												{item.description}
											</p>
										</div>
									</div>
								))}
							</div>
							<a
								href="#citas"
								className="group px-4 py-2 rounded-md backdrop-blur-sm border-2 border-primary 
              font-semibold bg-primary  text-primary-foreground hover:-translate-y-1
               transition-all duration-300
             flex items-center justify-center gap-2 mx-auto"
							>
								<span>Comenzar Evaluación</span>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</a>

						</div>

						<div className="order-1 lg:order-2 lg:justify-end">
							<CometCard rotateDepth={10} translateDepth={5}>


								<Image
									src="https://pub-ea02a55403d04609aeb9b3b618e1c834.r2.dev/acerca-de.webp"
									priority={true}
									width={600}
									height={600}
									alt="Fisioterapeuta profesional trabajando con paciente en tratamiento especializado"
									className="object-cover object-center hover:scale-105 transition-transform duration-700"
								/>


							</CometCard>





						</div>
					</div>
				</div>
			</section>
		</Suspense>
	)
}
