import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuddleia",
  description: "Where every stitch is a hug",
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
