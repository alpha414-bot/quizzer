// route & middleware type/interface
type MiddlewareItems = "auth" | "user" | "guest" | "admin" | "admin_guest";
interface RouteErrorInterface {
  status: string | number;
  statusText: string;
  internal: boolean;
  data: string;
  stack?: any;
  error?: object;
}
interface ProtectedRouteProps extends HtmlHTMLAttributes<HTMLDivElement> {
  children?: ReactNode | undefined;
  middlewares?: MiddlewareItems[];
}

// auth type/interface
interface GeneralLoginInterface {
  user?: string;
  password?: string;
}

// media types/interface
type MimesType = {
  [key: string]: ExtensionType[];
};

type ExtensionType =
  | ".avif"
  | ".bmp"
  | ".gif"
  | ".ico"
  | ".jpeg"
  | ".jpg"
  | ".png"
  | ".svg"
  | ".webp"
  | ".aac"
  | ".flac"
  | ".mp3"
  | ".ogg"
  | ".wav"
  | ".avi"
  | ".mp4"
  | ".mkv"
  | ".mpeg"
  | ".ogg"
  | ".webm" // '.csv'|
  | ".doc"
  | ".docx"
  // '.html'|
  | ".pdf"
  | ".ppt"
  | ".pptx"
  | ".txt"
  | ".xls"
  | ".xlsx";

interface FileInterface extends File {
  path?: string;
}

// miscellaneous interface or extensions
interface SkeletonProps {
  count?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
  parentClassName?: string;
  resetClassName?: boolean;
}

type DropdownOptionsType = {
  key: string;
  value: string;
  description?: string;
};

interface ToastWrapperProps {
  title?: any;
  text: any;
}

type Object = { [key: string]: unknown };
