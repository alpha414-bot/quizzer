import html2canvas from "html2canvas";
import _ from "lodash";
import moment from "moment";
import React, { useLayoutEffect, useRef } from "react";
import Img from "./Img";

interface CertificatePropsInterface {
  first_name?: string;
  last_name?: string;
  quiz_name?: string;
}

const Certificate: React.FC<CertificatePropsInterface> = ({
  first_name,
  last_name,
  quiz_name,
}) => {
  const OriginalRef = useRef<HTMLDivElement>(null);
  const PreviewRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    html2canvas(OriginalRef.current as HTMLElement).then(function (canvas) {
      PreviewRef.current?.querySelectorAll("*").forEach((n) => n.remove());
      PreviewRef.current?.append(canvas);
      PreviewRef.current?.firstElementChild?.setAttribute(
        "id",
        "CertificateCanvas"
      );
    });
  }, [first_name, last_name, quiz_name]);
  return (
    <>
      <div ref={PreviewRef}></div>
      <div>
        <div
          ref={OriginalRef}
          className="relative w-[67rem] h-[46rem] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/FullBlankCertificate.png")' }}
        >
          <div className="absolute pt-16 pb-[6.5rem] px-24 inset-0 flex flex-col items-center justify-between text-center leading-none gap-20">
            <div className="pt-24 space-y-16">
              <div style={{ fontFamily: "Fraunces" }}>
                <h1 className="text-6xl font-bold tracking-widest">
                  CERTIFICATE
                </h1>
                <p className="text-2xl font-semibold tracking-wide">
                  of Participation
                </p>
              </div>
              <div
                className="flex flex-col gap-y-4"
                style={{ fontFamily: "Quicksand" }}
              >
                <span className="text-xl font-medium leading-none">
                  This certificate is presented to
                </span>
                <span
                  className="block -mt-6 text-5xl leading-none"
                  style={{ fontFamily: "Lobster" }}
                >
                  {_.upperFirst(first_name)} {_.upperFirst(last_name)}
                </span>
                <span className="text-xl font-medium leading-none">
                  for participating in the quiz on{" "}
                  <strong>"{quiz_name}"</strong> on{" "}
                  {moment().format("DD MMMM YYYY")}.
                </span>
              </div>
            </div>
            <div className="grow flex flex-col justify-end gap-4">
              <Img src="/sign.png" public_dir className="max-w-56" />
              <div style={{ fontFamily: "Quicksand" }}>
                <p className="text-xl font-bold">Micheal Lucas</p>
                <p className="text-xl leading-none font-medium">CEO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Certificate;
