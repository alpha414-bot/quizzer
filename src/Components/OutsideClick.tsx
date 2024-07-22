import React, { useEffect, useRef } from "react";

interface OutsideClickInterface {
  outsideClick: any;
  insideClick?: any;
  children: any;
  className?: string | undefined;
}

const OutsideClick: React.FC<OutsideClickInterface> = ({
  children,
  className,
  outsideClick,
  insideClick,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (parentRef.current && !parentRef.current?.contains(event.target)) {
        return outsideClick();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleClickOutside(document);
      }
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", (e) => {
        let key = e.key;
        if (
          key === "Enter" ||
          key === "Tab" ||
          key === "Escape" ||
          key === "Meta"
        ) {
          handleClickOutside(document);
        }
      });
    };
  }, []);
  return (
    <div ref={parentRef} className={className} onClick={insideClick}>
      {children}
    </div>
  );
};

export default OutsideClick;
