// ErrorPage: Page responsible for handling any thrown error in the web app;
import PageMeta from "@/Layouts/PageMeta";
import { getErrorMessageViaStatus } from "@/System/functions";
import { useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError() as RouteErrorInterface;
  const { shortMessage: statusText, longMessage: message } =
    getErrorMessageViaStatus(error);
  return (
    <PageMeta title={statusText} description={message}>
      <div className="p-12">
        <div className="space-y-9">
          <h1 className="text-6xl font-extrabold">Whoops!</h1>
          <div className="row">
            <div className="col-md-12 manuals">
              <h2 className="font-bold text-lg">{statusText}</h2>
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>
          </div>
        </div>
      </div>
    </PageMeta>
  );
};

export default ErrorPage;
