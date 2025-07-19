import { UserProfile } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <UserProfile></UserProfile>
    </div>
  );
}
