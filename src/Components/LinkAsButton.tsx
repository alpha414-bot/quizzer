import React, { ReactNode } from "react";
import { Link, LinkProps } from "react-router-dom";

interface LinkButtonProps extends LinkProps {
  text?: React.ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}
const LinkAsButton: React.FC<LinkButtonProps> = ({
  text,
  children,
  className = "px-4 py-0.5 text-base font-medium",
  icon,
  disabled,
  ...props
}) => (
  <Link
    {...props}
    className={`inline-flex items-center text-center ${
      !!icon && "gap-2"
    } rounded-lg ${
      disabled
        ? "cursor-not-allowed bg-gray-400"
        : className +
          " py-1 px-4 font-medium bg-purple-700 hover:bg-purple-800 border-2 text-white hover:text-gray-200 hover:border-gray-200 hover:ring-1 hover:outline-none hover:ring-purple-600"
    } border-transparent`}
  >
    {text || children}
  </Link>
);

export default LinkAsButton;
