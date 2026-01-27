import { WalletWatcher } from "@/components/wallet-watcher";
import { BottomNav } from "@/components/layout/BottomNav";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { OnchainProviders } from "@/components/OnchainProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Social Flow - Create Your Content",
    description: "Create your content with AI",
    icons: {
      icon: "/logo.png",
      apple: "/logo.png",
    },
    other: {
      "base:app_id": "6975dc273a92926b661fd495",
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: "https://dprompt.netlify.app/logo.png",
        button: {
          title: `Launch Your Social Flow`,
          action: {
            type: "launch_miniapp",
            name: "Social Flow",
            url: "https://dprompt.netlify.app",
            splashImageUrl: "https://dprompt.netlify.app/logo.png",
            splashBackgroundColor: "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-100 flex justify-center min-h-screen`}
      >
        <OnchainProviders>
          {/* Mobile View Container */}
          <div className="w-full max-w-md h-[100dvh] bg-background relative flex flex-col shadow-2xl overflow-hidden [transform:translateZ(0)]">
            <style>{`
              @media (min-width: 768px) {
                .md\\:hidden {
                  display: block !important;
                }
              }
            `}</style>

            <WalletWatcher />

            <main className="flex-1 overflow-y-auto scrollbar-hide pb-20">
              {children}
            </main>

            <BottomNav />
          </div>
        </OnchainProviders>
      </body>
    </html>
  );
}
