import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "../index.css";

import Header from "@/components/layout/header";
import { PageWrapper } from "@/components/page-wrapper";
import Providers from "@/providers/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "game",
  description: "game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${outfit.className} bg-background antialiased`}
      >
        <Providers>
          <PageWrapper>
            <Header />
            {children}
          </PageWrapper>
        </Providers>
      </body>
    </html>
  );
}
