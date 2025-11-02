import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pravartak-AI",
  description: "Your AI-powered career development platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-tab.png" sizes="any" />
        <title>Pravartak-AI</title>
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <div className="grid-background"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="relative z-10">
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster richColors />

              <footer className="border-t border-border/40 py-8 sm:py-10 md:py-12 px-4 sm:px-8 md:px-16 lg:px-32 bg-background">
                <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
                  <div className="flex flex-col items-start justify-center text-left space-y-3 sm:space-y-4">
                    {/* Logo and Brand */}
                    <div className="flex items-center gap-1">
                      <Image
                        src="/logo-tab.png"
                        alt="Logo"
                        height={30}
                        width={30}
                        className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                      />
                      <Image
                        src="/logo.png"
                        alt="Pravartak"
                        height={64}
                        width={168}
                        className="h-12 w-auto sm:h-14 md:h-16"
                      />
                    </div>

                    {/* Tagline */}
                    <p className="text-sm sm:text-base text-[#eac1f5]">
                      A platform created with{" "}
                      <span className="text-red-500">💗</span> by{" "}
                      <span className="text-[#B74BD2] font-semibold">
                        Quad Squad
                      </span>
                    </p>
                  </div>

                  {/* Copyright */}
                  <div className="flex items-center md:items-end">
                    <p className="text-white text-xs sm:text-sm">
                      &copy; 2025 Pravartak
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
