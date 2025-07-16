import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { checkRole } from "@/utils/roles";
import MobileMenu from "../MobileMenu/index";
export const Header: React.FC = async () => {
  return (
    <header className="bg-white shadow-sm sticky z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">
          <div className="flex items-center  ">
            <Link href={"/"} className=" text-2xl text-black font-semibold">
              Clinica Esteban Porras
            </Link>
          </div>

          <div className="hidden md:flex md:justify-center space-x-4 md:space-x-8">
            <ul className="flex justify-between items-center space-x-4 md:space-x-8 text-black">
              <li>
                <Link href="/contacts">Contacto</Link>
              </li>
              {(await checkRole("admin")) && (
                <Link
                  href="/admin"
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Admin Panel
                </Link>
              )}

              <SignedOut>
                <li>
                  <SignInButton>Iniciar Sesión</SignInButton>
                </li>

                <li>
                  <SignUpButton>Registrarse</SignUpButton>
                </li>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </ul>
          </div>
          <div className="md:hidden">
            <MobileMenu>
              <li>
                <Link href="/contacts">Contacto</Link>
              </li>
              <li>
                <Link href="/admin/dashboard">admin</Link>
              </li>
              <SignedOut>
                <li>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-primary text-white border border-primary rounded-lg "
                  >
                    Iniciar Sesión
                  </Link>
                </li>

                <li>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-primary text-white rounded-lg "
                  >
                    Registrarse
                  </Link>
                </li>
              </SignedOut>

              <SignedIn>
                <UserButton />
              </SignedIn>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
