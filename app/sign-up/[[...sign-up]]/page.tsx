import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/app");

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0d0f12] px-6 py-16">
      <SignUp fallbackRedirectUrl="/app" />
    </div>
  );
}
