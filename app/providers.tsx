"use client";

import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientWrapper from "@/components/ConvexClientWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexClientWrapper>{children}</ConvexClientWrapper>
    </ClerkProvider>
  );
}