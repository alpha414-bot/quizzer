import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  className?: string;
  isFocused?: boolean;
  control: Control;
  rules?: RegisterOptions;
  updateOnChange?: any;
}

const Input = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    className = "",
    isFocused = false,
    placeholder,
    control,
    name,
    rules,
    defaultValue,
    updateOnChange = (data: any) => data,
    disabled,
    ...props
  },
  ref: any
) {
  const [focus, setFocus] = useState<boolean>(false);
  const [passwordState, setPasswordState] = useState(props.type);
  const [placeholderTextInput, setPlaceholderTextInput] = useState<
    string | undefined
  >(placeholder);
  const input = !!ref ? ref : useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && input?.current) {
      input?.current.focus();
    }
    if (defaultValue) {
      setFocus(true);
    }
  }, []);

  return (
    <>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue || ""}
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
          const CompleteFocus =
            (!!value || focus || !!input?.current?.value) && placeholder;
          return (
            <>
              <div
                className={`relative ${
                  props.type !== "checkbox" ? "w-full" : ""
                }`}
              >
                <div className="relative">
                  <input
                    ref={input}
                    id={name}
                    disabled={disabled}
                    className={`${
                      FieldValue && placeholder ? "pt-4 pb-1" : "py-2"
                    } ${
                      placeholder ? "focus:pt-4 focus:pb-1" : "focus:py-2"
                    } px-3 pr-10 mb-0.5 ${
                      disabled
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-100 dark:bg-gray-700"
                    } border-none outline-none text-gray-700 dark:text-white text-sm  rounded-lg ring-1 ring-transparent focus:ring-purple-500 ${
                      props.type !== "checkbox" ? "block w-full" : ""
                    } p-2.5 ${className} `}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={
                      placeholderTextInput
                        ? `${placeholderTextInput}${
                            rules?.required ? "(*)" : ""
                          }`
                        : undefined
                    }
                    value={
                      props.type === "file" ? value.value || "" : value || ""
                    }
                    onChange={(e) => {
                      let value: any = e.target.value;
                      if (props.type === "file") {
                        value = {
                          files: e.target.files,
                          value: e.target.value,
                        };
                      } else if (props.type === "checkbox") {
                        value = !!e.target.checked;
                      }
                      return updateOnChange(onChange(value));
                    }}
                    {...props}
                  />
                  {props.type == "password" && (
                    <button
                      type="button"
                      onClick={() => {
                        if (input.current.type == "password") {
                          setPasswordState("text");
                          input.current.type = "text";
                        } else {
                          setPasswordState("password");
                          input.current.type = "password";
                        }
                        input.current?.focus();
                      }}
                      className="absolute top-0 bottom-0 right-3 flex items-center justify-center"
                    >
                      {(passwordState == "password" && (
                        <>
                          <svg
                            className="w-6 h-6 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )) || (
                        <>
                          <svg
                            className="w-6 h-6 text-gray-800"
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
                        </>
                      )}
                    </button>
                  )}
                </div>
                {error && (
                  <span
                    className="block mt-0.5 mb-2.5 text-xs tracking-wider font-medium underline underline-offset-4 decoration-dotted text-red-500"
                    dangerouslySetInnerHTML={{
                      __html:
                        error.message || "Error encountered with the input",
                    }}
                  ></span>
                )}
                {CompleteFocus && (
                  <label
                    htmlFor={name}
                    className={`absolute mb-0 text-gray-600 dark:text-white bg-gray-50/95 pl-4 pr-6 py-0.5 rounded-md origin-left transform scale-75 -top-4 left-1.5 transition-all duration-400 text-lg font-semibold shadow-md shadow-gray-500 ${
                      CompleteFocus ? "opacity-100 -top-4" : "top-8 opacity-0"
                    }`}
                  >
                    {placeholder} {rules?.required ? "(*)" : ""}
                  </label>
                )}
              </div>
            </>
          );
        }}
      />
    </>
  );
});

export default Input;
