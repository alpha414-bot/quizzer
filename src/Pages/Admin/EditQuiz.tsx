import Input from "@/Components/Input";
import PageMeta from "@/Layouts/PageMeta";
import { fm } from "@/System/functions";
import { useQuiz } from "@/System/Module/Hook";
import { QuizDataInterface, QuizQuestionsInterface } from "@/Types/Module";
import moment from "moment";
import { useState } from "react";
// Import the Slate components and React plugin.
import LinkAsButton from "@/Components/LinkAsButton";
import RichEditor from "@/Components/RichEditor";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const QuestionComponent: React.FC<QuizQuestionsInterface> = ({
  id,
  question,
  options,
  control,
}) => {
  return (
    <div key={id}>
      <Input
        control={control}
        name={`question_${id}`}
        defaultValue={question}
        // placeholder="Question 1"
      />
      <div className="ml-2 mt-3 space-y-3">
        {options.map((item, index) => (
          <div
            data-option={index + 1}
            key={index}
            className="flex items-center gap-1"
          >
            <button>
              <svg
                className="w-5 h-5 text-red-600"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm5.757-1a1 1 0 1 0 0 2h8.486a1 1 0 1 0 0-2H7.757Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <p className="text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditQuiz = () => {
  const { id } = useParams();
  const { data: q } = useQuiz<QuizDataInterface>(id);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const { control } = useForm();

  return (
    <PageMeta title={`Question`}>
      <div>
        <LinkAsButton className="!py-0 !px-3" to={`/admin/q/:${q?.status}`}>
          Back
        </LinkAsButton>
      </div>
      <div className="mt-3">
        {/* Quiz Header */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold underline underline-offset-2 decoration-dotted">
              {q?.title}
            </h2>
            <p className="text-sm font-medium">{q?.description}</p>
          </div>
          <div className="text-sm text-gray-600 font-medium italic">
            <div>
              <span>Created On: </span>
              <span>{moment(fm(q?.createdAt)).format("MMMM Do, YYYY")}</span>
            </div>
            <div>
              <span>Last Modified: </span>
              <span>{moment(fm(q?.updatedAt)).fromNow()}</span>
            </div>
          </div>
        </div>
        <hr />
        <div className="flex items-start justify-between gap-6 mt-4">
          <div className="grow w-[50%]">
            <div className="flex items-center gap-2">
              {q?.questions.reverse().map((item, index) => {
                return (
                  <button
                    key={index}
                    datatype={item.toString()}
                    onClick={() => {
                      setActiveQuestion(index);
                    }}
                    className={`${
                      activeQuestion === index && "bg-purple-600 text-white"
                    } font-medium px-3 py-0.5 rounded-md`}
                  >
                    Question {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-2">
              {q?.questions.reverse().map((item, index) => {
                return (
                  <div
                    key={index}
                    className={`${
                      activeQuestion === index ? "block" : "hidden"
                    }`}
                  >
                    <QuestionComponent {...item} control={control} />
                  </div>
                );
              })}
            </div>
          </div>
          {/* Procedures */}
          <div className="grow w-[50%]">
            <h3>Procedures</h3>
            <RichEditor />
          </div>
        </div>
      </div>
    </PageMeta>
  );
};

export default EditQuiz;
