import { SignOutButton } from "@clerk/tanstack-react-start"
import { Link } from "@tanstack/react-router"
export const Header : React.FC= () => {
    return(
        <header className="bg-white shadow-sm sticky z-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">

                <div className="flex items-center  ">
                    <Link to={'/'} className=" text-2xl text-black font-semibold">Clinica Esteban Porras</Link>
                </div>


                <div className="hidden md:flex md:justify-center space-x-4 md:space-x-8">
                    <ul className="flex justify-between items-center space-x-4 md:space-x-8">
                        <li>
                        <Link to="/contacts" >Contacto</Link>
                        </li>
                        <li>
                        <Link to="/admin/dashboard">admin</Link>
                        </li>
                    </ul>
                    <Link to="/login" className="px-4 py-2 bg-primary text-white border border-primary rounded-lg hover:bg-secondary transition-colors duration-200">
                        Iniciar Sesión
                    </Link>
                    <Link to="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        Registrarse
                    </Link>
                    <SignOutButton></SignOutButton>
                </div>
            </div>
        </div>
    </header>
    )

}