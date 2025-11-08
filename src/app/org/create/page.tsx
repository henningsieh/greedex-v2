import CreateOrganizationForm from "@/components/features/organizations/create-organization-form";

export default function CreateOrganizationPage() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="space-y-6">
        <CreateOrganizationForm />
      </div>
    </div>
  );
}
