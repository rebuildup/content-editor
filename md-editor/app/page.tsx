"use client";

import Accordion from "@yoopta/accordion";
import ActionMenu, { DefaultActionMenuRender } from "@yoopta/action-menu-list";
import Blockquote from "@yoopta/blockquote";
import Callout from "@yoopta/callout";
import Code from "@yoopta/code";
import Divider from "@yoopta/divider";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import Embed from "@yoopta/embed";
import File from "@yoopta/file";
import { HeadingOne, HeadingThree, HeadingTwo } from "@yoopta/headings";
import Image from "@yoopta/image";
import Link from "@yoopta/link";
import LinkTool, { DefaultLinkToolRender } from "@yoopta/link-tool";
import { BulletedList, NumberedList, TodoList } from "@yoopta/lists";
import {
  Bold,
  CodeMark,
  Highlight,
  Italic,
  Strike,
  Underline,
} from "@yoopta/marks";
import Paragraph from "@yoopta/paragraph";
import Table from "@yoopta/table";
import Toolbar, { DefaultToolbarRender } from "@yoopta/toolbar";
import Video from "@yoopta/video";
import { useMemo, useState } from "react";

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight];

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
};

const plugins = [
  Paragraph,
  HeadingOne,
  HeadingTwo,
  HeadingThree,
  Blockquote,
  NumberedList,
  BulletedList,
  TodoList,
  Code,
  Link,
  Image,
  Video,
  File,
  Callout,
  Divider,
  Table,
  Accordion,
  Embed,
];

// デモコンテンツを用意
const INITIAL_VALUE = {
  "demo-block-1": {
    id: "demo-block-1",
    type: "HeadingOne",
    meta: { order: 0, depth: 0 },
    value: [
      {
        id: "demo-text-1",
        type: "heading-one",
        children: [{ text: "Yoopta Editor へようこそ" }],
      },
    ],
  },
  "demo-block-2": {
    id: "demo-block-2",
    type: "Paragraph",
    meta: { order: 1, depth: 0 },
    value: [
      {
        id: "demo-text-2",
        type: "paragraph",
        children: [
          {
            text: "これは Notion 風のリッチテキストエディタです。以下の機能を試してみてください：",
          },
        ],
      },
    ],
  },
  "demo-block-3": {
    id: "demo-block-3",
    type: "BulletedList",
    meta: { order: 2, depth: 0 },
    value: [
      {
        id: "demo-list-1",
        type: "bulleted-list",
        children: [{ text: "テキストを選択してツールバーを表示" }],
      },
      {
        id: "demo-list-2",
        type: "bulleted-list",
        children: [{ text: "/" }],
      },
      {
        id: "demo-list-3",
        type: "bulleted-list",
        children: [{ text: "見出し、リスト、コードブロックなどを追加" }],
      },
    ],
  },
  "demo-block-4": {
    id: "demo-block-4",
    type: "Paragraph",
    meta: { order: 3, depth: 0 },
    value: [
      {
        id: "demo-text-4",
        type: "paragraph",
        children: [{ text: "✏️ 下にテキストを入力して編集を始めましょう！" }],
      },
    ],
  },
};

export default function Home() {
  const editor = useMemo(() => createYooptaEditor(), []);
  const [value, setValue] = useState<YooptaContentValue>(INITIAL_VALUE);

  return (
    <div
      style={{
        maxWidth: "960px",
        width: "100%",
        margin: "0 auto",
        padding: "40px 60px",
        minHeight: "100vh",
      }}
    >
      <YooptaEditor
        editor={editor}
        // @ts-expect-error - Type compatibility issue with Yoopta plugin types
        plugins={plugins}
        tools={TOOLS}
        marks={MARKS}
        placeholder="テキストを入力するか、「/」でコマンドメニューを開く..."
        value={value}
        onChange={(newValue) => setValue(newValue)}
        autoFocus
        style={{
          width: "100%",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}
