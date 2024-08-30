import { useApp, useAuthUser } from "@/System/Module/Hook.ts";
import moment from "moment";
import { NavLink } from "react-router-dom";
import Animate from "./Animate.tsx";

const Footer = () => {
  const { data: currentUser } = useAuthUser();
  const { data: app, isFetched: appDataIsFetched } = useApp();
  return (
    <div className="flex flex-col items-center justify-between pt-5 pb-8 px-4 md:flex-row">
      <div className="md:min-w-48">
        {app?.name && appDataIsFetched && (
          <Animate
            content={
              <p className="text-xs">
                Copyright &copy;{app.name} {moment().format("Y")}. All Right
                Reserved
              </p>
            }
            skeletons={[{ className: "!w-full !h-5" }]}
          />
        )}
      </div>
      <ol className="flex flex-wrap items-center justify-center gap-2">
        {[
          { to: "/", title: "Home" },
          {
            to: `/${currentUser?.claims?.role || "user"}/dashboard`,
            title: "My Account",
            check_auth: true,
          },
          { to: "/sitemap.xml", title: "Sitemap" },
          { to: "/privacy-policy", title: "Privacy Policy" },
        ].map((item, index) => {
          if (!item.check_auth || currentUser) {
            return (
              <Animate
                key={index}
                content={
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `text-xs ${
                        isActive
                          ? "underline-offset-4 decoration-dotted underline"
                          : ""
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                }
                skeletons={[{ className: "!w-16 !h-4" }]}
              />
            );
          }
        })}
      </ol>
    </div>
  );
};

export default Footer;
