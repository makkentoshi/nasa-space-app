import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";
import { ForecastProvider } from "./contexts/ForecastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "resQ - Forecast Mode | NASA Challenge",
  description: "Will It Rain On My Parade? Climate forecast application using NASA data (GPM IMERG, MERRA-2) with AI-powered recommendations.",
  keywords: ["NASA", "weather", "climate", "forecast", "precipitation", "AI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ForecastProvider>
          {children}
        </ForecastProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
