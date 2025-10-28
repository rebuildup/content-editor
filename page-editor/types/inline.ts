export type InlineFormat =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "highlight";

export interface InlineText {
  text: string;
  marks?: InlineFormat[];
}

export interface InlineLink {
  type: "link";
  href: string;
  title?: string;
  children: InlineNode[];
}

export type InlineNode = InlineText | InlineLink;
