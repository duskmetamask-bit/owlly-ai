"use client";

import ConvexClientWrapper from "@/components/ConvexClientWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientWrapper>{children}</ConvexClientWrapper>
  );
}