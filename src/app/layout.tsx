import "./globals.css";
import { Roboto } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  fallback: ["system-ui", "arial"],
});

export const metadata = {
  title: "Panda Realty CRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.className} dark`}
    >
      <body className="flex w-full min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <ClientProviders>{children}</ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
