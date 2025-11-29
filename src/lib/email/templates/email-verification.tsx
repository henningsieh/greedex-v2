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

interface EmailVerificationProps {
  userName?: string;
  verificationUrl: string;
}

export function EmailVerification({
  userName,
  verificationUrl,
}: EmailVerificationProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-xl rounded-lg bg-white p-8 shadow-lg">
            <Section>
              <Text className="mb-6 font-bold text-2xl text-gray-900">
                Verify Your Email Address
              </Text>
              <Text className="mb-4 text-base text-gray-700">
                {userName ? `Hi ${userName},` : "Hi there,"}
              </Text>
              <Text className="mb-4 text-base text-gray-700">
                Thank you for signing up! Please verify your email address to
                complete your registration and get started.
              </Text>
              <Section className="my-8 text-center">
                <Button
                  href={verificationUrl}
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-base text-white no-underline"
                >
                  Verify Email Address
                </Button>
              </Section>
              <Text className="mb-4 text-gray-600 text-sm">
                If the button doesn't work, copy and paste this link into your
                browser:
              </Text>
              <Text className="mb-4 break-all text-blue-600 text-sm">
                {verificationUrl}
              </Text>
              <Hr className="my-6 border-gray-300" />
              <Text className="text-gray-500 text-sm">
                If you didn't create an account, you can safely ignore this email.
              </Text>
              <Text className="mt-4 text-gray-400 text-xs">
                This verification link will expire in 24 hours.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EmailVerification;
