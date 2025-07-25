import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { checkRole } from "@/utils/roles";
import MobileMenu from "../MobileMenu/index";
import ThemeToggle from "../ThemeToggle";
import { Settings } from "lucide-react";
export const Header: React.FC = async () => {
  return (
    <header className="bg-background shadow-sm sticky z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">
          <div className="flex items-center  ">
            <Link href={"/"} className="text-lg md:text-2xl text-text-primary font-semibold">
              Clinica Esteban Porras
            </Link>
          </div>

          <div className="hidden md:flex md:justify-center space-x-4 md:space-x-8">
            <ul className="flex justify-between items-center space-x-4 md:space-x-8 text-text-primary">
              

              <SignedOut>
                <li >
                  <SignInButton>Iniciar Sesión</SignInButton>
                </li>

                <li >
                  <SignUpButton>Registrarse</SignUpButton>
                </li>
              </SignedOut>

              <SignedIn>
                {(await checkRole("admin")) ? (
                <li>
                  <Link
                  href="/admin"
                  className="text-text-primary font-medium"
                >
                  Admin Panel
                </Link>
                </li>
                
              ): (
                  <li>
                    <Link
                    href="/dashboard"
                    className="text-text-primary font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                )}
                <li>
                <UserButton
                userProfileUrl="/user"
                />
                </li>
              </SignedIn>
              <li>
              <ThemeToggle/>
              </li>
            </ul>
          </div>
          <div className="md:hidden">
            <MobileMenu>
              
              <SignedOut>
                <li className="cursor-pointer">
                  <SignInButton >Iniciar Sesión</SignInButton>
                </li>

                <li className="cursor-pointer">
                  <SignUpButton>Registrarse</SignUpButton>
                </li>
              </SignedOut>

              <SignedIn>
                {(await checkRole("admin")) ? (
                <li>
                  <Link
                  href="/admin"
                  className="text-text-primary font-medium"
                >
                  Admin Panel
                </Link>
                </li>
                
              ): (
                  <li>
                    <Link
                    href="/dashboard"
                    className="text-text-primary font-medium"
                  >
                    Dashboard
                  </Link>
                </li>
                )}
                <li>
                
              <Link href={'/user'}>
              Cuenta
              </Link>
                </li>
              </SignedIn>
              <li>
              <ThemeToggle/>
              </li>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
