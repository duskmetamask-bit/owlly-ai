import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import dynamic from "next/dynamic";
import "./globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const ConvexProvider = dynamic(
  () => import("convex/react").then((m) => ({ default: m.ConvexProvider })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "PickleNickAI — Teacher's AI Assistant",
  description: "Cut admin. Boost capability. Become the best teacher possible.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body><ConvexProvider client={convex}>{children}</ConvexProvider></body>
    </html>
    </ClerkProvider>
  );
}
