import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface OrganizationInvitationProps {
  organizationName: string;
  inviterName?: string;
  inviteLink: string;
}

export function OrganizationInvitation({
  organizationName,
  inviterName,
  inviteLink,
}: OrganizationInvitationProps) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#ffffff",
        }}
      >
        <Container
          style={{
            padding: "24px",
          }}
        >
          <Section>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              You were invited
            </Text>
            <Text
              style={{
                marginBottom: 16,
              }}
            >
              {inviterName ? `${inviterName} invited you` : "You were invited"} to
              join the organization "{organizationName}".
            </Text>
            <Button
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                textDecoration: "none",
              }}
              href={inviteLink}
            >
              Accept Invitation
            </Button>

            <Text
              style={{
                marginTop: 18,
                fontSize: 12,
                color: "#666",
              }}
            >
              If you did not expect this invitation, you can safely ignore this
              email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
