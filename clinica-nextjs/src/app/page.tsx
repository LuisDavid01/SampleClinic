
import { metadata } from "./layout";
import Image from 'next/image'
import { Users, Award, Heart, Star } from 'lucide-react';

metadata.title = "Clínica Esteban Porras - Fisioterapia y Rehabilitación";
metadata.description = "Centro especializado en fisioterapia, rehabilitación y terapia manual en Costa Rica. Profesionales certificados para tu recuperación integral."
const teamMembers = [
    {
      id: 1,
      name: "Dr. María González",
      role: "Fisioterapeuta Principal",
      experience: "12+ años",
      description: "Especialista en terapia manual y rehabilitación deportiva con más de 12 años de experiencia",
      specialties: ["Terapia Manual", "Rehabilitación Deportiva", "Electroterapia"],
      bgGradient: "from-primary/20 via-accent/10 to-primary/5"
    },
    {
      id: 2,
      name: "Lic. Carlos Mendez",
      role: "Especialista en Rehabilitación",
      experience: "8+ años",
      description: "Experto en recuperación post-quirúrgica y tratamiento de lesiones musculoesqueléticas",
      specialties: ["Post-Quirúrgica", "Lesiones Musculares", "Kinesiología"],
      bgGradient: "from-accent/20 via-primary/10 to-accent/5"
    },
    {
      id: 3,
      name: "Dra. Ana Rodríguez",
      role: "Terapeuta Especializada",
      experience: "10+ años",
      description: "Certificada en técnicas de electroterapia y ejercicios terapéuticos personalizados",
      specialties: ["Electroterapia", "Ejercicios Terapéuticos", "Masoterapia"],
      bgGradient: "from-complementario/20 via-secondary/10 to-complementario/5"
    }
  ];

export default function Home() {
	return (
		<div className="">
			{/* Hero Section - Mejorada */}
			<section className="relative h-screen flex items-center justify-center overflow-hidden">
				<video
					autoPlay
					loop
					muted
					className="absolute top-0 left-0 w-full h-full object-cover object-[35%_75%]  md:object-cover  z-0"
				>
					<source src="/massage.mp4" type="video/mp4" />
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
									<svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
									</svg>
									Agendar Cita
								</button>
								<button className="group bg-primary/10 backdrop-blur-sm text-white border-2 border-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary hover:text-black hover:-translate-y-1 shadow-xl hover:shadow-cyan-500  transition-all duration-300 flex items-center justify-center gap-2">
									Conocer Más
									<svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
									</svg>
								</button>
							</div>
						</div>
						
						
					</div>
				</div>

				
			</section>

			{/* Services Section */}
			<section className="py-24 bg-background relative overflow-hidden">

				
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-2 bg-primary/10 text-text-primary rounded-full text-sm font-medium mb-4">
							Nuestros Servicios
						</span>
						<h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
							Tratamientos 
							<span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text"> Especializados</span>
						</h2>
						<p className="text-lg text-text-primary max-w-3xl mx-auto leading-relaxed">
							Ofrecemos una amplia gama de tratamientos especializados diseñados
							para ayudarte a recuperar tu movilidad y mejorar tu calidad de vida.
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Servicio 1 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-text-primary mb-3  transition-colors">
								Terapia Manual
							</h3>
							<p className="text-text-primary leading-relaxed mb-4">
								Técnicas especializadas de manipulación y movilización para el tratamiento
								efectivo de lesiones musculoesqueléticas y mejora de la función corporal.
							</p>
							<button className="text-text-accent font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
								</svg>
							</button>
						</div>

						{/* Servicio 2 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-text-primary mb-3  transition-colors">
								Rehabilitación
							</h3>
							<p className="text-text-primary leading-relaxed mb-4">
								Programas personalizados de rehabilitación post-quirúrgica, deportiva
								y funcional para recuperar tu máximo potencial físico.
							</p>
							<button className="text-text-accent font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
								</svg>
							</button>
						</div>

						{/* Servicio 3 */}
						<div className="group bg-card rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/30">
							<div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-text-primary mb-3  transition-colors">
								Prevención
							</h3>
							<p className="text-text-primary leading-relaxed mb-4">
								Evaluaciones biomecánicas y programas preventivos especializados
								para mantener tu salud óptima y prevenir lesiones futuras.
							</p>
							<button className="text-text-accent font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
								Saber más
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section className="bg-gradient-to-br from-background to-card py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						<div className="order-2 lg:order-1">
							<span className="inline-block px-4 py-2 bg-primary/10 text-text-primary rounded-full text-sm font-medium mb-6">
								¿Por qué elegirnos?
							</span>
							<h3 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
								Cuidado 
								<span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
									Integral
								</span> 
								<br />para tu Salud
							</h3>
							<p className="text-lg text-text-primary mb-8 leading-relaxed">
								Nuestro enfoque holístico combina técnicas avanzadas con atención 
								personalizada para garantizar tu recuperación completa y bienestar a largo plazo.
							</p>

							<div className="space-y-6 mb-8">
								{[
									{
										icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
										title: "Evaluación Personalizada",
										description: "Análisis biomecánico completo para desarrollar un plan de tratamiento específico y efectivo."
									},
									{
										icon: "M13 10V3L4 14h7v7l9-11h-7z",
										title: "Técnicas Avanzadas",
										description: "Terapia manual, electroterapia y ejercicios terapéuticos basados en evidencia científica actual."
									},
									{
										icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
										title: "Seguimiento Continuo",
										description: "Monitoreo constante del progreso con ajustes personalizados en tiempo real."
									}
								].map((item, index) => (
									<div key={index} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-card-secondary/50 transition-all duration-300">
										<div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
											</svg>
										</div>
										<div>
											<h4 className="font-bold text-text-primary mb-2 text-lg">{item.title}</h4>
											<p className="text-text-primary leading-relaxed">{item.description}</p>
										</div>
									</div>
								))}
							</div>

							<button className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold  hover:shadow-xl hover:-translate-y-1  hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2">
								Comenzar Evaluación
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
								</svg>
							</button>
						</div>

						<div className="order-1 lg:order-2">
							<div className="relative">
								<div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl"></div>
								<div className="relative overflow-hidden rounded-3xl shadow-2xl h-[480px] md:h-[600px]">
									<Image 
										src="/section.webp" 
										priority={true} 
										fill
										alt="Fisioterapeuta profesional trabajando con paciente en tratamiento especializado" 
										className="object-cover object-center hover:scale-105 transition-transform duration-700" 
									/>
									
									
								</div>
								
								
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials Section*/}
			<section className="bg-background py-24 relative overflow-hidden">
				
				
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
					<div className="text-center mb-16">
						<span className="inline-block px-4 py-2 bg-primary/10 text-text-primary rounded-full text-sm font-medium mb-4">
							Testimonios
						</span>
						<h2 className="text-4xl lg:text-5xl font-bold text-text-primary mb-6">
							Lo que dicen nuestros
							<span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text"> pacientes</span>
						</h2>
						<p className="text-lg text-text-primary max-w-2xl mx-auto">
							Historias reales de recuperación y transformación que nos motivan cada día
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								name: "María González",
								role: "Paciente desde 2023",
								text: "Después de mi lesión de rodilla, pensé que no volvería a caminar normalmente. El tratamiento personalizado y la dedicación del equipo me ayudaron a recuperar completamente mi movilidad. ¡Incluso puedo correr otra vez!",
								rating: 5,
								avatar: "M"
							},
							{
								name: "Carlos Ruiz",
								role: "Atleta profesional",
								text: "Como deportista de alto rendimiento, necesito un cuidado especializado y preciso. Aquí encontré profesionales que realmente entienden las demandas del deporte y me ayudaron a volver más fuerte que antes.",
								rating: 5,
								avatar: "C"
							},
							{
								name: "Ana López",
								role: "Recuperación post-cirugía",
								text: "El seguimiento continuo y la dedicación personalizada del equipo fueron fundamentales en mi proceso de rehabilitación. Su apoyo emocional fue tan importante como el tratamiento físico.",
								rating: 5,
								avatar: "A"
							}
						].map((testimonial, index) => (
							<div key={index} className="group bg-card rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-primary/10">
								{/* Rating stars */}
								<div className="flex mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
										</svg>
									))}
								</div>
								
								<p className="text-text-primary leading-relaxed mb-6 italic">
									"{testimonial.text}"
								</p>
								
								<div className="flex items-center">
									<div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
										{testimonial.avatar}
									</div>
									<div>
										<h4 className="font-bold text-text-primary text-lg">{testimonial.name}</h4>
										<p className="text-text-primary text-sm opacity-75">{testimonial.role}</p>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="text-center mt-12">
						<button className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:-translate-y-1  hover:shadow-cyan-500/50 transition-all flex items-center gap-2 mx-auto">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
							</svg>
							Comparte tu Experiencia
						</button>
					</div>
				</div>
			</section>
	<section className="relative bg-gradient-to-br from-card/50 to-background py-24 overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20">
          
          
          <h2 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Nuestro 
            <span className="bg-gradient-to-r from-text-accent to-primary bg-clip-text text-transparent"> Equipo </span>
            Profesional
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-text-primary/80 leading-relaxed mb-4">
              Profesionales altamente capacitados comprometidos con tu{" "}
              <span className="text-text-accent font-semibold relative">
                bienestar
                
              </span>{" "}
              y recuperación
            </p>
            
            {/* Stats rápidas */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center gap-2 text-text-primary/70">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">30+ Años Experiencia Combinada</span>
              </div>
              <div className="flex items-center gap-2 text-text-primary/70">
                <Heart className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium">500+ Pacientes Satisfechos</span>
              </div>
            </div>
          </div>
        </div>

        {/* contendio del equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className={`group relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border 
				border-card-foreground/10 transition-all 
				duration-500 hover:shadow-2xl hover:shadow-primary/10 
				hover:-translate-y-2 }`}
              style={{
                animationDelay: `${index * 0.2}s`
              }}
            >
              {/* Fondo gradiente  */}
              <div className={`absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10">
                {/* Avatar mejorado */}
                <div className="relative mb-6">
                  <div className="w-36 h-36 mx-auto  rounded-2xl flex items-center justify-center overflow-hidden shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                    <div className="w-32 h-32  flex items-center justify-center">
                      <Users className="w-12 h-12 text-text-primary" />
                    </div>
                  </div>
                  
                  {/* Badge de experiencia */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {member.experience}
                  </div>
                </div>

                {/* Contenido */}
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-text-primary  transition-colors duration-300">
                    {member.name}
                  </h3>
                  
                  <p className="text-text-accent font-semibold text-lg">
                    {member.role}
                  </p>
                  
                  <p className="text-text-primary/70 leading-relaxed text-sm">
                    {member.description}
                  </p>
                  
                  {/* Especialidades */}
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {member.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-text-primary text-xs font-medium rounded-full border border-primary/20"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA mejorado */}
        <div className="relative">
          <div className="bg-card rounded-3xl p-12 shadow-2xl border border-card-foreground/10 overflow-hidden">
            
            
            <div className="relative text-center max-w-4xl mx-auto">
             
              
              <h3 className="text-4xl font-bold text-text-primary mb-6 leading-tight">
                Comprometidos con tu{" "}
                <span className="bg-gradient-to-r from-text-accent to-primary bg-clip-text text-transparent">
                  Recuperación
                </span>
              </h3>
              
              <p className="text-lg text-text-primary/80 leading-relaxed mb-8">
                Nuestro equipo multidisciplinario trabaja en conjunto para brindarte la mejor atención posible. 
                Cada profesional aporta su experiencia y conocimiento especializado para garantizar{" "}
                <span className="text-text-accent font-semibold relative">
                  resultados efectivos </span>
                en tu proceso de rehabilitación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
		</div>
	);
}
