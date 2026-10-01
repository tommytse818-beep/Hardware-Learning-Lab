import React from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/** No raw HTML, model-supplied images, links or trusted TeX commands. */
export function HllTutorMessage({ text }: { text: string }) {
  const markdown = text
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math: string) => `$${math}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math: string) => `\n\n$$\n${math}\n$$\n\n`);
  return <div><Markdown skipHtml remarkPlugins={[remarkMath]}
    rehypePlugins={[[rehypeKatex, { trust: false, strict: "ignore", throwOnError: false, maxExpand: 100, maxSize: 10 }]]}
    components={{ img: ({ alt }) => <span>{alt ? `[Image description: ${alt}]` : "[Image omitted]"}</span>, a: ({ children }) => <span>{children}</span>, h1: ({ children }) => <h3>{children}</h3>, h2: ({ children }) => <h3>{children}</h3> }}>
    {markdown}
  </Markdown></div>;
}
