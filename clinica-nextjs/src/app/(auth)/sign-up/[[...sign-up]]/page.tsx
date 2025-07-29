import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="bg-background mx-auto py-16 flex justify-center items-center">
      <SignUp></SignUp>
    </div>
  );
}
