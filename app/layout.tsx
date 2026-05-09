import type { Metadata } from "next";
import ConvexClientWrapper from "@/components/ConvexClientWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Owlly — Teacher's AI Assistant",
  description: "Cut admin. Boost capability. Teach the future.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ConvexClientWrapper>{children}</ConvexClientWrapper>
      </body>
    </html>
  );
}
