import { useMediaFile } from "@/System/Module/Hook";
import React from "react";

interface ImgInterface
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  type?: "image" | "background";
  child?: React.ReactNode;
}

const Img: React.FC<ImgInterface> = ({
  type = "image",
  child,
  src,
  ...props
}) => {
  const { data: path, isFetched } = useMediaFile(src);
  if (type === "image") {
    return <>{isFetched && <img src={path} {...props} />}</>;
  } else if (type === "background") {
    return (
      <>
        {isFetched && (
          <div style={{ backgroundImage: `url("${path}")` }} {...props}>
            {child}
          </div>
        )}
      </>
    );
  }
};

export default Img;
