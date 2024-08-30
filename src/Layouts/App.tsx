import Footer from "@/Components/Footer";
import Navbar from "@/Components/Navbar";
import React, { useLayoutEffect, useState } from "react";
import LoadingBar from "react-top-loading-bar";

const App: React.FC<{
  children: React.ReactNode;
  no_margin?: boolean;
  no_navbar?: boolean;
  no_footer?: boolean;
}> = ({ children, no_margin, no_navbar, no_footer }) => {
  const [showLoadingBar, setShowLoadingBar] = useState<boolean>(false);
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
      <div className={no_margin ? "" : "px-12"}>
        {!no_navbar && <Navbar />}
        <div id="page" className="relative z-10">
          <div id="wrapper">{children}</div>
        </div>
        {!no_footer && <Footer />}
      </div>
    </>
  );
};

export default App;
