
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SolanaWalletProvider } from '@/components/providers/SolanaWalletProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Exnus protocol | Network',
  description: 'Stake EXN tokens with top-tier validators on Solana.',
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
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
