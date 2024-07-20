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
interface RouteErrorInterface {
  status: string | number;
  statusText: string;
  internal: boolean;
  data: string;
  error?: object;
}
interface ProtectedRouteProps extends HtmlHTMLAttributes<HTMLDivElement> {
  children?: ReactNode | undefined;
  middlewares?: MiddlewareItems[];
}
interface ToastWrapperProps {
  title?: any;
  text: any;
}
