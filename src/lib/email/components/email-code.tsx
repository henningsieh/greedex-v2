import { Text } from "@react-email/components";
import { emailTypography } from "../config/styles";

interface EmailCodeProps {
  children: React.ReactNode;
}

export function EmailCode({ children }: EmailCodeProps) {
  return (
    <Text className="email-code" style={emailTypography.code}>
      {children}
    </Text>
  );
}
