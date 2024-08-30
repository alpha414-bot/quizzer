import Button from "@/Components/Button";
import Certificate from "@/Components/Certificate";
import App from "@/Layouts/App";
import PageMeta from "@/Layouts/PageMeta";
import { useQuizResult } from "@/System/Module/Hook";
import { useParams } from "react-router-dom";

const CertificateVerifier = () => {
  const { id } = useParams();
  const { data } = useQuizResult(id);
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
        data: {JSON.stringify(data)}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Button type="button" onClick={SendCertificate}>
            Send Certificate
          </Button>
          <div className="mt-5">
            <div className="opacity-">
              <Certificate
                first_name={"first_name"}
                last_name={"last_name"}
                quiz_name={"quiz?.title"}
              />
            </div>
          </div>
        </div>
      </PageMeta>
    </App>
  );
};

export default CertificateVerifier;
