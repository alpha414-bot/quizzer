import { useBlob } from "@/System/Module/Hook";
import React from "react";

interface ImgInterface
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  // interface ImgInterface extends React.ImgHTMLAttributes<HTMLImageElement> {
}

const Img: React.FC<ImgInterface> = ({ src, className, ...props }) => {
  const { data: mainsrc } = useBlob(src, 150);
  return (
    <>
      <img src={mainsrc} {...props} className="w-full h-full object-fill bg-red-500" />
      <div
        className="hidden absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${mainsrc}")` }}
      >
      </div>
    </>
  );
};

export default Img;
