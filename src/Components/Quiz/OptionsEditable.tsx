import Input from "@/Components/Input";
import { QuizOptionType } from "@/Types/Module";
import { Control } from "react-hook-form";

const OptionEditable: React.FC<{
  option: QuizOptionType;
  removeOption: any;
  control: Control;
  name: string;
}> = ({ name, option, removeOption, control }) => {
  return (
    <div data-key={option.key} className="flex items-center gap-1 cursor-text">
      <button
        onClick={() => {
          removeOption(option.key);
        }}
      >
        <svg
          className="w-7 h-7 text-red-600"
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
      <Input
        name={`${name}`}
        // name={`${option.key}`}
        control={control}
        defaultValue={option.value}
      />
    </div>
  );
};

export default OptionEditable;
