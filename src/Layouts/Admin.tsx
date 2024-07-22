import Footer from "@/Components/Footer";
import NavBarAdmin from "@/Components/NavBarAdmin";
import { useAuthUser } from "@/System/Module/Hook";
import React, { useLayoutEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";

const Admin: React.FC<{
  children: React.ReactNode;
  title: string;
  description?: string;
  no_navbar?: boolean;
  no_footer?: boolean;
}> = ({ children, title, description, no_navbar, no_footer }) => {
  const [showLoadingBar, setShowLoadingBar] = useState<boolean>(false);
  const { data: currentUser } = useAuthUser();
  useLayoutEffect(() => {
    setShowLoadingBar(true);
  }, []);
  return (
    <>
      {showLoadingBar && (
        <LoadingBar
          height={3}
          color="rgb(126,34,206)"
          transitionTime={800}
          progress={100}
        />
      )}

      <meta name="description" content={description} />
      <title>{title} - Admin - Dashboard</title>
      <div>
        {!no_navbar && <NavBarAdmin />}
        <main
          className={`pt-20 px-4  ${!!currentUser ? "md:ml-64 h-auto" : ""}`}
        >
          <div>{children}</div>
          <div className="">{!no_footer && <Footer />}</div>
        </main>
      </div>
    </>
  );
};

export default Admin;
