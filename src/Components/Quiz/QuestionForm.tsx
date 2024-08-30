import Input from "@/Components/Input";
import { QuizQuestionsInterface } from "@/Types/Module";
import { useEffect, useState } from "react";
// Import the Slate components and React plugin.
import { generateRandomString } from "@/System/functions";
import {
  queryToDeleteQuestion,
  queryToUpdateQuestion,
} from "@/System/Module/Query/QuizQuestion";
import _ from "lodash";
import { Control } from "react-hook-form";
import { useParams } from "react-router-dom";
import OptionEditable from "./OptionsEditable";

interface QuestionFormInterface extends QuizQuestionsInterface {
  data: {
    index?: { value: number; length: number };
    setValue?: any;
    reset?: any;
    control: Control;
    mightyform?: QuizQuestionsInterface;
    onDelete?: any;
  };
}

const QuestionForm: React.FC<QuestionFormInterface> = ({
  id,
  question,
  score,
  invisible,
  answer,
  options,
  data,
}) => {
  const { id: quiz_id } = useParams();
  const [optionsList, setOptionsList] = useState(options);
  // add new option to options list
  const addNewOption = () => {
    // Get all existing option keys
    const existingKeys = optionsList.map((option) => option.key);
    // Find the next available key that does not exist in the current list
    let nextKeyNumber = optionsList.length + 1;
    while (existingKeys.includes(`option-${nextKeyNumber}`)) {
      nextKeyNumber++;
    }
    const newOption = {
      // key: `option-${nextKeyNumber}`,
      key: generateRandomString(32),
      value: `Option ${nextKeyNumber}`,
    };

    const NewOption = [...optionsList, newOption];
    queryToUpdateQuestion(quiz_id, id, {
      options: NewOption,
    }).then(() => {
      setOptionsList(NewOption);
      // reset();
    });
  };

  const updateOption = (key: string, value: string) => {
    const NewOption = optionsList.map((item) => {
      if (item?.key?.toLowerCase() == key?.toLowerCase()) {
        item.value = value;
      }
      return item;
    });
    queryToUpdateQuestion(quiz_id, id, {
      options: NewOption,
    }).then(() => {
      // setOptionsList(NewOption);
    });
  };

  const removeOption = (key: string) => {
    const NewOption = optionsList.filter(
      (item) => item.key.toLowerCase() !== key.toLowerCase()
    );
    queryToUpdateQuestion(quiz_id, id, {
      options: NewOption,
    }).then(() => {
      setOptionsList(NewOption);
      if (key?.toLowerCase() == answer?.toLowerCase()) {
        setAnswer(""); // reset answer, if the removed option key and answer are the same
      }
    });
  };

  const setAnswer = (answer: string) => {
    data.setValue(`question_${id}/answer`, answer);
  };
  useEffect(() => {
    setOptionsList(options);
  }, [options, answer, score, question]);

  return (
    <div>
      <Input
        key={`question_${id}/id`}
        control={data?.control}
        name={`question_${id}/id`}
        value={id}
        defaultValue={id}
        className="hidden"
      />
      <Input
        key={`question_${id}_${id}`}
        control={data.control}
        name={`question_${id}`}
        defaultValue={question}
      />
      <div className="grid grid-cols-1 items-start gap-2 pt-2 pb-5 md:grid-cols-[2fr,1fr]">
        <div className="pt-2 space-y-4 max-h-64 fine-scroll md:pl-2 md:pr-3 ">
          {_(optionsList)
            .groupBy("value") // Group by the 'key' property
            .filter((group) => group.length > 1) // Find groups with more than one item
            .value()[0]?.length >= 1 && (
            <p className="text-xs text-red-400 tracking-tight ">
              Duplicate values would be retarded to one.
            </p>
          )}
          {optionsList?.map((item, i) => (
            <OptionEditable
              key={i}
              name={`question_${id}/option_${item.key}`}
              option={item}
              updateOption={updateOption}
              removeOption={removeOption}
              control={data.control}
              answer={{ setAnswer, value: answer }}
            />
          ))}
          <button
            className="flex items-center gap-1 opacity-75 cursor-pointer font-medium"
            onClick={() => addNewOption()}
          >
            <svg
              className="w-7 h-7 text-green-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-base tracking-tight underline underline-offset-2 decoration-dotted">
              New Option
            </p>
          </button>
        </div>
        <div className="flex flex-col justify-between items-end space-y-6 h-full">
          {/* Score & Answer */}
          <div className="space-y-4">
            <div>
              <p className="text-[0.6rem] italic">
                Enter the score for this question.
              </p>
              <div className="flex items-start justify-between gap-5">
                <p className="text-base font-bold">Score</p>
                <div>
                  <Input
                    name={`question_${id}/score`}
                    type="tel"
                    control={data.control}
                    className="inline-block max-w-10  text-base text-center !pl-0 !pr-0 !py-1.5 !rounded-md"
                    defaultValue={score?.toString()}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-[0.6rem] italic">
                Set the question visibility when displaying the question in the
                quiz. By default, all questions are visible.
              </p>
              <div className="flex items-start justify-between gap-5">
                <p className="text-base font-bold">Hidden</p>
                <div>
                  <Input
                    name={`question_${id}/invisible`}
                    type="checkbox"
                    control={data.control}
                    className="inline-block max-w-10 text-base text-center !pl-0 !pr-0 !py-1.5 !rounded-md"
                    defaultChecked={!!invisible}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Delete Question */}
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                queryToDeleteQuestion(quiz_id, id).then(() => {
                  let new_index = data.index?.value || 1;
                  const new_length = (data.index?.length || 1) - 1;
                  if (new_index === new_length) {
                    new_index = new_length - 1;
                  }
                  data.onDelete(new_index);
                });
              }}
              className="px-2 py-1.5 transition-all duration-200 ease-in-out text-red-600 shadow shadow-gray-100 rounded hover:scale-105"
            >
              <svg
                className={`w-6 h-6`}
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
