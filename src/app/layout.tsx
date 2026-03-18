import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FakeWalletProvider } from '@/hooks/use-fake-wallet';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ProtocolProvider } from '@/hooks/use-protocol-state';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionStatus } from '@/components/layout/TransactionStatus';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'Exnus protocol | Network',
  description: 'Stake EXN tokens with top-tier XNodes on Solana.',
  icons: {
    icon: [],
    apple: [],
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
        <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      </head>
      <body className="font-body antialiased selection:bg-[#00f5ff] selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <FakeWalletProvider>
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
            </FakeWalletProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
