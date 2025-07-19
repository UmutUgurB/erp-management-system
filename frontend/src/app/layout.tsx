import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationContainer, NotificationDebugPanel } from '@/components/Notifications/NotificationContainer';
import "./globals.css";

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
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider settings={{ enableSounds: false, maxNotifications: 6 }}>
            {children}
            <NotificationContainer />
            <NotificationDebugPanel />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
