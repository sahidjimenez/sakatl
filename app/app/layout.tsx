import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { SidebarNav, BottomTabs } from "./AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f1f3f4] md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-72 md:shrink-0 md:flex-col md:border-r md:border-[#2a2f37] md:p-5">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#22c55e]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6.5 8.5v7M17.5 8.5v7M3 10.5v3M21 10.5v3M6.5 12h11"
                  stroke="#08150d"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            <span className="text-lg font-extrabold">Sakatl</span>
          </Link>
          <UserButton />
        </div>

        <div className="flex-1">
          <SidebarNav />
        </div>

        <Link
          href="/app/nueva"
          className="rounded-[10px] bg-[#22c55e] px-4 py-3 text-center text-sm font-bold text-[#08150d]"
        >
          + Nueva rutina
        </Link>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">{children}</div>

      <BottomTabs />
    </div>
  );
}
