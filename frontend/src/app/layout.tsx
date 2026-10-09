import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  title: "Trợ Lý Hoa Hướng Dương & Khu Vườn Cảm Xúc",
  description: "Web app học tập cá nhân hóa & chăm sóc sức khỏe tinh thần học đường",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#FAF8F5] text-[#2C2A29]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
