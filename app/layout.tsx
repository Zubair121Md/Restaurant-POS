import type { Metadata } from "next";
import { AppProvider } from "@/components/app-provider";
import { COMPANY } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${COMPANY.productName} | ${COMPANY.legalName}`,
  description: `${COMPANY.tagline}. Built and operated by ${COMPANY.legalName}.`
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
