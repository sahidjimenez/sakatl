export function LoadingSkeleton() {
  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[900px] flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[#1c2026]" />
        <div className="h-32 w-full animate-pulse rounded-2xl bg-[#1c2026]" />
        <div className="h-32 w-full animate-pulse rounded-2xl bg-[#1c2026]" />
      </div>
    </div>
  );
}
