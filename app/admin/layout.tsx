import type { ReactNode } from "react";

export const metadata = {
  title: "Panel — Mia Store",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
