
"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, Wallet, ArrowLeft, Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useProtocolState } from '@/hooks/use-protocol-state';
import { useWallet } from '@solana/wallet-adapter-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PurchaseLicensePage() {
  const { publicKey, connected } = useWallet();
  const walletAddress = publicKey?.toBase58() || '';
  const { state, isLoaded, setFeedback, mintLicense, usdcBalance } = useProtocolState();
  const [mounted, setMounted] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-bold uppercase tracking-widest animate-pulse">Syncing Network State</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-40 space-y-8 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-4">
           <h1 className="text-4xl font-bold uppercase tracking-tight text-foreground">Wallet Required</h1>
           <p className="text-muted-foreground max-w-md mx-auto">Connect your wallet to mint your XNode License NFT.</p>
         </div>
      </div>
    );
  }

  const licensePrice = state.licensePrice || 0;
  const currentMintedCount = state.licenses.length;
  const totalLimit = state.licenseLimit || 0;
  const remainingSlots = Math.max(0, totalLimit - currentMintedCount);

  const myLicenses = state.licenses.filter(l => l.owner === walletAddress);
  const hasLicense = myLicenses.length > 0;

  const handleMintInitiate = () => {
    if (!connected) return setFeedback('error', 'Wallet Connection Required');
    if (hasLicense) return setFeedback('warning', 'Only one XNode License permitted per wallet.');
    if (totalLimit > 0 && currentMintedCount >= totalLimit) return setFeedback('warning', 'Maximum license supply cap reached.');
    if (licensePrice > 0 && usdcBalance < licensePrice) return setFeedback('error', `Insufficient USDC balance.`);

    setShowReview(true);
  };

  const confirmMint = () => {
    setIsMinting(true);
    setShowReview(false);
    
    const mintAddress = `XNODE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newLicense = { 
      id: mintAddress, 
      owner: walletAddress, 
      is_claimed: false, 
      is_burned: false,
      metadata_uri: `https://arweave.net/${Math.random().toString(36).substring(2, 12)}`,
      image_url: `https://picsum.photos/seed/${mintAddress}/400/400`
    };

    mintLicense(walletAddress, licensePrice, newLicense);
    
    // Reset minting state after standard 6s delay (handled in state hook)
    setTimeout(() => {
      setIsMinting(false);
    }, 6500);
  };

  return (
    <div className="max-w-4xl mx-auto px-10 py-20 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase text-xs font-bold tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold exn-gradient-text tracking-tighter uppercase text-foreground">XNode Minting</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mint your unique XNode License NFT to gain validator registration rights. Each wallet is restricted to one license.
            </p>
          </div>

          <div className="exn-card p-10 space-y-10 border-primary/20 bg-primary/5">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">XNode Authorization</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">NFT Standard Mint</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500 font-mono">{licensePrice.toLocaleString()} USDC</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                   <span className="text-muted-foreground">Minted / Total Supply Cap</span>
                   <div className="flex items-center gap-1.5 font-black">
                     <span className={remainingSlots > 0 ? "text-primary" : "text-destructive"}>{currentMintedCount}</span>
                     <span className="text-muted-foreground/40">/</span>
                     <span className="text-muted-foreground">{totalLimit || '∞'}</span>
                   </div>
                </div>
                {totalLimit > 0 && (
                  <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full exn-gradient-bg transition-all duration-500" style={{ width: `${Math.min(100, (currentMintedCount / totalLimit) * 100)}%` }} />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleMintInitiate} 
                  disabled={(totalLimit > 0 && currentMintedCount >= totalLimit) || isMinting || hasLicense} 
                  className={`w-full h-16 text-sm tracking-[0.2em] font-black uppercase flex items-center justify-center gap-3 transition-all ${((totalLimit === 0 || currentMintedCount < totalLimit) && !isMinting && !hasLicense) ? 'exn-button' : 'bg-foreground/5 text-muted-foreground border border-border cursor-not-allowed'}`}
                >
                  {isMinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Provisioning NFT Sector...
                    </>
                  ) : hasLicense ? (
                    'License Already Owned'
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Mint XNode License NFT
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="exn-card p-6 border-border/10">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Your Inventory
              </h3>
              
              <div className="space-y-4">
                {myLicenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20 border border-dashed border-border rounded-xl">
                     <Ticket className="w-8 h-8 mb-2" />
                     <p className="text-[10px] uppercase font-black text-center">No XNode NFTs Found</p>
                  </div>
                ) : (
                  myLicenses.map((lic) => (
                    <div key={lic.id} className="p-4 bg-foreground/5 rounded-xl border border-border/40 space-y-4 group hover:border-primary/30 transition-all">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-white/5">
                             <Image src={lic.image_url || `https://picsum.photos/seed/${lic.id}/100/100`} alt="License" fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Mint Address</p>
                                  <p className="font-mono text-[11px] text-primary">{shortenAddress(lic.id)}</p>
                                </div>
                                <a href={getExplorerLink(lic.id)} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                                </a>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Mint Review Dialog */}
      <AlertDialog open={showReview} onOpenChange={setShowReview}>
        <AlertDialogContent className="exn-card border-primary/40 bg-black/90 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="w-6 h-6" />
              Review NFT Minting
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6 pt-4">
              <div className="p-6 bg-foreground/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Action</span>
                  <span className="text-foreground font-black">Mint XNode License NFT</span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Standard</span>
                  <span className="text-foreground font-bold">Metaplex Master Edition</span>
                </div>
                <div className="flex justify-between items-center text-xs uppercase tracking-widest">
                  <span className="text-muted-foreground">Mint Cost</span>
                  <span className="text-emerald-500 font-mono font-bold">{licensePrice.toLocaleString()} USDC</span>
                </div>
              </div>
              
              <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-bold">
                By confirming, the mint cost will be deducted from your USDC balance. The XNode License is required to register a validator on the network. This transaction is final.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="exn-button-outline text-[10px] h-12 uppercase font-black">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMint} className="exn-button text-[10px] h-12 uppercase font-black">Confirm & Mint</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
