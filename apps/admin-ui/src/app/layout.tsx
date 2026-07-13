import React from "react";
import "./global.css";
import { Poppins } from "next/font/google";
import Providers from "./provider";

export const metadata = {
  title: "Penderghast - Admin",
  description: "admin",
};

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-screen font-sans antialiased ${poppins.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
