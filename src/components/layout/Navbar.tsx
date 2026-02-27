"use client";

import React, { useState } from 'react';
import { Wallet, Settings, Coins, CircleDollarSign, LayoutDashboard, Ticket, Hammer } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ 
  isAdmin = false, 
  toggleAdmin, 
  exnBalance = 0, 
  usdcBalance = 0 
}: { 
  isAdmin?: boolean, 
  toggleAdmin: () => void, 
  exnBalance?: number,
  usdcBalance?: number
}) {
  const [connected, setConnected] = useState(true);

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold exn-gradient-text tracking-wider leading-none">EXNUS</h1>
          <span className="text-[10px] text-white/40 tracking-[0.3em] font-bold uppercase">Decentralized</span>
        </div>
      </Link>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex items-center gap-6 text-xs uppercase font-bold tracking-widest">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-[#00f5ff] transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/purchase-license" className="flex items-center gap-2 text-white/60 hover:text-[#00f5ff] transition-colors">
            <Ticket className="w-4 h-4" /> Buy License
          </Link>
          <Link href="/register-node" className="flex items-center gap-2 text-white/60 hover:text-[#00f5ff] transition-colors">
            <Hammer className="w-4 h-4" /> Register Node
          </Link>
          <Link href="/manage-node" className="flex items-center gap-2 text-white/60 hover:text-[#00f5ff] transition-colors">
            <Settings className="w-4 h-4" /> Manage Node
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Coins className="w-4 h-4 text-[#00f5ff]" />
            <span className="text-xs font-bold text-[#00f5ff]">{exnBalance.toLocaleString()} EXN</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">{usdcBalance.toLocaleString()} USDC</span>
          </div>
        </div>

        <button 
          onClick={toggleAdmin}
          className="flex items-center gap-2 text-white/70 hover:text-[#00f5ff] transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setConnected(!connected)}
          className={`exn-button flex items-center gap-2 ${connected ? 'opacity-90' : ''}`}
        >
          <Wallet className="w-5 h-5" />
          {connected ? 'ExnUs...d2f1' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
