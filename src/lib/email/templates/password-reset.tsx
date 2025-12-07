import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  userName,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-lg bg-white p-8 shadow-lg">
            <Section>
              <Text className="mb-6 font-bold text-2xl text-gray-900">
                Reset Your Password
              </Text>
              <Text className="mb-4 text-base text-gray-700">
                {userName ? `Hi ${userName},` : "Hi there,"}
              </Text>
              <Text className="mb-4 text-base text-gray-700">
                We received a request to reset your password. Click the button
                below to create a new password:
              </Text>
              <Section className="my-8 text-center">
                <Button
                  href={resetUrl}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-base text-white no-underline"
                >
                  Reset Password
                </Button>
              </Section>
              <Text className="mb-4 text-gray-600 text-sm">
                If the button doesn't work, copy and paste this link into your
                browser:
              </Text>
              <Text className="mb-4 break-all text-blue-600 text-sm">
                {resetUrl}
              </Text>
              <Hr className="my-6 border-gray-300" />
              <Text className="text-gray-500 text-sm">
                If you didn't request a password reset, you can safely ignore this
                email. Your password will remain unchanged.
              </Text>
              <Text className="mt-4 text-gray-400 text-xs">
                This link will expire in 24 hours for security reasons.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
