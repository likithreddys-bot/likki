import { isValidElement, type ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Lightbulb } from 'lucide-react';

function textOf(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

type P = { children?: ReactNode };

const components = {
  h2: ({ children }: P) => <h2 className="font-display-bold mt-2 text-[30px] leading-tight">{children}</h2>,
  h3: ({ children }: P) => <h3 className="font-display-bold mt-2 text-2xl leading-snug">{children}</h3>,
  p: ({ children }: P) => <p className="text-[18px] leading-[1.65]">{children}</p>,
  ul: ({ children }: P) => <ul className="ml-1 flex list-none flex-col gap-2 text-[18px] leading-[1.6]">{children}</ul>,
  ol: ({ children }: P) => <ol className="ml-6 flex list-decimal flex-col gap-2 pl-1 text-[18px] leading-[1.6] marker:font-bold marker:text-pink-deep">{children}</ol>,
  li: ({ children }: P) => (
    <li className="relative pl-6 [ol_&]:pl-1 [ol_&]:before:hidden before:absolute before:left-0 before:top-[0.7em] before:size-2 before:rounded-full before:bg-pink">
      {children}
    </li>
  ),
  strong: ({ children }: P) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: P) => <em className="italic">{children}</em>,
  a: ({ children, href }: P & { href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-pink-deep underline underline-offset-2">
      {children}
    </a>
  ),
  blockquote: ({ children }: P) => {
    const isTip = /^\s*analyst tip/i.test(textOf(children));
    if (isTip) {
      return (
        <aside className="flex items-start gap-3.5 rounded-[10px] border-2 border-ink bg-pink-soft p-5 [&_p]:text-base [&_p]:leading-[1.55]">
          <Lightbulb size={26} className="mt-0.5 shrink-0 text-pink-deep" aria-hidden />
          <div className="flex flex-col gap-1">{children}</div>
        </aside>
      );
    }
    return (
      <blockquote className="rounded-[10px] border-2 border-ink bg-paper p-5 [&_p]:text-[17px] [&_p]:leading-[1.6]">
        <div className="flex flex-col gap-1">{children}</div>
      </blockquote>
    );
  },
  code: ({ children }: P) => <code className="rounded bg-paper2 px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }: P) => (
    <pre className="overflow-x-auto rounded-[10px] border-2 border-ink bg-ink p-4 font-mono text-sm leading-6 text-paper [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-paper">
      {children}
    </pre>
  ),
  table: ({ children }: P) => (
    <div className="overflow-x-auto rounded-[10px] border-2 border-ink">
      <table className="w-full border-collapse text-left text-base">{children}</table>
    </div>
  ),
  thead: ({ children }: P) => <thead className="bg-paper2">{children}</thead>,
  th: ({ children }: P) => <th className="border-b-2 border-ink px-4 py-2.5 font-bold">{children}</th>,
  td: ({ children }: P) => <td className="border-t border-cream px-4 py-2.5 align-top">{children}</td>,
  hr: () => <hr className="border-t-2 border-ink/20" />,
};

/**
 * Renders session theory. Content is treated as plain Markdown (+ GFM tables), never as MDX/JSX,
 * so text coming from the database can't execute code.
 */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-[18px]">
      <MDXRemote source={source} components={components} options={{ mdxOptions: { format: 'md', remarkPlugins: [remarkGfm] } }} />
    </div>
  );
}
