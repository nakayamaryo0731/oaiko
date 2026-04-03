"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

type PayPayButtonProps = {
  amount: number;
};

export function PayPayButton({ amount }: PayPayButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(String(amount));
    setCopied(true);
    trackEvent("paypay_transfer");
    setTimeout(() => setCopied(false), 2000);
    window.location.href = "paypay://";
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      className="border-[#FF0033] text-[#FF0033] hover:bg-[#FF0033]/5"
    >
      {copied ? "コピーしました！" : "PayPayで送金"}
    </Button>
  );
}
