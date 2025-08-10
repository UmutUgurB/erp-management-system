import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from 'next-themes';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationContainer, NotificationDebugPanel } from '@/components/Notifications/NotificationContainer';
import "./globals.css";
import RouteProgress from '@/components/UI/RouteProgress';
import ScrollToTop from '@/components/UI/ScrollToTop';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP Sistemi",
  description: "Modern ERP Yönetim Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CustomThemeProvider>
            <AuthProvider>
              <NotificationProvider settings={{ enableSounds: false, maxNotifications: 6 }}>
              <RouteProgress />
              {children}
                <NotificationContainer />
                <NotificationDebugPanel />
              <ScrollToTop />
              </NotificationProvider>
            </AuthProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
