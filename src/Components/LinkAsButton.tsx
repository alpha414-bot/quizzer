import React from "react";
import { Link, LinkProps } from "react-router-dom";

interface LinkButtonProps extends LinkProps {
  text?: React.ReactNode;
  custom?: boolean;
  disabled?: boolean;
}
const LinkAsButton: React.FC<LinkButtonProps> = ({
  text,
  children,
  className = "px-4 py-0.5 text-base font-medium",
  custom,
  disabled,
  ...props
}) => (
  <Link
    {...props}
    className={`${className} ${
      custom
        ? className + " bg-purple-700 hover:bg-purple-800"
        : `inline-flex items-center text-center rounded-lg ${
            disabled
              ? "cursor-not-allowed bg-gray-400"
              : "py-1 px-4 font-medium bg-purple-700 hover:bg-purple-800 border-2 hover:text-white hover:border-white hover:ring-1 hover:outline-none hover:ring-purple-600"
          } border-transparent`
    }`}
  >
    {text || children}
  </Link>
);

export default LinkAsButton;
