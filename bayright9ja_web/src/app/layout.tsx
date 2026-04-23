import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BR9ja Web Portal",
  description:
    "BR9ja landing page for premium bill payments, secure profile access, and mobile-first gameplay.",
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/apple_touch_icon.png",
  },
  openGraph: {
    title: "BR9ja Web Portal",
    description: "Play games in the app. Pay bills and manage your profile everywhere.",
    type: "website",
    siteName: "BR9ja",
  },
  twitter: {
    card: "summary_large_image",
    title: "BR9ja Web Portal",
    description: "Play games in the app. Pay bills and manage your profile everywhere.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
