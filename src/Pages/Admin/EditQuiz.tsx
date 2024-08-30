import PageMeta from "@/Layouts/PageMeta";
import { fm, quizTo, quizToForm } from "@/System/functions";
import { useQuiz } from "@/System/Module/Hook";
import { QuizDataInterface, QuizQuestionsInterface } from "@/Types/Module";
import moment from "moment";
import { useEffect, useState } from "react";
import LinkAsButton from "@/Components/LinkAsButton";
import QuestionForm from "@/Components/Quiz/QuestionForm";
import RichEditor from "@/Components/RichEditor";
import { useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { queryToUpdateQuiz } from "@/System/Module/Query/Quiz";
import { queryToAddQuestion } from "@/System/Module/Query/QuizQuestion";

const EditQuiz = () => {
  const { id } = useParams();
  const { data: q, isFetched } = useQuiz<QuizDataInterface>(id);
  useEffect(() => {
    if (isFetched && !q?.title) {
      throw new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }
  }, [q]);
  const [questions, setQuestions] = useState<QuizQuestionsInterface[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [deletingQuestion, setDeletingQuestion] = useState<boolean>(false);
  const [savingDataState, setSavingDataState] = useState<boolean>(false);
  const { control, reset, setValue } = useForm({
    mode: "all",
    defaultValues: {},
  });
  // useWatch to subscribe to all form values
  const MightyForm: any = useWatch({
    control,
  });

  // AutoSave Form
  useEffect(() => {
    // to keep saving data on every changes done
    const UpdatingData = () => {
      // function to update records
      const data = {
        questions: quizTo(MightyForm),
      };
      if (MightyForm.procedure && MightyForm.procedure !== "<p> </p>") {
        (data as any).procedure = MightyForm.procedure;
      }
      queryToUpdateQuiz(id || "", data as any).finally(() => {
        setSavingDataState(true);
        setTimeout(() => {
          setSavingDataState(false);
        }, 2 * 1000); //2seconds
      });
    };
    if (MightyForm && !deletingQuestion) {
      UpdatingData();
    }
  }, [MightyForm]);
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (savingDataState) {
        const confirmationMessage =
          "It looks like you have been editing something. If you leave before saving, your changes will be lost.";

        e.preventDefault(); // Standard for most browsers
        e.returnValue = confirmationMessage; // Gecko + IE
        return confirmationMessage; // Gecko + Webkit, Safari, Chrome, etc.
      }
    };

    // Add the beforeunload event listener if data is saving
    if (savingDataState) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      // Remove the event listener if data is not saving
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    // Cleanup to avoid adding the same listener multiple times
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [savingDataState]);
  useEffect(() => {
    if (deletingQuestion) {
      reset(quizToForm(q?.questions));
      setDeletingQuestion(false);
    }
  }, [deletingQuestion]);
  useEffect(() => {
    setQuestions(q?.questions as QuizQuestionsInterface[]);
  }, [q]);
  return (
    <PageMeta title={`${q?.title} - Quiz`}>
      <div className="mt-3">
        {/* Quiz Header */}
        <div className="mb-2 flex flex-col items-stretch justify-between gap-y-4 lg:flex-row">
          <div className="lg:max-w-[70%]">
            <LinkAsButton className="!py-1 !px-4" to={`/admin/q/:${q?.status}`}>
              Back
            </LinkAsButton>
            <h2 className="mt-2 text-4xl font-bold underline underline-offset-2 decoration-dotted">
              {q?.title}
            </h2>
            <p className="text-sm font-medium">{q?.description}</p>
          </div>
          <div className="text-xs text-gray-600 font-medium italic flex flex-row items-start justify-between lg:flex-col lg:items-end">
            <div>
              <div>
                <span>Created On: </span>
                <span>{moment(fm(q?.createdAt)).format("MMMM Do, YYYY")}</span>
              </div>
              <div>
                <span>Last Modified: </span>
                <span>{moment(fm(q?.updatedAt)).fromNow()}</span>
              </div>
            </div>
            {/* AutoSave status */}
            <div>
              <div
                className={`flex items-center gap-1 px-2 py-1.5 ${
                  savingDataState
                    ? "text-gray-400 italic"
                    : "text-gray-800 not-italic"
                }`}
              >
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.383 4.076a6.5 6.5 0 0 0-6.887 3.95A5 5 0 0 0 7 18h3v-4a2 2 0 0 1-1.414-3.414l2-2a2 2 0 0 1 2.828 0l2 2A2 2 0 0 1 14 14v4h4a4 4 0 0 0 .988-7.876 6.5 6.5 0 0 0-5.605-6.048Z" />
                  <path d="M12.707 9.293a1 1 0 0 0-1.414 0l-2 2a1 1 0 1 0 1.414 1.414l.293-.293V19a1 1 0 1 0 2 0v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-2-2Z" />
                </svg>
                {savingDataState ? "..." : ""}
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="flex flex-col items-stretch justify-between gap-x-6 gap-y-2 mt-4 lg:flex-row lg:items-start">
          {/* Questions List */}
          <div className="grow lg:w-[50%]">
            <div className="flex items-center justify-between gap-4 flex-nowrap">
              <div className="grid grid-cols-5 gap-2 w-full">
                {q?.questions?.map((item, index) => {
                  return (
                    <button
                      key={index}
                      datatype={item.toString()}
                      onClick={() => {
                        setActiveQuestion(index);
                      }}
                      className={`${
                        activeQuestion === index
                          ? "bg-purple-600 text-white"
                          : "border border-gray-500 text-gray-800"
                      } font-bold py-1 text-sm text-center rounded-md flex items-center ${
                        !!item.invisible
                          ? "px-3 justify-between"
                          : "justify-center"
                      } gap-1`}
                    >
                      Q{index + 1}{" "}
                      {!!item.invisible && (
                        <svg
                          className="w-4 h-4"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="m4 15.6 3.055-3.056A4.913 4.913 0 0 1 7 12.012a5.006 5.006 0 0 1 5-5c.178.009.356.027.532.054l1.744-1.744A8.973 8.973 0 0 0 12 5.012c-5.388 0-10 5.336-10 7A6.49 6.49 0 0 0 4 15.6Z" />
                          <path d="m14.7 10.726 4.995-5.007A.998.998 0 0 0 18.99 4a1 1 0 0 0-.71.305l-4.995 5.007a2.98 2.98 0 0 0-.588-.21l-.035-.01a2.981 2.981 0 0 0-3.584 3.583c0 .012.008.022.01.033.05.204.12.402.211.59l-4.995 4.983a1 1 0 1 0 1.414 1.414l4.995-4.983c.189.091.386.162.59.211.011 0 .021.007.033.01a2.982 2.982 0 0 0 3.584-3.584c0-.012-.008-.023-.011-.035a3.05 3.05 0 0 0-.21-.588Z" />
                          <path d="m19.821 8.605-2.857 2.857a4.952 4.952 0 0 1-5.514 5.514l-1.785 1.785c.767.166 1.55.25 2.335.251 6.453 0 10-5.258 10-7 0-1.166-1.637-2.874-2.179-3.407Z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className=""
                onClick={() => {
                  queryToAddQuestion(id);
                  setActiveQuestion(questions.length);
                }}
              >
                <span className="hidden md:block font-bold underline underline-offset-4 decoration-dotted lg:whitespace-nowrap">
                  New Question
                </span>
                <svg
                  className="block md:hidden w-10 h-10"
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
                    strokeWidth="2.7"
                    d="M5 12h14m-7 7V5"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              {questions?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`${
                      activeQuestion === index ? "block" : "hidden"
                    }`}
                  >
                    <QuestionForm
                      {...item}
                      data={{
                        index: {
                          value: index,
                          length: questions.length,
                        },
                        setValue,
                        reset: () => {
                          reset(quizToForm(q?.questions));
                        },
                        control,
                        mightyform: (quizTo(MightyForm) as any)[index],
                        onDelete: (data: number) => {
                          setDeletingQuestion(true);
                          setActiveQuestion(data);
                        },
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* Procedures */}
          <div className="grow lg:w-[50%] space-y-2">
            <h3
              className="text-xl font-semibold tracking-wide"
              data-item={q?.procedure}
            >
              Procedures
            </h3>
            {q?.procedure && (
              <RichEditor
                serialize="html"
                name="procedure"
                control={control}
                defaultValue={q?.procedure}
              />
            )}
          </div>
        </div>
      </div>
    </PageMeta>
  );
};

export default EditQuiz;
