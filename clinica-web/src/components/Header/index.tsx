import { Link } from "@tanstack/react-router"
export const Header : React.FC= () => {
    return(
        <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">

                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">FisioVida</h1>
                </div>


                <div className="flex space-x-4">
                    
                    <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-secondary transition-colors duration-200">
                        Iniciar Sesión
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Registrarse
                    </button>
                </div>
            </div>
        </div>
    </header>
    )

}