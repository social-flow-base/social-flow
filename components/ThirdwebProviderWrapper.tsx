"use client";

import { ThirdwebProvider, AutoConnect } from "thirdweb/react";
import { client } from "@/lib/client";

export default function ThirdwebProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
      <AutoConnect client={client} />
      {children}
    </ThirdwebProvider>
  );
}
