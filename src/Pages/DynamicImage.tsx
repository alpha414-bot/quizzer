import { useBlob, useMediaFile } from "@/System/Module/Hook";

const DynamicImage = () => {
  const unused_path =
    "uploads/Diu0WzcvweG39qzkObBdAodr1xCJ/LinkedinPictureB.png";
  const { data: src } = useMediaFile(unused_path);
  const { data: blob } = useBlob(src);
  const { data: blobb } = useBlob(src, 700);
  //   return resizeFile(src);
  return (
    <div>
      <p>show DynamicImage using sharp</p>
      <div className="flex items-start">
        <div className="w-36 h-full">
          <img src={src} className=""/>
        </div>
        <img src={blob} />
        <img src={blobb} />
      </div>
    </div>
  );
};

export default DynamicImage;
