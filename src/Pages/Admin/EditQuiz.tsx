import PageMeta from "@/Layouts/PageMeta";
import { fm, js, quizTo } from "@/System/functions";
import { useQuiz } from "@/System/Module/Hook";
import { QuizDataInterface, QuizQuestionsInterface } from "@/Types/Module";
import moment from "moment";
import { act, useEffect, useState } from "react";
// Import the Slate components and React plugin.
import LinkAsButton from "@/Components/LinkAsButton";
import QuestionForm from "@/Components/QuestionForm";
import RichEditor from "@/Components/RichEditor";
import {
  queryToAddQuizQuestion,
  queryToDeleteQuizQuestion,
  queryToUpdateQuiz,
} from "@/System/Module/Query";
import { useForm, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";

const EditQuiz = () => {
  const { id } = useParams();
  const { data: q } = useQuiz<QuizDataInterface>(id);
  const [questions, setQuestions] = useState<QuizQuestionsInterface[]>([]);
  const [activeQuestion, setActiveQuestion] =
    useState<QuizQuestionsInterface | null>(null);
  const [savingDataState, setSavingDataState] = useState<boolean>(false);
  const { control } = useForm({
    mode: "all",
  });
  const { control: ProcedureControl } = useForm({
    mode: "all",
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
      setSavingDataState(true);
      const data = {
        questions: quizTo(MightyForm),
      };
      console.log("procedure", MightyForm.procedure);
      if (MightyForm.procedure && MightyForm.procedure !== "<p> </p>") {
        (data as any).procedure = MightyForm.procedure;
      }
      queryToUpdateQuiz(id || "", data as any).finally(() => {
        setSavingDataState(false);
      });
    };
    if (MightyForm) {
      UpdatingData();
    }
  }, [MightyForm]);

  useEffect(() => {
    setQuestions(q?.questions as QuizQuestionsInterface[]);
  }, [q]);
  return (
    <PageMeta title={`Question`}>
      <div></div>
      <div className="mt-3">
        {/* Quiz Header */}
        <div>{js(q?.questions, true)}</div>
        <div className="mb-2 flex items-stretch justify-between">
          <div>
            <LinkAsButton className="!py-0 !px-3" to={`/admin/q/:${q?.status}`}>
              Back
            </LinkAsButton>
            <h2 className="mt-2 text-4xl font-bold underline underline-offset-2 decoration-dotted">
              {q?.title}
            </h2>
            <p className="text-sm font-medium">{q?.description}</p>
          </div>
          <div className="text-xs text-gray-600 font-medium italic flex flex-col items-end justify-between">
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
                <span className="text-base">
                  {savingDataState ? "Saving..." : "Saved"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="flex flex-col items-stretch justify-between gap-6 mt-4 lg:flex-row lg:items-start">
          {/* Questions List */}
          <div className="grow lg:w-[50%]">
            <div className="flex items-center justify-between gap-2 flex-nowrap">
              <div className="grid grid-cols-4 gap-2 w-3/4">
                {questions?.map((item, index) => {
                  return (
                    <button
                      key={index}
                      datatype={item.toString()}
                      onClick={() => {
                        setActiveQuestion(item);
                      }}
                      className={`border ${
                        activeQuestion?.id === item.id &&
                        "bg-purple-600 text-white"
                      } font-bold px-2 py-1 text-sm rounded-md flex items-center gap-3 group`}
                    >
                      Q{index + 1}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          queryToDeleteQuizQuestion(id, item.id);
                        }}
                        className="px-1.5 py-0.5 transition-all duration-200 ease-in-out shadow shadow-gray-100 rounded hover:scale-105"
                      >
                        <svg
                          className={`w-5 h-5 text-red-500`}
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="font-bold underline underline-offset-4 decoration-dotted"
                onClick={() => {
                  queryToAddQuizQuestion(id);
                }}
              >
                New Question
              </button>
            </div>
            <div className="mt-2">
              {js(activeQuestion, true)}
              {activeQuestion && (
                <QuestionForm
                  {...activeQuestion}
                  question={activeQuestion.question}
                  answer={activeQuestion.answer}
                  options={activeQuestion.options}
                  id={activeQuestion.id}
                  // index={(index + 1).toString()}
                  control={control}
                />
              )}
              {questions?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`${
                      activeQuestion && activeQuestion.id === item.id
                        ? "block"
                        : "hidden"
                    }`}
                  >
                    <QuestionForm
                      {...item}
                      id={item.id}
                      mightyform={(quizTo(MightyForm) as any)[index]}
                      index={(index + 1).toString()}
                      control={control}
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
                control={ProcedureControl}
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
