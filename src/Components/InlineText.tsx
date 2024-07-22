interface InlineTextInterfaceProps {
  children: React.ReactNode;
  className?: string;
}

const InlineText: React.FC<InlineTextInterfaceProps> = ({
  className,
  children,
}) => {
  return (
    <span>{" "}
      <span className={`inline-block px-2 mt-0.5 rounded-lg text-gray-100 bg-gray-800 dark:text-gray-800 dark:bg-gray-100 ${className}`}>
        {children || "Text"}
      </span>
    </span>
  );
};

export default InlineText;
