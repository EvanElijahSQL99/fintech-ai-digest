import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTech × AI Digest",
  description: "Weekly AI strategy announcements across FinTech and financial institutions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
