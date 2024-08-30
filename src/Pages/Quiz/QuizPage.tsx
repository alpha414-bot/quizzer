import Congrats from "@/assets/lottie/congrats.json";
import Animate from "@/Components/Animate";
import Button from "@/Components/Button";
import Img from "@/Components/Img";
import InlineText from "@/Components/InlineText";
import Input from "@/Components/Input";
import Modal from "@/Components/Modal";
import SelectDropdown from "@/Components/SelectDropdown";
import App from "@/Layouts/App";
import PageMeta from "@/Layouts/PageMeta";
import { EmailPattern, sendMail } from "@/System/functions";
import { useApp, useQuiz } from "@/System/Module/Hook";
import {
  queryToAddResult,
  queryToGetResult,
} from "@/System/Module/Query/QuizResult";
import { notify } from "@/System/notify";
import {
  QuizDataInterface,
  QuizDataResult,
  QuizQuestionsInterface,
} from "@/Types/Module";
import ApexCharts from "apexcharts";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import _ from "lodash";
import Lottie from "lottie-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const QuizPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: quiz,
    isLoading,
    isFetched,
  } = useQuiz<QuizDataInterface>(id, "form");
  const { data: app } = useApp();
  useEffect(() => {
    if (isFetched && !quiz?.title) {
      throw new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }
  }, [quiz]);
  const { control, handleSubmit, setValue, watch, trigger } = useForm({
    mode: "all",
  });
  const [form, setForm] = useState<
    "details" | "procedure" | "quiz" | "appreciation" | "result"
  >("details");
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [percentQuizDone, setPercentQuizDone] = useState<number>(0);
  const [resultState, setResultState] = useState<QuizDataResult | null>(null);
  const [quizTimeout, setQuizTimeout] = useState<number>(0);
  const [isQuizRunning, setIsQuizRunning] = useState<boolean>(false);
  const [showHeaderState, setShowHeaderState] = useState<boolean>(true);
  const [quizTaken, setQuizTaken] = useState<boolean>(false);
  // handle form submission on every entry....
  const QuizFormSubmit = (data: any) => {
    try {
      if (form === "details") {
        queryToGetResult<QuizDataResult[]>().then((d) => {
          const result = _.filter(
            d,
            (res) => res.email?.toLowerCase() === data.email.toLowerCase()
          );
          if (result.length > 0) {
            setQuizTaken(true);
          } else {
            setForm("procedure");
          }
        });
      } else if (form === "procedure") {
        setForm("quiz");
        setQuizTimeout(0);
        setIsQuizRunning(true);
        setShowHeaderState(false);
      } else if (form === "quiz") {
        if (questionIndex + 1 !== quiz?.questions?.length) {
          setQuestionIndex(questionIndex + 1);
        } else {
          // thank you message
          setIsQuizRunning(false);
          const RightAnswer = [];
          const WrongAnswer = [];
          for (let key in data) {
            if (key.startsWith("question_") && !key.includes("/")) {
              const QuestionID = key.split("_")[1];
              const QuestionObj = _.find(
                quiz?.questions,
                (item) => item.id == QuestionID
              );
              const QuestionAnswer = data[key];
              if (QuestionAnswer == QuestionObj?.answer) {
                RightAnswer.push({
                  question: QuestionObj,
                  answered: QuestionAnswer,
                  score: QuestionObj?.score,
                });
              } else {
                WrongAnswer.push({
                  question: QuestionObj,
                  answered: QuestionAnswer,
                  score: QuestionObj?.score,
                });
              }
              delete data[key];
            }
          }
          const right_score = _.sumBy(RightAnswer, "score");
          const wrong_score = _.sumBy(WrongAnswer, "score");
          const total_score = right_score + wrong_score;
          const percent = (right_score / total_score) * 100;
          const passed = !!(percent / 100 >= 0.8);
          const result = {
            ...data,
            ...{
              passed,
              right_answer: RightAnswer,
              wrong_answer: WrongAnswer,
              quiz_id: id,
              right_score,
              wrong_score,
              total_score,
              percent: percent.toFixed(2),
            },
          } as QuizDataResult;
          setResultState(result);
          // store result into firebase firestore....
          queryToAddResult(result).then(() => {
            if (passed) {
              // mail the user certificate of passing to him
              sendMail({
                app_name: `${app?.name}`,
                to: `${result.email}`,
                subject: `${app?.name} Details & Certificate`,
                message: `<p>Hello <strong>${result?.first_name} .${
                  result.last_name && result.last_name[0]
                }.</strong>,</p> <p>Below is the credentials to your account and the attached document is a certificate of participation for <strong>quiz_name</strong>.</p> <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic;"><code>Credentials...</code></p><em><strong>Note:</strong>&nbsp;To find other certificate(s), please login to your account and check the certificate(s) category.</em> <p>Best Regards,<br/>${
                  app?.name
                } Team</p>`,
              }).then(() => {});
            }
            if (false) {
              let QuizId = id as string;
              let Quiz = localStorage.getItem("quiz") || JSON.stringify([]);
              let DoneQuiz = JSON.parse(Quiz) as string[];
              if (!DoneQuiz.includes(QuizId)) {
                // if quiz id is not in it
                DoneQuiz.push(QuizId); // push it in
                localStorage.setItem("quiz", JSON.stringify(DoneQuiz)); // then store it again
              }
            }
            setForm("appreciation");
          });
        }
      } else if (form === "appreciation") {
        setShowHeaderState(true);
        setForm("result");
      }
    } catch (error) {
      notify.error({ text: "There was an issue while submitting form" }, error);
    }
  };

  // download procedure as pdf
  const GeneratePDF = () => {
    const element = document.getElementById("procedure");
    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height * 2],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${quiz?.title} Procedure.pdf`);
        // pdf.output('datauri');
      });
    }
  };

  // show progress of the questions that has been answered
  useEffect(() => {
    setPercentQuizDone(
      (_.filter(quiz?.questions, (item) => {
        return !!watch()[`question_${item.id}`];
      }).length /
        (quiz?.questions?.length || 0)) *
        100
    );
  }, [watch(), quiz?.questions]);

  // keep interval running when quiz is still running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isQuizRunning) {
      interval = setInterval(() => {
        setQuizTimeout((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isQuizRunning && interval) {
      clearInterval(interval);
    }

    // Clean up the interval when component unmounts or when isRunning changes
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQuizRunning]);

  // show result on dotnut-chart
  useLayoutEffect(() => {
    const getChartOptions = () => {
      return {
        series: [10, 5],
        colors: ["#0e9f6e", "#fecdd3"],
        chart: {
          height: 320,
          width: "100%",
          type: "donut",
        },
        stroke: {
          colors: ["transparent"],
          lineCap: "",
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                  fontFamily: "Inter, sans-serif",
                  offsetY: 20,
                },
                total: {
                  showAlways: true,
                  show: true,
                  label: resultState?.passed ? "Passed" : "Failed",
                  fontFamily: "Inter, sans-serif",
                  formatter: function () {
                    return resultState?.percent && `${resultState?.percent}%`;
                  },
                },
                value: {
                  show: true,
                  fontFamily: "Inter, sans-serif",
                  offsetY: -20,
                  formatter: function (value: any) {
                    return value;
                  },
                },
              },
              size: "80%",
            },
          },
        },
        grid: {
          padding: {
            top: -2,
          },
        },
        labels: ["Correct", "Wrong"],
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: "bottom",
          fontFamily: "Inter, sans-serif",
        },
        xaxis: {
          labels: {
            formatter: function (value: any) {
              return value + "k";
            },
          },
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
        },
      };
    };
    const dotnut = document.getElementById("donut-chart");
    if (dotnut && typeof ApexCharts !== "undefined") {
      dotnut.childNodes.forEach((node) => node.remove());
      const chart = new ApexCharts(
        document.getElementById("donut-chart"),
        getChartOptions()
      );
      chart.render();
      chart.updateSeries([
        resultState?.right_answer?.length || 0,
        resultState?.wrong_answer?.length || 0,
      ]);
    }
  }, [resultState]);

  // storing the done quiz into localStorage
  useEffect(() => {
    let Quiz = localStorage.getItem("quiz") || JSON.stringify([]);
    let DoneQuiz = JSON.parse(Quiz) as string[];
    if (DoneQuiz.includes(id as string)) {
      setQuizTaken(true);
    } else {
      setQuizTaken(false);
    }
  }, [id]);

  return (
    <App no_navbar no_margin>
      <PageMeta title={`${quiz?.title || ""} - Quiz`}>
        <div className="min-h-screen flex items-start md:px-12 overflow-x-hidden seect-none">
          <div className="relative w-full z-50">
            <form
              onSubmit={handleSubmit(QuizFormSubmit)}
              className="pt-4 pb-4 px-4 h-full z-20 space-y-6"
            >
              {/* Page Header */}
              <Animate
                content={
                  <div className="relative mb-12">
                    <div
                      className={`relative flex flex-col space-y-0.5 overflow-hidden rounded-md transition-all delay-75 duration-150 ease-out ${
                        !showHeaderState ? "h-0" : "h-auto px-3 py-6"
                      }`}
                    >
                      <InlineText
                        children={quiz?.title}
                        className="!py-2 !bg-gray-100 !text-gray-800 text-4xl !font-extrabold underline underline-offset-4 decoration-dotted"
                      />
                      <InlineText
                        children={quiz?.description}
                        className="!text-sm !bg-gray-100 !text-gray-800 !rounded !font-medium"
                      />
                      <Img
                        src={quiz?.image?.media.fullPath}
                        type="background"
                        className="absolute inset-0 -z-10 bg-cover bg-no-repeat bg-center bg-purple-100 !rounded-md overflow-hidden"
                        child={
                          <div className="absolute inset-0 z-10 bg-gray-800 bg-opacity-40"></div>
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHeaderState(!showHeaderState)}
                      className="absolute top-full left-1/2 bg-gray-300 px-2 py-0 rounded-b"
                    >
                      {(!showHeaderState && (
                        <svg
                          className="w-5 h-5 text-gray-800"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m8 10 4 4 4-4"
                          />
                        </svg>
                      )) || (
                        <svg
                          className="w-5 h-5 text-gray-800"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m16 14-4-4-4 4"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                }
                skeletons={[{ className: "!w-full !h-28" }]}
                loading={isLoading}
              />
              {/* Quiz Forms */}
              {/* Lottie Jubilation */}
              {(form == "appreciation" || form === "result") && (
                <div className="fixed z-50 -top-12 left-0 h-screen w-full grid grid-cols-2 items-stretch pointer-events-none">
                  <Lottie animationData={Congrats} loop={true} />
                  <Lottie animationData={Congrats} loop={true} />
                </div>
              )}
              {(quizTaken && (
                <div className="py-4 px-2 bg-gray-300 rounded-md shadow text-center text-base font-medium">
                  <p>
                    <strong className="underline underline-offset-2 decoration-dotted">
                      {quiz?.title}
                    </strong>{" "}
                    quiz has already been taken by you.
                  </p>
                  <p className="text-sm">
                    The quiz cannot be taken again. Thank you.
                  </p>
                </div>
              )) || (
                <>
                  {/* details */}
                  <div className="relative bg-purple-500">
                    <img src="" />
                  </div>
                  <div className={`${!(form === "details") && "hid"}`}>
                    <div className="bg-zinc-50/60 text-gray-800 py-4 px-4 rounded-md">
                      <Animate
                        content={
                          <>
                            <h2 className="text-2xl font-semibold leading-5">
                              Details
                            </h2>
                            <span className="text-sm">
                              Enter your details to continue with{" "}
                              <strong>{quiz?.title}</strong> Quiz.
                            </span>
                          </>
                        }
                        skeletons={[
                          { className: "!w-32 !h-8" },
                          { className: "!w-3/12 !h-4" },
                        ]}
                      />
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:gap-y-2 md:grid-cols-3">
                          <Animate
                            content={
                              <>
                                <Input
                                  control={control}
                                  name="first_name"
                                  placeholder="First Name"
                                  rules={{ required: "First Name is required" }}
                                />
                                <Input
                                  control={control}
                                  name="last_name"
                                  placeholder="Last Name"
                                  rules={{ required: "Last Name is required" }}
                                />
                                <Input
                                  control={control}
                                  name="email"
                                  placeholder="Email"
                                  rules={{
                                    required: "Email is required",
                                    pattern: {
                                      value: EmailPattern,
                                      message: "Enter a valid mail",
                                    },
                                  }}
                                />
                                <SelectDropdown
                                  name="company_name"
                                  floating={false}
                                  options={[
                                    { key: "apple", value: "Apple" },
                                    { key: "Spek", value: "Spek" },
                                  ]}
                                  control={control}
                                  placeholder="Company Name"
                                  rules={{
                                    required: "Company name is required",
                                  }}
                                />
                                <Input
                                  control={control}
                                  name="company_reg"
                                  floating={false}
                                  placeholder="Company Reg No"
                                  rules={{
                                    required: "Company Reg is required",
                                  }}
                                />
                              </>
                            }
                            fill={5}
                            skeletons={[{ className: "!h-8 !w-full" }]}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            icon={
                              <svg
                                className="w-5 h-5 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="m9 5 7 7-7 7"
                                />
                              </svg>
                            }
                          >
                            Next:{" "}
                            <span className="underline underline-offset-2 decoration-dotted">
                              Procedure
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* procedure */}
                  <div className={`${!(form === "procedure") && "hid"}`}>
                    <div id="procedure" className="mx-4 my-2 py-2">
                      <div
                        className="rich-editor py-4 px-4 bg-zinc-100 rounded-lg"
                        dangerouslySetInnerHTML={{
                          __html: quiz?.procedure || "",
                        }}
                      />
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={GeneratePDF}
                        className="underline underline-offset-2 decoration-dotted"
                      >
                        Download Procedure
                      </button>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button
                        type="button"
                        onClick={() => setForm("details")}
                        iconAlign="left"
                        icon={
                          <svg
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m15 19-7-7 7-7"
                            />
                          </svg>
                        }
                      >
                        Back:{" "}
                        <span className="underline underline-offset-2 decoration-dotted">
                          Details
                        </span>
                      </Button>
                      <Button
                        type="submit"
                        icon={
                          <svg
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m9 5 7 7-7 7"
                            />
                          </svg>
                        }
                      >
                        Next:{" "}
                        <span className="underline underline-offset-2 decoration-dotted">
                          Quiz
                        </span>
                      </Button>
                    </div>
                  </div>
                  {/* Quizes Questions */}
                  <div className={`${!(form === "quiz") && "hid"}`}>
                    {(quiz?.questions &&
                      quiz.questions.length > 0 &&
                      form === "quiz" && (
                        <div className={`space-y-6`}>
                          <div className="flex justify-end">
                            <Modal
                              text="View Procedure"
                              content={
                                <div
                                  className="rich-editor mx-2 py-4 px-4 bg-zinc-100 rounded-lg"
                                  dangerouslySetInnerHTML={{
                                    __html: quiz?.procedure || "",
                                  }}
                                />
                              }
                              id="ViewProcedure"
                            />
                          </div>
                          {/* progress bar */}
                          <div className="cursor-pointer flex items-center gap-1.5 mx-auto md:w-5/12">
                            <span className="text-sm">0%</span>
                            <div className="relative h-3 w-full shadow-sm border rounded-lg overflow-hidden">
                              <div
                                className={`relative rounded-s-lg h-full bg-purple-600 transition-all ease-in-out duration-300 ${
                                  percentQuizDone.toString() == "100" &&
                                  "rounded-e-lg"
                                }`}
                                style={{ width: `${percentQuizDone}%` }}
                              />
                            </div>
                            <span className="text-sm">100%</span>
                          </div>
                          {quiz?.questions.map(
                            ({ question, options, id }, index) => {
                              const name = `question_${id}`;
                              const answerQuestion = (
                                name: string,
                                value: string | null,
                                triggers: boolean = true
                              ) => {
                                setValue(name, value);
                                if (triggers) {
                                  trigger(name, { shouldFocus: true });
                                }
                              };
                              if (questionIndex === index) {
                                return (
                                  <div key={index}>
                                    <h1 className="mt-4 text-base font-medium mb-2">
                                      Question {index + 1}:
                                    </h1>
                                    <span className="text-xl font-bold text-gray-700 tracking-wide">
                                      {question}
                                    </span>
                                    {/* Question Options */}
                                    {!!watch(name) && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          answerQuestion(name, null, false)
                                        }
                                        className="mt-2 mb-4 text-sm flex items-center underline underline-offset-2 decoration-dotted"
                                      >
                                        <svg
                                          className="w-5 h-5 text-gray-800"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18 17.94 6M18 18 6.06 6"
                                          />
                                        </svg>
                                        <span>Clear</span>
                                      </button>
                                    )}
                                    <div className="flex flex-col items-start mt-2 space-y-2">
                                      {options.map((item, index) => {
                                        return (
                                          <div
                                            key={index}
                                            className={`inline-block rounded-lg cursor-pointer px-4 py-2 border ${
                                              watch(name) === item.key
                                                ? "bg-pink-500 text-white font-semibold scale-[1.05]"
                                                : "hover:bg-purple-50 font-medium scale-100 shadow-sm hover:scale-[1.05] hover:shadow-none"
                                            } transition-all ease-in-out duration-100`}
                                            onClick={() =>
                                              answerQuestion(name, item.key)
                                            }
                                          >
                                            {item.value}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <div className="mt-2">
                                      <Input
                                        name={name}
                                        control={control}
                                        className="hidden"
                                        rules={{
                                          required: "Question is required",
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            }
                          )}
                          <div className="mt-5 flex justify-between">
                            {(questionIndex !== 0 && (
                              <Button
                                type="button"
                                onClick={() =>
                                  setQuestionIndex(questionIndex - 1)
                                }
                              >
                                Back: Q{questionIndex}
                              </Button>
                            )) || <p></p>}
                            <Button type="submit">
                              {quiz?.questions?.length === questionIndex + 1
                                ? "Finish"
                                : "Next"}
                            </Button>
                          </div>
                        </div>
                      )) || (
                      <p className="font-bold text-base text-center bg-gray-300 py-4 rounded">
                        No Quiz. Try again later
                      </p>
                    )}
                  </div>
                  {/* Appreciation Message */}
                  <div className={`${!(form === "appreciation") && "hid"}`}>
                    <div className=" p-2 lg:p-8">
                      <div className="text-4xl font-extrabold flex items-center justify-center lg:text-6xl">
                        🥺
                        <span className="bg-clip-text text-transparent pb-3 bg-gradient-to-r from-pink-500 to-purple-700">
                          {resultState?.passed
                            ? "Congratulations!!"
                            : "Try again later!!"}
                        </span>
                      </div>
                      <div className="mt-4 bg-gray-100 px-8 py-5 rounded-lg">
                        <p className="text-lg font-medium">
                          Thanks for taking the quiz! You're one step closer to
                          becoming a master of your craft. We love seeing people
                          like you who are passionate about learning and
                          self-improvement. Your hard work and curiosity are
                          what make our app so special. Keep it up, and don't
                          forget to celebrate your progress along the way! You
                          got this!
                        </p>
                      </div>
                      <div className="mt-5 flex justify-end">
                        <Button type="submit">See Result</Button>
                      </div>
                    </div>
                  </div>
                  {/* Result */}
                  <div className={`${!(form === "result") && "hid"}`}>
                    <div className="flex items-center justify-center">
                      <div className="max-w-sm w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">
                        <div className="flex justify-between mb-3">
                          <div className="flex justify-center items-center">
                            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white pe-1">
                              Result
                            </h5>
                            <svg
                              data-popover-target="chart-info"
                              data-popover-placement="bottom"
                              className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
                            </svg>
                            <div
                              data-popover=""
                              id="chart-info"
                              role="tooltip"
                              className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                            >
                              <div className="p-3 space-y-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  Result - Report
                                </h3>
                                <p>
                                  Result gives a full contextual insight to the
                                  quiz taken, and contains all significant
                                  activity throughout the course.
                                </p>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  Calculation
                                </h3>
                                <p>
                                  The passed mark is {"75%"}. If passed, a
                                  certificate of participation would be
                                  forwarded to your email. Each question in a
                                  quiz might carry different scores and can play
                                  a vital role in your overall score.
                                </p>
                              </div>
                              <div data-popper-arrow="" />
                            </div>
                          </div>
                        </div>
                        {/* Donut Chart */}
                        <div className="py-6" id="donut-chart" />
                        {/* Time report */}
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between">
                            <div className="flex gap-0.5 items-center">
                              <svg
                                className="w-4 h-4 text-purple-700"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              <p className="text-base font-medium tracking-tight">
                                Average time
                              </p>
                            </div>
                            <p className="font-bold text-base">
                              {(
                                quizTimeout /
                                60 /
                                (quiz?.questions.length || 0)
                              ).toFixed(2)}
                              min
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex gap-0.5 items-center">
                              <svg
                                className="w-4 h-4 text-purple-700"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                                  clipRule="evenodd"
                                />
                              </svg>

                              <p className="text-base font-medium tracking-tight">
                                Total time
                              </p>
                            </div>
                            <p className="font-bold text-base">
                              {(quizTimeout / 60).toFixed(2)}min
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {false && (
                      <div className="mt-4 hidden">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Wrong Questions
                        </h4>
                        {resultState?.wrong_answer?.map((item, index) => {
                          const { question, answer, options } =
                            item.question as QuizQuestionsInterface;
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-6"
                            >
                              <p className="text-lg font-bold">{question}</p>
                              <p className="text-base font-semibold">
                                <span className="underline underline-offset-2 decoration-dotted">
                                  {
                                    _.find(
                                      options,
                                      (item) => item.key === answer
                                    )?.value
                                  }
                                </span>
                                ✅
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </PageMeta>
    </App>
  );
};

export default QuizPage;
