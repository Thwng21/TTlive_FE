import type { Metadata } from "next";
import { Spline_Sans, Space_Grotesk, Inter, Manrope } from "next/font/google"; 
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl'; //ngôn ngữ quốc tế
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/src/i18n/routing';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ToastProvider } from '@/context/ToastContext';

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AnonChat - Talk to Strangers Safely",
  description: "No login required. Just real conversations with real people.",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
         <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${splineSans.variable} ${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} font-display antialiased bg-background-light dark:bg-background-dark text-[#1c1c0d] dark:text-[#fcfcf8] transition-colors duration-300 min-h-screen flex flex-col overflow-x-hidden`}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
