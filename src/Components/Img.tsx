import { useMediaFile } from "@/System/Module/Hook";
import React from "react";

interface ImgInterface
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  type?: "image" | "background";
  child?: React.ReactNode;
  public_dir?: boolean;
}

const Img: React.FC<ImgInterface> = ({
  type = "image",
  child,
  public_dir = false,
  src,
  ...props
}) => {
  const { data: path, isFetched } = useMediaFile(src, public_dir);
  if (type === "image") {
    return (
      <>
        {isFetched && (
          <>
            {" "}
            <img src={path} {...props} />
            {child}
          </>
        )}
      </>
    );
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
