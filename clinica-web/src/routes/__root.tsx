import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";


export const Route = createRootRoute({
  component: () => {
    return (
      <>

            <Header/>
            <Outlet />
            <Footer/>

        <TanStackRouterDevtools />
        <ReactQueryDevtools />
      </>
    );
  },
});
