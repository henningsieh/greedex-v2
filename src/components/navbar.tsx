import { UserSession } from "@/components/user-session";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo or brand name would go here */}
          </div>
          <UserSession />
        </div>
      </div>
    </nav>
  );
}
