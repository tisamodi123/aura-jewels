import "./globals.css";
import { Toaster } from "sonner";
import { DM_Sans } from "next/font/google";
import DisableNumberWheel from "@/components/DisableNumberWheel";

const poppins = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap", // Optional: CSS variable name
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`} suppressHydrationWarning>
        <DisableNumberWheel />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
