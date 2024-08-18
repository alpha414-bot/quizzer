import { slate_deserialize, slate_serialize } from "@/System/functions";
import isHotkey from "is-hotkey";
import React, { useCallback, useMemo } from "react";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, withReact } from "slate-react";
import {
  BlockButton,
  Element,
  HOTKEYS,
  Leaf,
  LinkButton,
  MarkButton,
  toggleMark,
  Toolbar,
  withInlines,
} from "./Quiz/EditorComponent";

interface RichEditorInterface {
  name: string;
  control: Control;
  rules?: RegisterOptions;
  defaultValue?: any;
  serialize?: "plaintext" | "html" | "json";
}

const RichEditor: React.FC<RichEditorInterface> = ({
  name,
  control,
  rules,
  defaultValue,
  serialize = "json",
}) => {
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withHistory(withInlines(withReact(createEditor()))),
    []
  );
  const initialValue = useMemo(() => defaultValue || "<p>Hllo</p>", []);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={initialValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        return (
          <>
            <Slate
              editor={editor}
              initialValue={slate_deserialize(value)}
              onChange={(value) => {
                const isAstChange = editor.operations.some(
                  (op: any) => "set_selection" !== op.type
                );
                if (isAstChange) {
                  let FinaleValue: any = value;
                  if (serialize == "html") {
                    // serialize to html
                    FinaleValue = slate_serialize(FinaleValue);
                  }
                  onChange(FinaleValue || null);
                }
              }}
            >
              <Toolbar>
                <MarkButton format="bold" icon="format_bold" />
                <MarkButton format="italic" icon="format_italic" />
                <MarkButton format="underline" icon="format_underlined" />
                <MarkButton format="code" icon="code" />
                <LinkButton icon="link" />
                <BlockButton format="heading-one" icon="looks_one" />
                <BlockButton format="heading-two" icon="looks_two" />
                <BlockButton format="block-quote" icon="format_quote" />
                <BlockButton
                  format="numbered-list"
                  icon="format_list_numbered"
                />
                <BlockButton
                  format="bulleted-list"
                  icon="format_list_bulleted"
                />
                <BlockButton format="left" icon="format_align_left" />
                <BlockButton format="center" icon="format_align_center" />
                <BlockButton format="right" icon="format_align_right" />
                <BlockButton format="justify" icon="format_align_justify" />
              </Toolbar>
              <Editable
                onBlur={onBlur}
                style={{ overflowWrap: "anywhere" }}
                className="rich-editor py-2 px-3 pr-10 mb-0.5 bg-gray-100 border-none outline-none text-gray-700 dark:text-white text-sm  rounded-lg ring-1 ring-transparent focus:ring-purple-500 w-full p-2.5 min-h-72"
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Enter some rich text…"
                spellCheck
                autoFocus
                onKeyDown={(event) => {
                  for (const hotkey in HOTKEYS) {
                    if (isHotkey(hotkey, event as any)) {
                      event.preventDefault();
                      const mark = HOTKEYS[hotkey];
                      toggleMark(editor, mark);
                    }
                  }
                }}
              />
            </Slate>
            {error && (
              <span
                className="block mt-0.5 mb-2.5 text-xs tracking-wider font-medium underline underline-offset-4 decoration-dotted text-red-500"
                dangerouslySetInnerHTML={{
                  __html: error.message || "Error encountered with the input",
                }}
              ></span>
            )}
          </>
        );
      }}
    />
  );
};

export default RichEditor;
