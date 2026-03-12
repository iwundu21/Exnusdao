
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SolanaWalletProvider } from '@/components/providers/SolanaWalletProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ProtocolProvider } from '@/hooks/use-protocol-state';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TransactionStatus } from '@/components/layout/TransactionStatus';
import { getProtocolState } from '@/app/lib/actions';

export const metadata: Metadata = {
  title: 'Exnus protocol | Network',
  description: 'Stake EXN tokens with top-tier validators on Solana.',
  icons: {
    icon: [],
    apple: [],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Load global state directly from the local db.json for zero-reset hydration
  const initialState = await getProtocolState();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Absolute favicon suppression using transparent pixel */}
        <link rel="icon" href="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
      </head>
      <body className="font-body antialiased selection:bg-[#00f5ff] selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <SolanaWalletProvider>
            <ProtocolProvider initialState={initialState}>
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
