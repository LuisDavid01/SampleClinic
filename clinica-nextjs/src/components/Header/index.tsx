
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MobileMenu from "../MobileMenu/index";
import ThemeToggle from "../ThemeToggle";
import { LogOut, LogIn } from "lucide-react";
import { checkRole } from "@/utils/roles";
import Image from "next/image";


export const Header = async () => {

  return (
    <header className="bg-background shadow-sm sticky z-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center sm:px-6 lg:px-8 h-20">
        <div className="flex items-center gap-3">
        <Link
              href={"/"}
              className="text-lg md:text-2xl text-text-primary font-semibold"
            >
              Clinica Esteban Porras
            </Link>
      </div>

          <div className="hidden md:flex md:justify-center space-x-2 md:space-x-4">
            <ul className="flex justify-between items-center space-x-2 md:space-x-4 text-text-primary">
              <SignedIn>
                {await checkRole("admin") ? (
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
              

              <SignedOut>
                <SignInButton>
                  <Button
                    variant="link"
                    className="w-full justify-start text-text-primary "
                  >
                    Acceder
                  </Button>
                </SignInButton>

                
              </SignedOut>

              <SignedIn>
                {await checkRole("admin") ? (
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
