import type { Metadata } from "next";
import { Poppins, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import SiteBackdrop from "@/components/SiteBackdrop";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mia Store — Todo lo que te gusta en un solo lugar",
  description:
    "Tienda 100% en línea: ropa, accesorios, calzado, belleza y más. Entregas en puntos de encuentro en Chimaltenango y envíos a todo el país.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteBackdrop />
        <Navbar />
        <main className="relative flex-1">
          <div aria-hidden="true" className="site-doodles" />
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
