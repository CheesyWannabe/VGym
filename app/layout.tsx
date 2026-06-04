import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VGYM — Aesthetic Physique Tracker",
  description: "Your AI-powered aesthetic physique development command center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
