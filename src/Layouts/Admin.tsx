import Footer from "@/Components/Footer";
import NavBarAdmin from "@/Components/NavBarAdmin";
import { useAuthUser } from "@/System/Module/Hook";
import { initFlowbite } from "flowbite";
import React, { useEffect, useLayoutEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";

const Admin: React.FC<{
  children: React.ReactNode;
  no_navbar?: boolean;
  no_footer?: boolean;
}> = ({ children, no_navbar, no_footer }) => {
  const [showLoadingBar, setShowLoadingBar] = useState<boolean>(false);
  const { data: currentUser, isLoading, isFetching, isFetched } = useAuthUser();
  const PauseAuthorization = isLoading || isFetching;
  useEffect(() => {
    initFlowbite();
    return () => {
      initFlowbite();
    };
  }, [currentUser]);
  useLayoutEffect(() => {
    setShowLoadingBar(true);
  }, [showLoadingBar, currentUser, PauseAuthorization, isLoading]);
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
      <div>
        {!no_navbar && <NavBarAdmin />}
        <main
          className={`pt-20 px-4  ${
            !!currentUser && !PauseAuthorization && isFetched
              ? "md:ml-64 h-auto"
              : ""
          }`}
        >
          <div>{children}</div>
          <div className="">{!no_footer && <Footer />}</div>
        </main>
      </div>
    </>
  );
};

export default Admin;
