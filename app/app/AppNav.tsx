"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function RoutinesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 20V10M6 6V4M12 20v-4M12 12V4M18 20v-8M18 8V4" />
      <circle cx="6" cy="8" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="10" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RegistroIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  );
}

function ComunidadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15 19c.3-2.2 1.8-3.6 3.5-3.9" />
    </svg>
  );
}

function PerfilIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/app", label: "Inicio", icon: HomeIcon },
  { href: "/app/rutinas", label: "Rutinas", icon: RoutinesIcon },
  { href: "/app/registro", label: "Registro", icon: RegistroIcon },
  { href: "/app/comunidad", label: "Comunidad", icon: ComunidadIcon, badge: "IA" },
  { href: "/app/perfil", label: "Perfil", icon: PerfilIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
              active ? "bg-[#14261c] text-[#4ade80]" : "text-[#9099a3] hover:text-[#f1f3f4]"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
            {item.badge && (
              <span className="ml-auto rounded-full bg-[#4ade80] px-2 py-0.5 text-[10px] font-bold text-[#08150d]">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#2a2f37] bg-[#0d0f12]/95 px-2 py-2 backdrop-blur md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-semibold ${
              active ? "text-[#4ade80]" : "text-[#9099a3]"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
            {item.badge && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#4ade80]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
