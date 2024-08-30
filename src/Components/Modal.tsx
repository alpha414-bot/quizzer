// Application Modal
import { Modal as FlowbiteModal, InstanceOptions } from "flowbite";
import React, { useEffect, useState } from "react";
import OutsideClick from "./OutsideClick";

interface ModalInterface {
  id: string;
  text: string;
  title?: string;
  content?: React.ReactNode;
}

const Modal: React.FC<ModalInterface> = ({
  id = "modal",
  text,
  title,
  content,
}) => {
  const idModal = `${id}Modal`;
  const [modal, setModal] = useState<FlowbiteModal>();
  useEffect(() => {
    const $targetEl: HTMLElement | null = document.getElementById(idModal);
    // instance options object
    const instanceOptions: InstanceOptions = {
      id: idModal,
      override: true,
    };
    const modalInstance = new FlowbiteModal(
      $targetEl,
      {
        placement: "center",
        backdrop: "dynamic",
        backdropClasses:
          // "bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 -z-0",
          "",
        closable: true,
      },
      instanceOptions
    );
    setModal(modalInstance);
    // return modalInstance.hide();
  }, [id, text, title, content]);
  return (
    <>
      <button
        onClick={() => modal?.toggle()}
        className="inline-flex items-center text-center gap-2 rounded-lg py-1 px-4 font-medium bg-purple-700 hover:bg-purple-800 border-2 text-white hover:text-gray-200 hover:border-gray-200 hover:ring-1 hover:outline-none hover:ring-purple-600 border-transparent"
        type="button"
      >
        {text}
      </button>

      <div
        id={idModal}
        tabIndex={-1}
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-50 hidden bg-gray-900/60 w-full p-4 overflow-x-hidden overflow-y-hidden inset-0 max-h-full"
      >
        <div className="relative w-full max-w-2xl max-h-full">
          {/* Modal content */}
          <OutsideClick
            outsideClick={() => modal?.hide()}
            className="relative bg-white rounded-lg shadow dark:bg-gray-700"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              {title && (
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => modal?.hide()}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            {/* Modal body */}
            <div className="py-4 max-h-[75vh] fine-scroll">{content}</div>
            {/* Modal footer */}
            {false && (
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  onClick={() => modal?.hide()}
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  I accept
                </button>
                <button
                  onClick={() => modal?.hide()}
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  Decline
                </button>
              </div>
            )}
          </OutsideClick>
        </div>
      </div>
    </>
  );
};

export default Modal;
