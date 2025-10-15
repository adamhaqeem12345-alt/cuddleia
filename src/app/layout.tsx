import type { Metadata } from "next";
import { Belleza, Alegreya } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Providers } from "@/components/providers";

const fontHeadline = Belleza({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-headline",
});

const fontBody = Alegreya({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});


export const metadata: Metadata = {
  title: "Cuddleia | Cozy Digital Goods with Heart",
  description: "Discover cozy digital wallpapers, and thoughtfully designed Islamic booklets that bring warmth, beauty, and serenity to your day.",
  keywords: "islamic digital products,ipad wallpaper,digital booklets,muslim lifestyle,cuddleia,cozy digital goods,barakah business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-body antialiased overflow-x-hidden", fontHeadline.variable, fontBody.variable)}>
        <Providers>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
