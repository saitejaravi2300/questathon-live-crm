import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Questathon Account CRM",
  description: "Evidence-led live customer account CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}