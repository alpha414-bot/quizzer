import ErrorPage from "@/Pages/ErrorPage";
import Home from "@/Pages/Home";
import { useLayoutEffect } from "react";
import { QueryClient } from "react-query";
import {
    Navigate,
    RouteObject,
    createBrowserRouter,
    useLocation,
} from "react-router-dom";
import { useAuthUser } from "./Module/Hook";

// Creating a higher-order component to wrap the router with scroll-to-top functionality
const withScrollToTop = (routerConfig: RouteObject[]) => {
  return routerConfig.map((route) => {
    return {
      ...route,
      element: <ScrollToTop>{route.element}</ScrollToTop>,
    };
  });
};

// Implementing a middleware guard in your route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  middlewares,
}) => {
  const { data: currentUser, isLoading, isFetching } = useAuthUser();
  const PauseAuthorization = isLoading || isFetching;
  if (!PauseAuthorization) {
    if (middlewares && middlewares.includes("auth")) {
      if (!currentUser?.isAnonymous) {
        // current user is not anonymous
        if (!currentUser?.uid) {
          // user user is not permanently signed in
          return <Navigate to="/login" />;
        }
      }
    }
    if (middlewares && middlewares.includes("guest")) {
      if (currentUser?.uid && !currentUser.isAnonymous) {
        // user is authenticated and user is not anonymous
        return <Navigate to="/" />;
      }
    }
  }

  return children;
};

// Define ScrollToTop component
const ScrollToTop = ({ children }: { children?: any }) => {
  const location = useLocation();
  useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);

  return children;
};

// all pages route
const routes: RouteObject[] = [
  // root
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
  },
];

export const router = createBrowserRouter(withScrollToTop(routes));
export const Client = new QueryClient({
  defaultOptions: { queries: { refetchInterval: false, staleTime: Infinity } },
});
