import { useMediaFile } from "@/System/Module/Hook";
import { MediaItemInterface } from "@/Types/Module";
import _ from "lodash";
import Img from "./Img";

const MediaComponent = ({
  item,
  onSelect,
}: {
  item: MediaItemInterface;
  onSelect?: any;
}) => {
  const type = _.split(item?.media.contentType || "image/*", "/")[0];
  const { data: src } = useMediaFile(item.media.fullPath);
  // const src = false;
  return (
    <div
      className={`relative h-44 bg-purple-400 bg-opacity-50 rounded-md overflow-hidden border border-purple-500 group`}
    >
      <div
        className="absolute right-1 top-1 z-50 p-0.5 rounded-md bg-purple-500 cursorpointer shadow-md"
        onClick={() => {
          console.log("delete me");
        }}
      >
        <svg
          className="w-6 h-6 text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
          />
        </svg>
      </div>
      <button
        type="button"
        className={` relative w-full h-full bg- bg-no-repeat rounded-md bg-center ${
          !src
            ? "flex flex-col gap-1 items-center justify-center cursor-not-allowed px-3"
            : "flex items-stretch justify-center cursorpointer"
        }`}
        onClick={() => {
          if (src) return onSelect(item);
        }}
        // style={{ backgroundImage: `url("${src}")` }}
      >
        <Img src={src} className="w-full h-full" />
        {!src && (
          <>
            {type == "image" && (
              <span className="material-symbols-outlined text-6xl text-white">
                image_not_supported
              </span>
            )}
            {type == "document" && (
              <span className="material-symbols-outlined text-6xl text-white">
                unknown_document
              </span>
            )}
            <span className="font-semibold text-white text-sm text-center">
              !! {_.upperFirst(type)} not found !!
            </span>
          </>
        )}
        <div className="absolute z-50 bottom-0 w-full text-sm bg-gray-200 text-gray-800 bg-opacity-40 font-medium py-0.5">
          {item.media.name}
        </div>
      </button>
    </div>
  );
};

export default MediaComponent;
