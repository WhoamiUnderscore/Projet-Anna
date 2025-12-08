import type { Metadata } from "next";

import { ErrorHandlerProvider } from "@/hook/useErrorHandler"

import "@/styles/animations.css"
import "@/styles/style.css"

export const metadata: Metadata = {
  title: "Anna Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="fr">
      {/* <body className={`${geistSans.variable} ${geistMono.variable}`}> */}
      {/*   {children} */}
      {/* </body> */}

      <body>
        <ErrorHandlerProvider>
        {children}
        </ErrorHandlerProvider>
      </body>
    </html>
  );
}
