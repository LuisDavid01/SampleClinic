"use client";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MobileMenu from "../MobileMenu/index";
import ThemeToggle from "../ThemeToggle";
import { LogOut, LogIn } from "lucide-react";

const smoothScrollTo = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const headerHeight = 0; // altura del header + padding adicional
    const elementPosition = element.offsetTop - headerHeight;
    
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

export const Header: React.FC = () => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="bg-background shadow-sm sticky z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">
          <div className="flex items-center  ">
            <Link
              href={"/"}
              className="text-lg md:text-2xl text-text-primary font-semibold"
            >
              Clinica Esteban Porras
            </Link>
          </div>

          <div className="hidden md:flex md:justify-center space-x-2 md:space-x-4">
            <ul className="flex justify-between items-center space-x-2 md:space-x-4 text-text-primary">
              {/* Navegación de secciones */}
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('inicio')}
                >
                  Inicio
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('servicios')}
                >
                  Servicios
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('acerca-de')}
                >
                  Acerca de
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('testimonios')}
                >
                  Testimonios
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('equipo')}
                >
                  Equipo
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary px-2"
                  onClick={() => smoothScrollTo('citas')}
                >
                  Citas
                </Button>
              </li>

              <SignedOut>
                <li>
                  <SignInButton>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary px-2"
                    >
                      Iniciar Sesión
                    </Button>
                  </SignInButton>
                </li>

                <li>
                  <SignUpButton>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary px-2"
                    >
                      Registrarse
                    </Button>
                  </SignUpButton>
                </li>
              </SignedOut>

              <SignedIn>
                {isAdmin ? (
                  <li>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary px-2"
                      asChild
                    >
                      <Link
                        href="/admin"
                        className="text-text-primary font-medium"
                      >
                        Admin Panel
                      </Link>
                    </Button>
                  </li>
                ) : (
                  <li>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary px-2"
                      asChild
                    >
                      <Link
                        href="/dashboard"
                        className="text-text-primary font-medium"
                      >
                        Dashboard
                      </Link>
                    </Button>
                  </li>
                )}
                <li>
                  <UserButton userProfileUrl="/user" />
                </li>
              </SignedIn>

              <li>
                <ThemeToggle />
              </li>
            </ul>
          </div>
          <div className="md:hidden">
            <MobileMenu>
              {/* Navegación de secciones para móvil */}
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('inicio')}
                >
                  Inicio
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('servicios')}
                >
                  Servicios
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('acerca-de')}
                >
                  Acerca de
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('testimonios')}
                >
                  Testimonios
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('equipo')}
                >
                  Equipo
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="w-full justify-start text-text-primary"
                  onClick={() => smoothScrollTo('citas')}
                >
                  Citas
                </Button>
              </li>

              <SignedOut>
                <SignInButton>
                  <Button
                    variant="link"
                    className="w-full justify-start text-text-primary "
                  >
                    Iniciar Sesión
                  </Button>
                </SignInButton>

                <SignUpButton>
                  <Button
                    variant="link"
                    className="w-full justify-start text-text-primary "
                  >
                    Registrarse
                  </Button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                {isAdmin ? (
                  <li>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary "
                      asChild
                    >
                      <Link
                        href="/admin"
                        className="text-text-primary font-medium"
                      >
                        Admin Panel
                      </Link>
                    </Button>
                  </li>
                ) : (
                  <li>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary "
                      asChild
                    >
                      <Link
                        href="/dashboard"
                        className="text-text-primary font-medium"
                      >
                        Dashboard
                      </Link>
                    </Button>
                  </li>
                )}
                <li>
                  <Button
                    variant="link"
                    className="w-full justify-start text-text-primary "
                    asChild
                  >
                    <Link href={"/user"}>Cuenta</Link>
                  </Button>
                </li>
              </SignedIn>
              <li>
                <ThemeToggle />
              </li>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
