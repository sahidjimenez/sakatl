import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#0d0f12] px-6 py-16">
      <SignIn fallbackRedirectUrl="/app" />
    </div>
  );
}
