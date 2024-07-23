import Spinner from "@/Components/Spinner";
import Admin from "@/Layouts/Admin";
import App from "@/Layouts/App";
import AdminAppSettings from "@/Pages/Admin/AppSettings";
import AdminDashboard from "@/Pages/Admin/Dashboard";
import AdminLogin from "@/Pages/Admin/Login";
import DynamicImage from "@/Pages/DynamicImage";
import ErrorPage from "@/Pages/ErrorPage";
import Home from "@/Pages/Home";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { compress, decompress } from "lz-string";
import { useLayoutEffect } from "react";
import {
  Navigate,
  Outlet,
  RouteObject,
  createBrowserRouter,
  useLocation,
  useNavigate,
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
  const navigate = useNavigate();
  const { data: currentUser, isLoading, isFetching, isFetched } = useAuthUser();
  const PauseAuthorization = isLoading || isFetching;
  useLayoutEffect(() => {
    if (!PauseAuthorization && isFetched) {
      if (middlewares && middlewares.includes("auth")) {
        if (!currentUser?.uid) {
          // user is not authenticated
          navigate("/user/login", {
            replace: true,
          });
        }
      }
      if (middlewares && middlewares.includes("user")) {
        if (!currentUser || !(currentUser.claims?.role === "user")) {
          // user is authenticated and the user role is not "user", then there is need to login in to another instance
          navigate("/user/login", {
            replace: true,
          });
        }
      }
      if (middlewares && middlewares.includes("guest")) {
        if (currentUser?.claims?.role === "user") {
          // user is authenticated
          navigate("/user/dashboard", {
            replace: true,
          });
        }
      }
      if (middlewares && middlewares.includes("admin")) {
        // make sure admin is accessing the resources
        if (!currentUser || !currentUser.claims?.admin) {
          // user is not authenticated or authenticated user is not an admin
          navigate("/admin/login", {
            replace: true,
          });
        }
      }
      if (middlewares && middlewares.includes("admin_guest")) {
        // make sure this is not an admin
        if (currentUser?.claims?.admin) {
          // admin is d authenticated user, (then redirect to the dashboard)
          navigate("/admin/dashboard", {
            replace: true,
          });
        }
      }
    }
  }, [currentUser, PauseAuthorization]);

  if (PauseAuthorization) {
    // query is still loading and fetching, therefore, load the spinner
    return (
      <App title="..." no_navbar no_footer>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      </App>
    );
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
  // user routing
  {
    path: "/user",
    element: <Navigate to="/user/login" />,
  },
  {
    path: "/user/login",
    element: (
      <ProtectedRoute middlewares={["guest"]}>
        <p>User login form</p>
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/dashboard",
    element: (
      <ProtectedRoute middlewares={["user"]}>
        <p>User Dashboard</p>
      </ProtectedRoute>
    ),
  },

  // admmin routing
  {
    path: "/admin",
    element: <Navigate to="/admin/login" />,
  },
  // guest mode
  {
    path: "/admin",
    element: (
      <Admin no_navbar>
        <ProtectedRoute middlewares={["admin_guest"]}>
          <Outlet />
        </ProtectedRoute>
      </Admin>
    ),
    children: [{ path: "login", element: <AdminLogin /> }],
  },
  // authenticated mode
  {
    path: "/admin",
    element: (
      <ProtectedRoute middlewares={["admin"]}>
        <Admin>
          <Outlet />
        </Admin>
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "users", element: <p>Admin user list</p> },
      { path: "inbox", element: <p>Admin inbox</p> },
      { path: "profile", element: <p>Admin profile</p> },
      { path: "users/:state", element: <p>users list</p> },
      { path: "q/:state", element: <p>quizzes list</p> },
      { path: "quizzes", element: <p>Quizzes</p> },
      { path: "app/settings", element: <AdminAppSettings /> },
      {
        path: "register/user",
        element: <p>Register new user account or add company ID</p>,
      },
      { path: "account", element: <p>Admin account settings</p> },
      { path: "help", element: <p>App Help</p> },
    ],
  },
  // dynamic images,
  {
    path: "/image",
    element: <DynamicImage />,
  },
];

export const router = createBrowserRouter(withScrollToTop(routes));
export const Client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export const QueryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  serialize: (data) => compress(JSON.stringify(data)),
  deserialize: (data) => JSON.parse(decompress(data)),
});
