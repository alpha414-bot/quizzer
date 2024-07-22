import _ from "lodash";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import OutsideClick from "./OutsideClick";

interface SelectDropdownInterface {
  name: string;
  value?: string;
  placeholder?: string;
  options: DropdownOptionsType[];
  defaultValue?: DropdownOptionsType;
  disableOptionKeys?: string[];
  defaultOptionKey?: string;
  required?: boolean;
  onChange?: any;
  isFocused?: boolean;
  control?: Control;
  rules?: RegisterOptions;
}

const SelectDropdown = forwardRef<HTMLInputElement, SelectDropdownInterface>(
  function Input(
    {
      name,
      value,
      placeholder,
      options,
      disableOptionKeys,
      defaultOptionKey,
      required,
      onChange = () => {},
      isFocused,
      defaultValue,
      control,
      rules,
      ...props
    },
    ref: any
  ) {
    const TextInputRef = !!ref ? ref : useRef<HTMLInputElement>(null);
    const [focus, setFocus] = useState<boolean>(false);
    const [, setPlaceholderTextInput] = useState<string | undefined>(
      placeholder
    );
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownQuery, setDropdownQuery] = useState<string | null>(null);
    const [dropdownFiltering, setDropdowFiltering] = useState(options);

    useEffect(() => {
      if (isFocused && TextInputRef?.current) {
        TextInputRef?.current.focus();
        setShowDropdown(false);
      }
      if (defaultValue) {
        setFocus(true);
      }
    }, []);

    useEffect(() => {
      if (dropdownQuery && dropdownQuery?.length > 0) {
        let filtering = options.filter(
          (elem) =>
            elem.key.toLowerCase().includes(dropdownQuery) ||
            elem.value.toLowerCase().includes(dropdownQuery)
        );
        setDropdowFiltering(filtering);
      } else {
        setDropdowFiltering(options);
      }
    }, [dropdownQuery, options]);

    return (
      <OutsideClick
        outsideClick={() => {
          setShowDropdown(false);
        }}
      >
        <div className="relative w-full">
          <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => {
              const FieldValue = value ? value.toString().trim() : value;
              const handleFocus = () => {
                setFocus(true);
                setPlaceholderTextInput(undefined);
              };
              const handleBlur = () => {
                setPlaceholderTextInput(placeholder);
                if (!FieldValue) {
                  setFocus(false);
                  return onBlur();
                }
              };
              // const CompleteFocus = !!value || !!TextInputRef?.current?.value;
              const CompleteFocus =
                (!!value || focus || !!TextInputRef?.current?.value) &&
                placeholder;
              return (
                <div className="relative">
                  <div className="relative z-20">
                    <div className="relative">
                      <input
                        id={name}
                        ref={TextInputRef}
                        name={name}
                        value={value || ""}
                        className={`${CompleteFocus ? "pt-4 pb-1" : "py-2"} ${
                          CompleteFocus ? "focus:pt-4 focus:pb-1" : "focus:py-2"
                        } px-3 pr-10 mb-0.5 border-none outline-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-sm  rounded-lg ring-1 ring-transparent focus:ring-purple-500 block w-full p-2.5`}
                        placeholder={
                          value?.value
                            ? value?.value
                            : !defaultOptionKey
                            ? `${placeholder || ""} ${
                                rules?.required ? "(*)" : ""
                              }`
                            : _.find(
                                options,
                                (item) => item.key === defaultOptionKey
                              )?.value
                        }
                        onFocus={() => {
                          setShowDropdown(true);
                          handleFocus();
                        }}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          const InputValue = e.target.value;
                          setShowDropdown(true);
                          if (
                            options.some(
                              (item) =>
                                item.value.toLowerCase() ===
                                  InputValue.toLowerCase() ||
                                item.key.toLowerCase() ===
                                  InputValue.toLowerCase()
                            )
                          ) {
                            onChange({
                              key: InputValue.toLowerCase(),
                              value:
                                InputValue.toLowerCase() === "fct"
                                  ? "Federal Capital Territory"
                                  : _.upperFirst(InputValue),
                            });
                            const element = document.getElementById(
                              name
                            ) as HTMLInputElement | null;

                            if (element) {
                              element.value =
                                InputValue.toLowerCase() === "fct"
                                  ? "Federal Capital Territory"
                                  : _.startCase(InputValue);
                            }
                          } else {
                            onChange(null);
                          }

                          setDropdownQuery(InputValue.toLowerCase());
                        }}
                        {...props}
                      />

                      <div
                        className="absolute top-0 bottom-0 right-2 flex items-center justify-center cursor-pointer"
                        onClick={() => {
                          setDropdowFiltering(options);
                          setFocus(true);
                          setShowDropdown(!showDropdown);
                        }}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 8"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                            d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
                          />
                        </svg>
                      </div>
                    </div>
                    {error && !focus && (
                      <span
                        className="block mt-0.5 mb-2.5 text-sm tracking-wider font-medium underline underline-offset-4 decoration-dotted text-red-500"
                        dangerouslySetInnerHTML={{
                          __html:
                            error?.message ||
                            "Error encountered with the input",
                        }}
                      ></span>
                    )}
                    {showDropdown && (
                      <div className="absolute top-full mt-1 border border-gray-100 left-0 z-50 rounded-lg shadow-md bg-gray-100 dark:bg-gray-400 space-y-0 w-full max-h-[14rem] overflow-y-auto select-none">
                        {(dropdownFiltering &&
                          ((dropdownFiltering.length > 0 &&
                            dropdownFiltering.map((item, index) => {
                              const disable =
                                disableOptionKeys &&
                                disableOptionKeys?.includes(item?.key);
                              return (
                                <div
                                  key={index}
                                  className={`flex items-center gap-x-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white hover:text-white hover:bg-gray-700 ${
                                    disable
                                      ? "cursor-not-allowed bg-zinc-200 opacity-70 text-opacity-20"
                                      : "cursor-pointer"
                                  }`}
                                  onClick={() => {
                                    if (!disable) {
                                      if (TextInputRef?.current) {
                                        TextInputRef.current.value =
                                          item.value.toString();
                                      }
                                      onChange(item);
                                      setShowDropdown(false);
                                      setDropdowFiltering(options);
                                    }
                                  }}
                                >
                                  <div className="flex flex-col items-start gap-0.5">
                                    <span className="font-semibold text-sm whitespace-nowrap">
                                      {item?.value}
                                    </span>
                                    {item?.description && (
                                      <span className="block text-xs text-gray-800">
                                        {item.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })) || (
                            <div className="w-full text-center">
                              <span className="text-sm font-bold text-gray-600 text-center">
                                No dropdown with value "
                                <span className="underline underline-offset-2 decoration-dotted">
                                  {dropdownQuery}
                                </span>
                                "
                              </span>
                            </div>
                          ))) || (
                          <div className="w-full text-center">
                            <span className="text-sm font-bold text-gray-600 text-center">
                              No options attached
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {CompleteFocus && (
                    <label
                      htmlFor={name}
                      className={`absolute z-30 mb-0 text-gray-600 dark:text-white bg-gray-100 dark:bg-gray-700 pl-4 pr-6 py-0.5 rounded-md origin-left transform scale-75 -top-4 left-1.5 transition-all duration-400 text-lg font-semibold shadow-md shadow-gray-500 ${
                        CompleteFocus ? "opacity-100 -top-4" : "top-8 opacity-0"
                      }`}
                    >
                      {placeholder} {rules?.required ? "(*)" : ""}
                    </label>
                  )}
                </div>
              );
            }}
          />
        </div>
      </OutsideClick>
    );
  }
);

export default SelectDropdown;
