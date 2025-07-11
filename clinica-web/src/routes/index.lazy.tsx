import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="">
    <section className=" relative h-screen  flex items-center justify-center bg-gradient-to-br from-secondary to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Recupera tu 
                        <span className=" block text-primary">bienestar</span> 
                        con nosotros
                    </h2>
                    <p className="text-xl text-gray-900 mb-8">
                        Ofrecemos tratamientos personalizados de fisioterapia con un enfoque integral para tu salud y recuperación.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200">
                            Agendar Cita
                        </button>
                        <button className="border border-primary text-primary px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200">
                            Conocer Más
                        </button>
                    </div>
                </div>


                
            </div>
        </div>
    </section>

    <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Ofrecemos una amplia gama de tratamientos especializados para ayudarte a recuperar tu movilidad y calidad de vida.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Terapia Manual</h3>
                    <p className="text-gray-600">Técnicas especializadas para el tratamiento de lesiones musculoesqueléticas.</p>
                </div>

     
                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Rehabilitación</h3>
                    <p className="text-gray-600">Programas personalizados para la recuperación post-quirúrgica y lesiones.</p>
                </div>


                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Prevención</h3>
                    <p className="text-gray-600">Evaluaciones y programas preventivos para mantener tu salud óptima.</p>
                </div>
            </div>
        </div>
    </section>

    <section className="bg-white py-20 lg:py-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="text-center mb-16">
        <h2 className="text-3xl font-black lg:text-4xl mb-6">
          
        </h2>
        <div className="prose max-w-3xl mx-auto">
          <p className="text-lg text-gray-600">
           
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        
        <div className="relative">
            <div className="text-center text-lg:text-left">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              
            </h3>
            
          </div>
          
          <div className="space-y-4">
            <div className="pb-4 prose">
               

            </div>

             <div className="pb-4">
              
            </div>

             <div className="pb-4">
               
            </div>

             <div className="pb-4">
              accordion
            </div>
          </div>
        </div>


        <div className="space-y-12">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="/section.webp"
              alt="team image"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  </section>


    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Lo que <span className="text-primary-500">nuestros</span> clientes tiene que decir.
          </h2>
          <p className="text-lg text-text-secondary">
            Testomonios <span className="text-primary-500 font-semibold">reales</span> de clientes frecuentes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-text-primary">Timberrr</h4>
                <p className="text-sm text-text-secondary">11/7/2025</p>
                <p className="text-sm text-text-secondary">ZACKHARDTONAME</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              demo text
            </p>
          </div>

          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">
                U
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-text-primary">Upset</h4>
                <p className="text-sm text-text-secondary">11/7/2025</p>
                <p className="text-sm text-text-secondary">SUSPENSEFULAPPLE</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              demo text
            </p>
          </div>


          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-text-primary">Anatz</h4>
                <p className="text-sm text-text-secondary">11/7/2025</p>
                <p className="text-sm text-text-secondary">LUKEWARMTEA137</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              demo text
            </p>
          </div>
          
        </div>
      </div>
       <div className="text-center my-8">
          <button className="border-2 border-dashed border-gray-300 text-text-secondary px-8 py-3 rounded-lg font-medium hover:border-gray-400 transition-colors">
            Envianos tu feedback!
          </button>
        </div>
    </section>


    
    </div>
  );
}
