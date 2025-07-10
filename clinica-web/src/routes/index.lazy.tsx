import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="">


    <section className="bg-gradient-to-br from-secondary to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Recupera tu 
                        <span className="text-primary">bienestar</span> 
                        con nosotros
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
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


                <div className="relative">
                    <div className="bg-primary rounded-2xl p-8 shadow-xl">
                        <div className="bg-white rounded-lg p-6 space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Tratamiento Personalizado</h3>
                                    <p className="text-sm text-gray-600">Adaptado a tus necesidades específicas</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Horarios Flexibles</h3>
                                    <p className="text-sm text-gray-600">Disponible cuando lo necesites</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Ubicación Céntrica</h3>
                                    <p className="text-sm text-gray-600">Fácil acceso y estacionamiento</p>
                                </div>
                            </div>
                        </div>
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


    
    </div>
  );
}
