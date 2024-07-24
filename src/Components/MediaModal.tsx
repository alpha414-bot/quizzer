import { auth } from "@/firebase-config";
import { getFileExtension, MIME_TYPE } from "@/System/functions";
import { useUserMedia } from "@/System/Module/Hook";
import { queryToUploadFiles } from "@/System/Module/Query";
import _ from "lodash";
import React, { useCallback, useState } from "react";
import { FileError, useDropzone } from "react-dropzone";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import MediaComponent from "./MediaComponent";

type MediaMimeType = "image" | "video" | "document" | "others";

const MediaModal: React.FC<{
  mediaType?: MediaMimeType[];
  name: string;
  placeholder: string;
  control: Control;
  rules?: RegisterOptions;
}> = ({
  name,
  placeholder,
  control,
  rules,
  mediaType = ["image", "video", "document", "others"],
}) => {
  const [isMediaUploading, setIsImageUploading] = useState(false);
  const { data: medias } = useUserMedia();
  const onDrop = useCallback(async (acceptedFiles?: any) => {
    // Do something with the files
    // Use the Inertia.post method to send the file to your Laravel backend.
    if (acceptedFiles.length > 0) {
      // acceptedFiles has files in it and it is not empty
      // // uploading file
      setIsImageUploading(true);
      setTimeout(() => {
        queryToUploadFiles(
          acceptedFiles,
          `/uploads/${auth.currentUser?.uid}`,
          false
        ).finally(() => {
          setIsImageUploading(false);
        });
      }, 0 * 1000); // 5 seconds
    }
    return acceptedFiles;
  }, []);
  let extensions: MimesType = {};

  if (mediaType) {
    for (const mime of mediaType) {
      let extensionsForMimeType = MIME_TYPE[mime + "/*"] as ExtensionType[];
      extensions[mime + "/*"] = extensionsForMimeType ?? [];
    }
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 3,
      validator: (file) => {
        // check the file extension is among the media accepted type\
        const FILE_EXTENSION = getFileExtension(file.name);
        if (!_.includes(_.flatMap(extensions), "." + FILE_EXTENSION)) {
          return {
            code: "file-is-not-valid",
            message:
              "File is not among the valid accepted media types, which are " +
              _.join(_.flatMap(extensions), ", "),
          };
        }
        return null;
      },
    });

  mediaType = _.map(mediaType, _.lowerCase) as MediaMimeType[];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        return (
          <>
            <div className="flex flex-col items-stretch gap-4 md:flex-row">
              <button
                id="mediaButton"
                data-modal-target="mediaModal"
                data-modal-toggle="mediaModal"
                type="button"
                className="w-full cursorpointer text-center text-base font-semibold text-gray-800 flex flex-col gap-y-2 items-center justify-center py-6 px-2 border-2 border-purple-500 border-dotted rounded"
              >
                <svg
                  className="w-12 h-12 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m14.707 4.793-4-4a1 1 0 0 0-1.416 0l-4 4a1 1 0 1 0 1.416 1.414L9 3.914V12.5a1 1 0 0 0 2 0V3.914l2.293 2.293a1 1 0 0 0 1.414-1.414Z" />
                  <path d="M18 12h-5v.5a3 3 0 0 1-6 0V12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                </svg>
                <span dangerouslySetInnerHTML={{ __html: placeholder }} />
              </button>
              {value && typeof value === "object" && (
                <div className="md:max-w-60">
                  <MediaComponent
                    item={value}
                    showCase
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                </div>
              )}
            </div>
            {error && (
              <span
                className="block mt-0.5 mb-2.5 text-xs tracking-wider font-medium underline underline-offset-4 decoration-dotted text-red-500"
                dangerouslySetInnerHTML={{
                  __html: error.message || "Error encountered with the input",
                }}
              ></span>
            )}

            <div
              id="mediaModal"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden overflow-y-auto bg-gray-400/10 overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-modal md:h-full"
            >
              <div className="relative p-4 w-full max-w-2xl h-full overflow-hidden">
                {/* Modal content */}
                <div className="relative text-center max-h-[90vh] overflow-y-auto scroll-smooth bg-white rounded-lg shadow sm:p-5">
                  <div className="">
                    <div>
                      {/* Tab List */}
                      <div className="sticky -top-8 pt-6 bg-white z-50 w-full border-b border-gray-200">
                        <ul
                          className="flex flex-wrap items-center justify-center -mb-px text-sm font-medium text-center md:justify-start"
                          id="media-tab"
                          data-tabs-toggle="#media-tab-content"
                          data-tabs-active-classes="text-purple-700 hover:text-purple-700 border-purple-600"
                          data-tabs-inactive-classes="text-gray-500 hover:text-gray-600 border-gray-100 hover:border-gray-300"
                          role="tablist"
                        >
                          {mediaType.map((media_name, index) => {
                            return (
                              <li
                                key={index}
                                className="me-2"
                                role="presentation"
                              >
                                <button
                                  className="inline-block p-4 border-b-2 rounded-t-lg"
                                  id="media-tab"
                                  data-tabs-target={`#${media_name}_tab`}
                                  type="button"
                                  role="tab"
                                  aria-controls={media_name}
                                  aria-selected="false"
                                >
                                  {_.startCase(media_name)}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      {/* Tab Panels */}
                      <div id="media-tab-content">
                        {mediaType.map((media_name, index) => {
                          return (
                            <div
                              key={index}
                              className="hidden p-2"
                              id={`${media_name}_tab`}
                              role="tabpanel"
                              aria-labelledby={`${media_name}-tab`}
                            >
                              {(_.includes(mediaType, media_name) && (
                                <>
                                  <div className="py-6 ">
                                    <div className="grid grid-col grid-cols-2 items-start flex-wrap gap-3 md:grid-cols-3">
                                      {(isMediaUploading && (
                                        <>
                                          <div className="h-44 bg-purple-400 rounded-md border-2 border-purple-500 p-2 cursor-not-allowed flex flex-col items-center justify-center gap-y-1.5">
                                            <svg
                                              className="w-12 h-12 text-red-700"
                                              aria-hidden="true"
                                              xmlns="http://www.w3.org/2000/svg"
                                              width={24}
                                              height={24}
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M13.383 4.076a6.5 6.5 0 0 0-6.887 3.95A5 5 0 0 0 7 18h3v-4a2 2 0 0 1-1.414-3.414l2-2a2 2 0 0 1 2.828 0l2 2A2 2 0 0 1 14 14v4h4a4 4 0 0 0 .988-7.876 6.5 6.5 0 0 0-5.605-6.048Z" />
                                              <path d="M12.707 9.293a1 1 0 0 0-1.414 0l-2 2a1 1 0 1 0 1.414 1.414l.293-.293V19a1 1 0 1 0 2 0v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-2-2Z" />
                                            </svg>

                                            <p className="text-red-700  font-semibold text-center text-sm">
                                              Wait!, upload is in progress...
                                            </p>
                                          </div>
                                        </>
                                      )) || (
                                        <div
                                          {...getRootProps()}
                                          className="h-44 bg-purple-400 rounded-md border-2 border-purple-500 p-2 flex items-center justify-center cursor-pointer"
                                        >
                                          <input {...getInputProps()} />
                                          {isDragActive ? (
                                            <p className="text-center text-sm text-white font-bold">
                                              Drop the files here ...
                                            </p>
                                          ) : (
                                            <div className="flex flex-col items-center justify-center gap-y-1.5">
                                              <svg
                                                className="w-[45px] h-[45px] text-white"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="m14.707 4.793-4-4a1 1 0 0 0-1.416 0l-4 4a1 1 0 1 0 1.416 1.414L9 3.914V12.5a1 1 0 0 0 2 0V3.914l2.293 2.293a1 1 0 0 0 1.414-1.414Z" />
                                                <path d="M18 12h-5v.5a3 3 0 0 1-6 0V12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                                              </svg>
                                              <p className="text-center text-sm text-white font-bold">
                                                Drag & drop some files here, or
                                                click to select files.
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      {medias &&
                                        medias
                                          .filter((media) => {
                                            const { media: File } = media;
                                            const fileExtension =
                                              getFileExtension(File.name);
                                            const MimeExtensions =
                                              MIME_TYPE[`${media_name}/*`];
                                            if (
                                              MimeExtensions &&
                                              MimeExtensions.includes(
                                                `.${fileExtension}` as any
                                              )
                                            ) {
                                              return media;
                                            }
                                          })
                                          .map((item, index) => (
                                            <MediaComponent
                                              key={index}
                                              item={item}
                                              onChange={onChange}
                                              onBlur={onBlur}
                                              // {...{ onChange, onBlur }}
                                            />
                                          ))}
                                    </div>
                                  </div>
                                </>
                              )) || <p>No Media</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <ul className="space-y-2 ">
                      {fileRejections.map(
                        (
                          item: { file: FileInterface; errors?: FileError[] },
                          index
                        ) => {
                          return (
                            <li key={index} className="">
                              <span className="font-semibold text-white text-sm bg-red-400 rounded py-1 px-2">
                                {item?.file?.path}
                              </span>
                              <ul className="space-y-1 ml-5 mt-1">
                                {item.errors?.map((item, index) => (
                                  <li
                                    key={index}
                                    className="break-words text-sm"
                                  >
                                    {item.message}
                                  </li>
                                ))}
                              </ul>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }}
    />
  );
};

export default MediaModal;
