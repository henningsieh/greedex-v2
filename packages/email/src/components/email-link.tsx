import type { CSSProperties, ReactNode } from "react";

interface EmailLinkProps {
  href?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export function EmailLink({ href, children, style }: EmailLinkProps) {
  if (href) {
    return (
      <a className="email-link" href={href} style={style}>
        {children}
      </a>
    );
  }
  return (
    <strong className="email-link" style={style}>
      {children}
    </strong>
  );
}
