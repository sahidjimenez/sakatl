import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#0d0f12] px-6 py-16">
      <SignUp fallbackRedirectUrl="/app" />
    </div>
  );
}
