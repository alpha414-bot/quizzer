import Input from "@/Components/Input";
import { QuizQuestionsInterface } from "@/Types/Module";
import { useState } from "react";
// Import the Slate components and React plugin.
import _ from "lodash";
import { Control } from "react-hook-form";
import OptionEditable from "./Quiz/OptionsEditable";
import SelectDropdown from "./SelectDropdown";

interface QuestionFormInterface extends QuizQuestionsInterface {
  index?: string;
  mightyform?: QuizQuestionsInterface;
  control: Control;
}

const QuestionForm: React.FC<QuestionFormInterface> = ({
  id,
  index,
  question,
  score,
  answer,
  mightyform,
  options,
  control,
}) => {
  
  const [optionsList, setOptionsList] = useState(options);
  // add new option to options list
  const addNewOption = (value: any) => {
    const prevOptions = optionsList;
    const newOptions: any = [...prevOptions, ...[value]];
    setOptionsList(newOptions);
  };
  const removeOption = (key: any) => {
    const leftOptions = _.filter(
      optionsList,
      (item) => item.key?.toLowerCase() != key.toLowerCase()
    );
    setOptionsList(leftOptions);
  };
  return (
    <div>
      <Input
        hidden
        control={control}
        name={`question_${index}/id`}
        value={id}
        defaultValue={id}
        className="hidden"
      />
      <Input
        control={control}
        name={`question_${index}`}
        defaultValue={question}
        autoFocus
      />
      <div className="grid grid-cols-2 items-start gap-2 py-5">
        <div className="pl-2 pr-3 pt-2 space-y-4 max-h-64 fine-scroll">
          {optionsList.map((item, i) => (
            <OptionEditable
              name={`question_${index}/option_${i + 1}`}
              key={i}
              option={item}
              removeOption={removeOption}
              control={control}
            />
          ))}
          {Array(1)
            .fill(0)
            .map((item, index) => {
              const uniqueOptionKey = index + 1 + optionsList.length;
              return (
                <button
                  data-item={item}
                  data-option={uniqueOptionKey}
                  key={index}
                  className="flex items-center gap-1 opacity-75 cursor-pointer font-medium"
                  onClick={() =>
                    addNewOption({
                      key: `option-${uniqueOptionKey}`,
                      value: `Option ${uniqueOptionKey}`,
                    })
                  }
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
              );
            })}
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-base font-bold">Score</p>
              <p className="text-[0.6rem] italic">
                Enter the score for this question
              </p>
            </div>
            <div>
              <Input
                name={`question_${index}/score`}
                type="tel"
                control={control}
                className="inline-block !text-lg max-w-12 min-h-5 text-center !pl-0 !pr-0 !py-1.5"
                defaultValue={score.toString()}
              />
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div>
              <p className="text-base font-bold">Answer</p>
              <p className="text-[0.6rem] italic">
                Choose the right option for this question
              </p>
            </div>
            <div>
              <SelectDropdown
                defaultOptionKey={answer?.key}
                name={`question_${index}/answer`}
                control={control}
                options={mightyform?.options || optionsList}
                rules={{ required: "Answer is required" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
