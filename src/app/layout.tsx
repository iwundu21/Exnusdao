
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SolanaWalletProvider } from '@/components/providers/SolanaWalletProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ProtocolProvider } from '@/hooks/use-protocol-state';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionStatus } from '@/components/layout/TransactionStatus';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Exnus protocol | Network',
  description: 'Stake EXN tokens with top-tier validators on Solana.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22transparent%22/></svg>',
    apple: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22transparent%22/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased selection:bg-[#00f5ff] selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <FirebaseClientProvider>
            <SolanaWalletProvider>
              <ProtocolProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-grow pb-24 lg:pb-32">
                    {children}
                  </main>
                  <TransactionStatus />
                  <Footer />
                </div>
              </ProtocolProvider>
            </SolanaWalletProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
