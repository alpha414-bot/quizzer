import React, { useEffect, useState } from "react";
import Skeletons from "./Skeletons";

interface AnimateInterfaceProps {
  content?: React.ReactNode;
  skeletons: SkeletonProps[];
  loading?: boolean;
  timeout?: number;
  fill?: number;
}
const Animate: React.FC<AnimateInterfaceProps> = ({
  content,
  skeletons,
  fill,
  loading = false,
  // timeout = 0,
  timeout = 2000,
}) => {
  const [showContent, setShowContent] = useState<boolean>(false);
  const _timeout = () => {
    // load skeleton for the specified timeout
    setTimeout(() => {
      setShowContent(true);
    }, timeout);
  };
  useEffect(() => {
    _timeout();
    return () => _timeout();
  }, [timeout, loading]);
  return (
    <>
      {showContent
        ? content
        : (!fill && (
            <>
              {skeletons.map((item, index) => (
                <Skeletons key={index} {...item} />
              ))}
            </>
          )) || (
            <>
              {Array(fill)
                .fill(skeletons && skeletons[0])
                .map((item, index) => (
                  <Skeletons key={index} {...item} />
                ))}
            </>
          )}
    </>
  );
};

export default Animate;
