import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode;
  icon?: React.ReactNode;
  iconAlign?: "left" | "right";
}
const Button: React.FC<ButtonProps> = ({
  text,
  children,
  className = "px-4 py-0.5 text-base font-medium",
  icon,
  iconAlign = "right",
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex items-center text-center ${
        !!icon
          ? `gap-0.5 ${iconAlign == "left" ? "pl-1 pr-2" : "pl-2 pr-1"}`
          : "pl-4 pr-4"
      } rounded-lg ${
        disabled
          ? "cursor-not-allowed bg-gray-400"
          : className +
            " py-1 font-medium bg-purple-700 hover:bg-purple-800 border-2 text-white hover:text-gray-200 hover:border-gray-200 hover:ring-1 hover:outline-none hover:ring-purple-600"
      } border-transparent`}
    >
      {iconAlign == "left" && icon}
      {text || children}
      {iconAlign == "right" && icon}
    </button>
  );
};

export default Button;
