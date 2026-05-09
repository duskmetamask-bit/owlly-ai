"use client";

import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";

let _convex: ConvexReactClient | null = null;

function getConvexClient() {
  if (!_convex) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      // SSR guard — return a placeholder that won't crash the build
      console.warn("NEXT_PUBLIC_CONVEX_URL not set; Convex client unavailable");
      return null;
    }
    _convex = new ConvexReactClient(url);
  }
  return _convex;
}

export default function ConvexClientWrapper({ children }: { children: React.ReactNode }) {
  const client = getConvexClient();
  if (!client) return <>{children}</>;
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
