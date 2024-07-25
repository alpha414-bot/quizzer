import Animate from "@/Components/Animate";
import Button from "@/Components/Button";
import Input from "@/Components/Input";
import MediaModal from "@/Components/MediaModal";
import TextArea from "@/Components/TextArea";
import PageMeta from "@/Layouts/PageMeta";
import { useApp } from "@/System/Module/Hook";
import { queryToStoreAppMetaData } from "@/System/Module/Query";
import { AppMetaDataInterface } from "@/Types/Module";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

const AdminAppSettings = () => {
  const { data: app, isFetched } = useApp();
  const { control, handleSubmit, reset } = useForm<AppMetaDataInterface>({
    mode: "all",
    defaultValues: {},
  });
  useEffect(() => {
    if (isFetched && app) {
      reset(app);
    }
  }, [isFetched, app, reset]);
  return (
    <PageMeta title="App Settings" admin>
      <div>
        <div className="overflow-y-auto overflow-x-hidden justify-center items-center w-full h-modal md:h-full">
          <div className="w-full h-full md:h-auto">
            {/* Modal content */}
            <div className="bg-white dark:bg-gray-800">
              {/* Modal header */}
              <div className="flex justify-between items-center pb-2 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
                <Animate
                  content={
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      App Settings
                    </h3>
                  }
                  skeletons={[{ className: "w-44 h-9" }]}
                />
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit(queryToStoreAppMetaData)}>
                {/* hide */}
                <div className="grid mb-4 grid-cols-1 items-start gap-y-8 gap-x-4 lg:grid-cols-2">
                  <div className="space-y-4">
                    <Animate
                      content={
                        <>
                          <div>
                            <MediaModal
                              name="favicon"
                              placeholder="Upload Favicon"
                              control={control}
                              rules={{ required: "Favicon is required" }}
                            />
                          </div>
                          <div>
                            <MediaModal
                              name="logo"
                              placeholder="Upload App Logo <br/><small>(For Navigation & Footer)</small>"
                              control={control}
                              rules={{ required: "Logo is required" }}
                            />
                          </div>
                        </>
                      }
                      fill={2}
                      skeletons={[{ className: "w-full h-48" }]}
                    />
                  </div>
                  <div className="flex flex-col justify-between space-y-3 lg:p-3">
                    <div className="space-y-7">
                      <Animate
                        content={
                          <>
                            <Input
                              name="name"
                              control={control}
                              placeholder="App Name"
                              // defaultValue={"alpha"}
                            />
                            <TextArea
                              name="description"
                              control={control}
                              placeholder="Description"
                              rows={5}
                            />
                            <Input
                              name="system_email"
                              control={control}
                              placeholder="System Email"
                            />
                          </>
                        }
                        skeletons={[
                          { className: "w-full h-8" },
                          { className: "w-full h-28" },
                          { className: "w-full h-8" },
                        ]}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Animate
                        content={<Button type="submit">Save</Button>}
                        skeletons={[{ className: "h-9 w-24" }]}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  <svg
                    className="mr-1 -ml-1 w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add new product
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageMeta>
  );
};

export default AdminAppSettings;
