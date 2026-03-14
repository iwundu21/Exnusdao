
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
  const isMinting = state.lastTransaction?.status === 'warning';
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background space-y-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="exn-gradient-text font-black uppercase tracking-[0.4em] animate-pulse text-[10px]">SYNCING_NETWORK_STATE</p>
    </div>
  );

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-10 py-32 space-y-6 animate-in fade-in duration-500">
         <div className="p-6 bg-primary/15 rounded-3xl border border-primary/30 shadow-2xl">
           <Wallet className="w-12 h-12 text-primary" />
         </div>
         <div className="space-y-4">
           <h1 className="text-3xl font-black uppercase tracking-tighter text-white">AUTHENTICATION_REQUIRED</h1>
           <p className="text-white font-black text-[11px] uppercase tracking-[0.4em]">Connect your wallet to provision your XNode License NFT.</p>
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
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-16 space-y-12 animate-in fade-in duration-500">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors uppercase text-[10px] font-black tracking-[0.3em]">
        <ArrowLeft className="w-4 h-4" /> EXIT_TERMINAL
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black exn-gradient-text tracking-tighter uppercase text-white leading-none">XNODE_MINTING</h1>
            <p className="text-white font-black text-[11px] uppercase tracking-[0.5em] max-w-lg leading-relaxed">
              Provision unique XNode License NFTs to gain infrastructure registration rights.
            </p>
          </div>

          <div className="exn-card p-10 space-y-12 border-white/20 bg-black/90 backdrop-blur-3xl shadow-3xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-primary/15 rounded-2xl border border-primary/40 shadow-xl">
                  <Ticket className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-base font-black text-white uppercase tracking-widest">XNODE_AUTHORIZATION</p>
                  <p className="text-[11px] text-primary font-black uppercase tracking-[0.3em]">NFT_METAPLEX_STANDARD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{licensePrice.toLocaleString()} <span className="text-sm">USDC</span></p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.4em]">
                   <span className="text-white">MINTED / TOTAL_SUPPLY_CAP</span>
                   <div className="flex items-center gap-2 font-black">
                     <span className={remainingSlots > 0 ? "text-primary" : "text-destructive"}>{currentMintedCount}</span>
                     <span className="text-white/20">/</span>
                     <span className="text-white">{totalLimit || '∞'}</span>
                   </div>
                </div>
                {totalLimit > 0 && (
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner border border-white/10">
                    <div className="h-full exn-gradient-bg transition-all duration-1000 shadow-[0_0_20px_rgba(0,245,255,0.5)]" style={{ width: `${Math.min(100, (currentMintedCount / totalLimit) * 100)}%` }} />
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleMintInitiate} 
                  disabled={(totalLimit > 0 && currentMintedCount >= totalLimit) || isMinting || hasLicense} 
                  className={`w-full h-16 text-[12px] tracking-[0.6em] font-black uppercase flex items-center justify-center gap-4 transition-all shadow-3xl ${((totalLimit === 0 || currentMintedCount < totalLimit) && !isMinting && !hasLicense) ? 'exn-button' : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed'}`}
                >
                  {isMinting ? (
                    'PROVISIONING_SECTOR...'
                  ) : hasLicense ? (
                    'AUTHORIZATION_OWNED'
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      MINT_XNODE_LICENSE
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="exn-card p-8 border-white/20 bg-black/90 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-8 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-primary" /> INVENTORY_SCAN
              </h3>
              
              <div className="space-y-6">
                {myLicenses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                     <Ticket className="w-12 h-12 mb-4 text-white/20" />
                     <p className="text-[11px] uppercase font-black text-white/40 tracking-[0.4em] text-center">NO_XNODE_NFT_DETECTED</p>
                  </div>
                ) : (
                  myLicenses.map((lic) => (
                    <div key={lic.id} className="p-6 bg-white/5 rounded-2xl border border-white/15 space-y-5 group hover:border-primary/50 transition-all shadow-xl">
                       <div className="flex gap-6">
                          <div className="w-14 h-14 relative rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
                             <Image src={lic.image_url || `https://picsum.photos/seed/${lic.id}/120/120`} alt="License" fill className="object-cover" />
                          </div>
                          <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-[10px] text-white/60 uppercase font-black mb-1 tracking-widest">MINT_ID</p>
                                  <p className="font-mono text-[12px] text-primary font-black tracking-tighter">{shortenAddress(lic.id)}</p>
                                </div>
                                <a href={getExplorerLink(lic.id)} target="_blank" rel="noopener noreferrer">
                                   <ExternalLink className="w-4 h-4 text-white/40 hover:text-primary transition-all" />
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

      <AlertDialog open={showReview} onOpenChange={setShowReview}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 backdrop-blur-3xl p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" />
                VERIFY_PROVISIONING
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-6 bg-white/5 rounded-xl border border-white/15 space-y-4 shadow-3xl">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                      <span className="text-white/70 font-black">OP_CODE</span>
                      <span className="text-white font-black font-mono">XNODE_MINT</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                      <span className="text-white/70 font-black">MINT_COST</span>
                      <span className="text-emerald-400 font-mono font-black text-[13px]">{licensePrice.toLocaleString()} USDC</span>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-white/80 uppercase leading-relaxed font-black tracking-tight">
                    BY CONFIRMING, THE MINT COST WILL BE DEDUCTED FROM YOUR USDC BALANCE.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[10px] h-11 uppercase font-black border-white text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmMint} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_MINT</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
