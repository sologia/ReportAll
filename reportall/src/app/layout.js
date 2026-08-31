import { Manrope, Fira_Code } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata = {
  title: "ReportALL",
  description: "Sistema de gestion de reportes y asignaciones ENACAL",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en">
        <body
          className={`${manrope.variable} ${firaCode.variable} antialiased fondo`}
        >
          {children}
        </body>
      </html>
  );
}
