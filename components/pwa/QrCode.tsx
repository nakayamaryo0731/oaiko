"use client";

import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false },
);

type QrCodeProps = {
  value: string;
  size?: number;
};

export function QrCode({ value, size = 160 }: QrCodeProps) {
  return (
    <div
      className="rounded-md bg-white p-3 shadow-sm ring-1 ring-slate-200"
      style={{ width: size + 24, height: size + 24 }}
    >
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}
