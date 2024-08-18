import { isUrl } from "@/System/functions";
import _ from "lodash";
import React, { PropsWithChildren, Ref, useMemo } from "react";
import {
  Descendant,
  Editor,
  Range,
  Element as SlateElement,
  Transforms,
} from "slate";
import { useSelected, useSlate } from "slate-react";

export const HOTKEYS: any = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};
const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
interface BaseProps {
  className: string;
  [key: string]: unknown;
}
type LinkElement = { type: "link"; url: string; children: Descendant[] };
const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={`material-symbols-outlined ${className} text-xl align-text-bottom`}
    />
  )
);

const Button = React.forwardRef(
  (
    {
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        active: boolean;
        reversed: boolean;
      } & BaseProps
    >,
    ref: Ref<HTMLSpanElement>
  ) => (
    <span
      {...props}
      ref={ref}
      className={`cursor-pointer ${
        reversed
          ? active
            ? "text-rose-400"
            : "text-purple-800"
          : active
          ? "text-gray-800"
          : "text-gray-400"
      }`}
    />
  )
);

const isBlockActive = (editor: any, format: any, blockType: any = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n: any) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        (n as any)[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: any, format: any) => {
  const marks = Editor.marks(editor) as any;
  return marks ? marks[format] === true : false;
};

const isLinkActive = (editor: any) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as any).type === "link",
  });
  return !!link;
};

const toggleBlock = (editor: any, format: any) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as any).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  //   let newProperties: Partial<SlateElement>;
  let newProperties: any;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const Toolbar = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<HTMLDivElement>
  ) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={`flex flex-row flex-wrap items-center justify-center gap-x-4 gap-y-0 relative py-2 border-b-2 bg-gray-100 rounded-lg border-gray-50 mb-2`}
    />
  )
);

export const toggleMark = (editor: any, format: any) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const unwrapLink = (editor: any) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as any).type === "link",
  });
};

const wrapLink = (editor: any, url: string, text?: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: LinkElement = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

const insertLink = (editor: any, url: any) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

export const withInlines = (editor: Editor | any) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor;

  editor.isInline = (element: any) =>
    ["link", "button", "badge"].includes(element.type) || isInline(element);

  editor.isElementReadOnly = (element: any) =>
    element.type === "badge" || isElementReadOnly(element);

  editor.isSelectable = (element: any) =>
    element.type !== "badge" && isSelectable(element);

  editor.insertText = (text: any) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data: any) => {
    const text = data.getData("text/plain");
    if (text && isUrl(text)) {
      wrapLink(editor, _.trim(text));
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const LinkButton = ({ icon }: { icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event: any) => {
        if (!isLinkActive(editor)) {
          event.preventDefault();
          window.prompt;
          const url = window.prompt("Enter the URL of the link:");
          if (!url) return;
          insertLink(editor, url);
        } else {
          unwrapLink(editor);
        }
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export const MarkButton = ({ format, icon }: { format: any; icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

export const BlockButton = ({ format, icon }: { format: any; icon: any }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event: any) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const LinkComponent = React.forwardRef(
  (
    {
      attributes,
      children,
      element,
      style,
    }: {
      attributes: any;
      children: any;
      element: any;
      style: any;
    },
    ref
  ) => {
    const selected = useSelected();

    const safeUrl = useMemo(() => {
      if (isUrl(element.url)) {
        return element.url;
      }
      return "about:blank";
    }, [element.url]);
    return (
      <a
        ref={ref}
        style={style}
        {...attributes}
        href={safeUrl}
        className={`inline-flex items-center ${selected ? "font-medium" : ""}`}
      >
        <span>{children}</span>
      </a>
    );
  }
);

export const Element = React.forwardRef(
  (
    {
      attributes,
      children,
      element,
    }: PropsWithChildren<
      {
        attributes: any;
        children: React.ReactNode;
        element: any;
      } & BaseProps
    >,
    ref: React.Ref<any>
  ) => {
    const style = { textAlign: element.align };
    switch (element.type) {
      case "link":
        return (
          <LinkComponent
            {...attributes}
            ref={ref}
            children={children}
            element={element}
            style={style}
          />
        );
      case "block-quote":
        return (
          <blockquote ref={ref} style={style} {...attributes}>
            {children}
          </blockquote>
        );
      case "bulleted-list":
        return (
          <ul ref={ref} style={style} {...attributes}>
            {children}
          </ul>
        );
      case "heading-one":
        return (
          <h1 ref={ref} style={style} {...attributes}>
            {children}
          </h1>
        );
      case "heading-two":
        return (
          <h2 ref={ref} style={style} {...attributes}>
            {children}
          </h2>
        );
      case "list-item":
        return (
          <li ref={ref} style={style} {...attributes}>
            {children}
          </li>
        );
      case "numbered-list":
        return (
          <ol ref={ref} style={style} {...attributes}>
            {children}
          </ol>
        );
      default:
        return (
          <p ref={ref} style={style} {...attributes}>
            {children}
          </p>
        );
    }
  }
);

export const Leaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes: any;
  children: React.ReactNode;
  leaf: any;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};
