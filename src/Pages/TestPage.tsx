import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import _ from "lodash";
import { useEffect } from "react";

const TestPage = () => {
  useEffect(() => {
    async function main() {
      let st = document.getElementById("1st");
      let nd = document.getElementById("2nd");
      let rd = document.getElementById("3rd");
      if (st && nd && rd) {
        let st_canvas = await html2canvas(st);
        let nd_canvas = await html2canvas(nd);
        let rd_canvas = await html2canvas(rd);
        let st_image = st_canvas.toDataURL("image/png");
        let nd_image = nd_canvas.toDataURL("image/png");
        let rd_image = rd_canvas.toDataURL("image/png");
        const width = 21;
        const height = _.max([
          st_canvas.height,
          nd_canvas.height,
          rd_canvas.height,
        ]) as number;
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "cm",
          format: [width, height],
        });
        pdf.addImage(st_image, "PNG", 0, 0, st_canvas.width, st_canvas.height);
        pdf.addImage(nd_image, "PNG", 0, 0, nd_canvas.width, nd_canvas.height);
        pdf.addImage(rd_image, "PNG", 0, 0, rd_canvas.width, rd_canvas.height);
        // pdf.save(`2021004993-BCH310.pdf`);
      }
    }
    main();
  }, []);
  return (
    <>
      <div>
        <div id="procedure" className="flex flex-col gap-2">
          <div
            id="1st"
            className=" bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("/1st.jpg")`,
              width: "21cm",
              height: "29.7cm",
            }}
          />
          <div
            id="2nd"
            className=" bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("/2nd.jpg")`,
              width: "21cm",
              height: "29.7cm",
            }}
          />
          <div
            id="3rd"
            className=" bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("/3rd.jpg")`,
              width: "21cm",
              height: "29.7cm",
            }}
          />
        </div>
      </div>
      <div className="hidden pt-4 pb-2 relative flex flex-col justify-between min-h-screen">
        <div>
          <div className="flex items-center justify-between px-16">
            <img
              // src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Ni%C4%9Deria_Ru%C4%9Da_Kruco.png"
              src="https://www.redcrossnigeria.org/sites/default/files/logo-red.png"
              className="max-w-24"
              alt=""
            />
            <div className="text-center py flex flex-col items-stretch justify-between">
              <h2 className="text-2xl text-red-600 font-extrabold leading-">
                NIGERIAN RED CROSS SOCIETY
              </h2>
              <h2 className="text-xl font-bold leading-4">OYO STATE BRANCH</h2>
              <p className="text-lg">OGBOMOSO DIVISION</p>
              <p className="text-lg leading-4 text-red-500 font-medium">
                LAUTECH DETACHMENT, OGBOMOSO
              </p>
            </div>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMhgbuS6DxtOUbw46YXj1tsgjcyoH3TAKsRA&s"
              className="max-w-24"
              alt=""
            />
          </div>
          <div className="bg-red-600 text-xs text-center py-1.5 px-6 mt-3 text-white flex items-center justify-between">
            <p>Emergency No: 08106946522</p>
            <p>
              Email:{" "}
              <span className="underline ">
                redcross@student.lautech.edu.ng
              </span>
            </p>
            <p>Facebook Page: @redcrosslautech</p>
          </div>
          <div className="py-6 px-16">
            <p className="text-sm font-semibold">
              The Director Of Works,
              <br />
              Ladoke Akintola University of Technology,
              <br />
              Ogbomoso, Oyo State.
            </p>
            <br />
            <p className="text-sm font-semibold flex flex-col italic">
              <span className="italic">Through: The Dean Student Affairs,</span>
              <span>Ladoke Akintola University of Technology,</span>
              <span>Ogbomoso, Oyo State.</span>
            </p>
            <br />
            <p>Dear Sir,</p>
            <p className="text-lg underline underline-offset-4 text-center font-bold tracking-wider">
              LETTER OF REQUEST
            </p>
            <p className="mt-3 text-justify">
              I hope this letter finds you in good health and high spirits. On
              behalf of the Nigerian Red Cross Society, LAUTECH Detachment, I am
              writing to formally request for your permission to draft
              electricity from the high intension pole closest to the Nigerian
              Red Cross Society, LAUTECH detachment working base.
              <br />
              <br />
              The base has not been convenient for accommodating her members and
              also to carry out academics.
              <br />
              <br />
              We sincerely and humbly request that our request is looked into
              and approved as soon as possible.
              <br />
              <br />
              Thank you, for always!
            </p>
            <div className="mt-12 pt-20 text-center flex items-center justify-evenly">
              <div className="border-t pt-2 border-gray-600">
                <p className="font-semibold">Akintayo Godwin</p>
                <p className="text-sm font-medium">Commandant</p>
              </div>
              <div className="border-t pt-2 border-gray-600">
                <p className="font-semibold">Olawale Promise</p>
                <p className="text-sm font-medium">Deputy Commandant</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-red-600 text-sm italic text-center py-1.5 px-3 mt-2 text-white">
          Through humanity to peace
        </div>
        <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-20">
          <div
            className="w-[40rem] h-[40rem] rounded-full bg-cover bg-no-repeat bg-center shadow-2xl"
            style={{
              backgroundImage:
                'url("https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_the_Red_Cross.png")',
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default TestPage;
