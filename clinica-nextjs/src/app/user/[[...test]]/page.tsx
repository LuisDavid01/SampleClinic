import { UserProfile } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="bg-background flex items-center justify-center">
      <div className="my-6">
        <UserProfile/>
      </div>
      
    </div>
  );
}
