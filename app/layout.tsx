import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Terminal",
  description: "A terminal-style AI chat interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}