import Input from "@/Components/Input";
import OptionEditable from "@/Components/Quiz/OptionsEditable";
import { useQuestion } from "@/System/Module/Hook";
import { QuizOptionType, QuizQuestionsInterface } from "@/Types/Module";
import _ from "lodash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

const SubQuestionOutlet = () => {
  const { control } = useForm({ mode: "all" });
  const { id: quiz_id, question_id: id } = useParams();
  const { data, isFetched: QuestionIsFetched } =
    useQuestion<QuizQuestionsInterface>(quiz_id, id);
  const [optionsList, setOptionsList] = useState<QuizOptionType[]>([]);
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
  useEffect(() => {
    if (QuestionIsFetched) {
      setOptionsList(data?.options || []); // set the questions option
    }
  }, [data, QuestionIsFetched]);
  return (
    <div>
      {QuestionIsFetched && (
        <>
          <Input
            hidden
            control={control}
            name={`id`}
            value={id}
            defaultValue={id}
          />
          <Input
            key={`question_${id}`}
            control={control}
            name={`question_${id}`}
            defaultValue={data?.question}
          />
          <div className="grid grid-cols-2 items-start gap-2 py-5">
            <div className="pl-2 pr-3 pt-2 space-y-4 max-h-64 fine-scroll">
              {optionsList?.map((item, i) => (
                <OptionEditable
                  key={`question_${id}/option_${i + 1}`}
                  name={`question_${id}/option_${i + 1}`}
                  option={item}
                  removeOption={removeOption}
                  control={control}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubQuestionOutlet;
