import Button from "@/Components/Button";
import Certificate from "@/Components/Certificate";
import InlineText from "@/Components/InlineText";
import App from "@/Layouts/App";
import PageMeta from "@/Layouts/PageMeta";
import { useQuiz, useQuizResult } from "@/System/Module/Hook";
import { QuizDataInterface, QuizDataResult } from "@/Types/Module";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const CertificateVerifier = () => {
  const { id } = useParams();
  const { data, isFetched: DataIsFetched } = useQuizResult<QuizDataResult>(id);
  const { data: quiz, isFetched: QuizIsFetched } = useQuiz<QuizDataInterface>(
    data?.quiz_id
  );
  useEffect(() => {
    if (DataIsFetched && QuizIsFetched && (!quiz?.title || !data?.first_name)) {
      throw new Response("Not Found", {
        status: 404,
        statusText: "Certificate Not Found",
      });
    }
  }, [quiz]);
  const SendCertificate = () => {
    const element = document.getElementById(
      "CertificateCanvas"
    ) as HTMLCanvasElement;
    if (element) {
      let url = element?.toDataURL("image/png");
      let link = document.createElement("a");
      link.download = "filename.png";
      link.href = url;
      link.click();
    }
  };
  return (
    <App>
      <PageMeta title="C3V - Certificate Verification">
        {DataIsFetched && QuizIsFetched && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex items-start justify-between w-full">
              <div className="flex flex-col">
                <InlineText
                  children={quiz?.title}
                  className="!py-2 !bg-gray-100 !text-gray-800 text-4xl !font-extrabold underline underline-offset-4 decoration-dotted"
                />
                <InlineText
                  children={quiz?.description}
                  className="!text-sm !bg-gray-100 !text-gray-800 !rounded !font-medium"
                />
              </div>
              <Button type="button" onClick={SendCertificate}>
                Download Certificate
              </Button>
            </div>
            <div className="mt-5">
              <div className="opacity">
                <Certificate
                  first_name={data?.first_name}
                  last_name={data?.last_name}
                  quiz_name={quiz?.title}
                />
              </div>
            </div>
          </div>
        )}
      </PageMeta>
    </App>
  );
};

export default CertificateVerifier;
