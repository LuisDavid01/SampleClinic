import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ClerkProvider } from '@clerk/clerk-react'
import { esES } from '@clerk/localizations'
//const clerkKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY
export const Route = createRootRoute({
  component: () => {
    return (
      <>
      <ClerkProvider 
      publishableKey="pk_test_dG91Y2hpbmctbWFsbGFyZC04NC5jbGVyay5hY2NvdW50cy5kZXYk"
      localization={esES}
      
      >
        <Header/>
            <Outlet />
            <Footer/>

        <TanStackRouterDevtools />
        <ReactQueryDevtools />

      </ClerkProvider>
            
      </>
    );
  },
});
