type YooptaTextNode = { text?: string; children?: YooptaTextNode[] };

export function extractPlainText(nodes: YooptaTextNode[] = []): string {
  return nodes
    .map((node) => {
      if (typeof node.text === "string") {
        return node.text;
      }
      if (Array.isArray(node.children)) {
        return extractPlainText(node.children);
      }
      return "";
    })
    .join("");
}
