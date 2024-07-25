import { useMediaFile } from "@/System/Module/Hook";
import React from "react";

interface ImgInterface
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {}

const Img: React.FC<ImgInterface> = ({ src, ...props }) => {
  const { data: path, isFetched } = useMediaFile(src);
  return <>{isFetched && <img src={path} {...props} />}</>;
};

export default Img;
