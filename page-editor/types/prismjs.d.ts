declare module "prismjs" {
  const Prism: {
    languages: Record<string, unknown>;
    highlight: (code: string, grammar: unknown, language: string) => string;
    highlightAllUnder?: (root: ParentNode) => void;
  };
  export default Prism;
}
