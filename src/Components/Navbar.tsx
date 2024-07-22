import { useAuthUser } from "@/System/Module/Hook";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Animate from "./Animate";

const Navbar = () => {
  const [onMobileShowMenu, setOnMobileShowMenu] = useState<boolean>(false);
  const { data: currentUser } = useAuthUser();
  return (
    <nav className="relative flex flex-col items-stretch justify-center text-xl py-1 gap-y-8 md:flex-row lg:py-12 md:justify-between">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Animate
            content={<img src="/vite.svg" className="w-16" />}
            skeletons={[{ className: "w-16 h-16 rounded-full" }]}
          />
        </Link>
        <button
          className="block md:hidden"
          onClick={() => setOnMobileShowMenu(!onMobileShowMenu)}
        >
          <svg
            className="w-12 h-12 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              d="M5 7h14M5 12h14M5 17h10"
            />
          </svg>
        </button>
      </div>

      <ol
        className={`${
          onMobileShowMenu ? "flex" : "hidden"
        } absolute top-full left-0 right-0 z-40 flex-col bg-gray-300/95 dark:bg-gray-700 py-6 px-4 items-start justify-center gap-y-9 gap-x-8 md:bg-gray-700/0 md:dark:bg-gray-700/0 md:dark:text-white md:py-0 md:flex-row md:items-center md:justify-between md:static md:flex`}
      >
        {[
          { route: "/", title: "Home" },
          { route: "/quizzes", title: "Quizzes" },
          { route: "/contact", title: "Contact" },
          {
            route: `/${currentUser?.claims?.role || "user"}/dashboard`,
            title: "My Account",
            check_auth: true,
          },
        ].map((item, index) => {
          if (!item.check_auth || currentUser) {
            return (
              <Animate
                key={index}
                content={
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "underline-offset-4 decoration-dotted underline"
                          : ""
                      } font-medium transition-all duration-200 delay-75 ease-in-out hover:text-gray-700 hover:dark:text-gray-300`
                    }
                  >
                    {item.title}
                  </NavLink>
                }
                skeletons={[{ className: "h-6 w-20" }]}
              />
            );
          } else {
            return (
              <Animate
                key={index}
                content={
                  <NavLink
                    to={"/user/login"}
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "underline-offset-4 decoration-dotted underline"
                          : ""
                      } font-medium transition-all duration-200 delay-75 ease-in-out hover:text-gray-700 hover:dark:text-gray-300`
                    }
                  >
                    Login
                  </NavLink>
                }
                skeletons={[{ className: "h-6 w-20" }]}
              />
            );
          }
        })}
      </ol>
    </nav>
  );
};

export default Navbar;
