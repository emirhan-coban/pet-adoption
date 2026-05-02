import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahiplendir — Yeni Can Dostunu Bul",
  description:
    "Türkiye'nin hayvan sahiplendirme platformu. Sahiplendir üzerinden ilan aç, başvur, can dostunu bul.",
  metadataBase: new URL('https://sahiplendir.tr'),
  openGraph: {
    title: 'Sahiplendir — Yeni Can Dostunu Bul',
    description: 'Türkiye\'nin hayvan sahiplendirme platformu.',
    url: 'https://sahiplendir.tr',
    siteName: 'Sahiplendir',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
