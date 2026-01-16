import { Text } from "@react-email/components";
import { emailTypography } from "../config/styles";

interface EmailHeadingProps {
  children: React.ReactNode;
}

export function EmailHeading({ children }: EmailHeadingProps) {
  return (
    <Text className="email-heading font-serif" style={emailTypography.heading}>
      {children}
    </Text>
  );
}
