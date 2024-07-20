import * as Sentry from "@sentry/react";
import {
  ToastOptions,
  ToastProps,
} from "node_modules/react-toastify/dist/types";
import { toast } from "react-toastify";

export const ToastWrapper = ({ title, text }: ToastWrapperProps) => {
  return (
    <div>
      <p className="text-base font-bold">{title}</p>
      <p
        className="text-sm font-normal"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

const notify = (myProps: ToastWrapperProps, toastProps?: ToastProps) =>
  toast(<ToastWrapper {...myProps} />, { ...toastProps });

notify.success = (myProps: ToastWrapperProps, toastProps?: ToastProps) =>
  toast.success(<ToastWrapper {...myProps} />, { ...toastProps });

notify.info = (myProps: ToastWrapperProps, toastProps?: ToastProps) =>
  toast.info(<ToastWrapper {...myProps} />, { ...toastProps });

notify.error = (
  { title, ...myProps }: ToastWrapperProps,
  error: unknown,
  toastProps?: ToastOptions
) => {
  Sentry.captureException({ error: error, title, myProps });
  return toast.error(<ToastWrapper title={title || "Error"} {...myProps} />, {
    ...toastProps,
  });
};

export { notify };

