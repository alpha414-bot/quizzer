import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode;
  custom?: boolean;
}
const Button: React.FC<ButtonProps> = ({
  text,
  children,
  className = "px-4 py-0.5 text-base font-medium",
  custom,
  disabled,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled}
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
  </button>
);

export default Button;
