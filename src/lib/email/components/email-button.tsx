import { Button } from "@react-email/components";
import { emailButton } from "../config/styles";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button className="email-btn" href={href} style={emailButton}>
      {children}
    </Button>
  );
}
