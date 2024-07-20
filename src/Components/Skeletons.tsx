// components/Skeleton.tsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Skeletons: React.FC<SkeletonProps> = ({
  count = 1,
  width = "100%",
  height = "1em",
  className,
  parentClassName,
  resetClassName,
}) => {
  return (
    <Skeleton
      count={count}
      width={width}
      height={height}
      containerClassName={parentClassName}
      className={
        resetClassName
          ? `${className}`
          : `base-gray-300 dark:base-gray-700 mb-2 ${className}`
      }
    />
  );
};

export default Skeletons;
