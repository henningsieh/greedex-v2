import { cn } from "@/lib/utils";

type BlockquoteProps = {
  children?: React.ReactNode;
  className?: string;
};

const Blockquote = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border-l-8 border-l-accent bg-accent py-5 pr-5 pl-16 font-sans text-lg text-primary-foreground italic leading-relaxed before:absolute before:top-3 before:left-3 before:font-serif before:text-6xl before:text-secondary before:content-['“']",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BlockquoteAuthor = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "mt-5 pr-4 text-right font-bold text-accent not-italic",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { Blockquote, BlockquoteAuthor };
