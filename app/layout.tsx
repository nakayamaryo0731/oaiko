import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pairbo.app"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "WlzApyG_0w14M7XXCTaIrsShDFdFqfuK72W_w15m8kY",
  },
  title:
    "Pairbo - 同棲カップル・夫婦向け共有家計簿｜アプリ不要で割り勘・傾斜折半",
  description:
    "同棲カップル・夫婦の生活費分担を簡単に。割り勘・傾斜折半・収入比に応じた負担配分に対応。アプリインストール不要、ブラウザだけで使える共有家計簿。URLを送るだけで今日から始められます。",
  openGraph: {
    title: "Pairbo - 同棲カップル・夫婦向け共有家計簿",
    description:
      "生活費の割り勘・傾斜折半がブラウザだけで完結。アプリ不要、URLを送るだけですぐ始められる共有家計簿。",
    url: "https://pairbo.app",
    siteName: "Pairbo",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pairbo - 2人のための支出管理",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pairbo - 同棲カップル・夫婦向け共有家計簿",
    description:
      "生活費の割り勘・傾斜折半がブラウザだけで完結。アプリ不要の共有家計簿。",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pairbo",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pairbo",
              url: "https://pairbo.app",
              description:
                "同棲カップル・夫婦の生活費分担を簡単に。割り勘・傾斜折半・収入比に応じた負担配分に対応。アプリインストール不要、ブラウザだけで使える共有家計簿。",
              applicationCategory: "FinanceApplication",
              operatingSystem: "All",
              browserRequirements: "Requires JavaScript",
              inLanguage: "ja",
              image: "https://pairbo.app/og-image.png",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "JPY",
                  name: "Free",
                },
                {
                  "@type": "Offer",
                  price: "100",
                  priceCurrency: "JPY",
                  name: "Premium（月払い）",
                },
                {
                  "@type": "Offer",
                  price: "1000",
                  priceCurrency: "JPY",
                  name: "Premium（年払い）",
                },
              ],
              provider: {
                "@type": "Organization",
                name: "Pairbo",
                url: "https://pairbo.app",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "本当に無料で使えますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "基本機能はすべて無料です。傾斜折半や詳細分析が使えるPremiumプランもあります。",
                  },
                },
                {
                  "@type": "Question",
                  name: "アプリのインストールは必要ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "不要です。ブラウザからアクセスするだけで使えます。スマホのホーム画面に追加すれば、アプリのように使うこともできます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "同棲の生活費はどうやって分担できますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "均等割り・割合指定（傾斜折半）・金額指定・全額負担の4つの方法から選べます。収入差があるカップルでも、ふたりに合った負担バランスを設定できます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "共有口座やクレジットカードは必要ですか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "いいえ。お財布は別々のままでOKです。それぞれが支払った支出を記録し、月末に差額を精算する仕組みです。",
                  },
                },
                {
                  "@type": "Question",
                  name: "パートナーにどうやって共有しますか？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "招待URLを送るだけです。相手はアプリのインストールもアカウント作成も不要で、ブラウザからすぐに参加できます。",
                  },
                },
                {
                  "@type": "Question",
                  name: "データのセキュリティは？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "データは暗号化して保存しています。クレジットカード情報はStripe社が安全に管理します。",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <ConvexClientProvider>
          <div className="pb-14">{children}</div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
