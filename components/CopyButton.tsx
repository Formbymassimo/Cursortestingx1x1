"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function CopyButton({
  value,
  label = "Copy invite link",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={copy}>
      {copied ? "Copied" : label}
    </Button>
  );
}
