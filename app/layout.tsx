import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
