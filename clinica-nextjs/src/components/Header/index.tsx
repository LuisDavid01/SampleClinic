import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { checkRole } from "@/utils/roles";
import MobileMenu from "../MobileMenu/index";
import ThemeToggle from "../ThemeToggle";
import { LogOut, LogIn } from "lucide-react";
export const Header: React.FC = async () => {
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

          <div className="hidden md:flex md:justify-center space-x-4 md:space-x-8">
            <ul className="flex justify-between items-center space-x-4 md:space-x-8 text-text-primary">
              <SignedOut>
                <li>
                  <SignInButton>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary "
                    >
                      Iniciar Sesión
                    </Button>
                  </SignInButton>
                </li>

                <li>
                  <SignUpButton>
                    <Button
                      variant="link"
                      className="w-full justify-start text-text-primary "
                    >
                      Registrarse
                    </Button>
                  </SignUpButton>
                </li>
              </SignedOut>

              <SignedIn>
                {(await checkRole("admin")) ? (
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
                {(await checkRole("admin")) ? (
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
