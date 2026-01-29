import { cn } from "@/lib/utils";

interface BlockquoteProps {
  children?: React.ReactNode;
  className?: string;
}

const Blockquote = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-l-8 border-secondary/50 border-l-secondary/50 bg-background/50 py-5 pr-5 pl-16 font-sans leading-relaxed text-primary-foreground italic before:absolute before:top-3 before:left-3 before:font-serif before:text-6xl before:text-secondary before:content-['“']",
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
        "mt-5 text-right font-bold text-muted-foreground not-italic",
        className,
      )}
    >
      {children}
    </div>
  );
};

export { Blockquote, BlockquoteAuthor };
