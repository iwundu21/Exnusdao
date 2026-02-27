
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SolanaWalletProvider } from '@/components/providers/SolanaWalletProvider';

export const metadata: Metadata = {
  title: 'EXN Staker | High-Performance Solana Staking',
  description: 'Stake EXN tokens with top-tier validators on Solana.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased selection:bg-[#00f5ff] selection:text-black">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
