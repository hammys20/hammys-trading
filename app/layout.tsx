import "./globals.css";
import AmplifyProvider from "./amplify-provider";
import Header from "@/components/Header";

export const metadata = {
  title: "Hammy’s Trading",
  description: "Premium Pokémon singles & slabs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          <Header />
          {children}
        </AmplifyProvider>
      </body>
    </html>
  );
}

