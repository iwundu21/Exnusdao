
"use client";

import React, { useState } from 'react';
import { Wallet, ShieldCheck, Settings } from 'lucide-react';
import Link from 'next/link';

export function Navbar({ isAdmin = false, toggleAdmin }: { isAdmin?: boolean, toggleAdmin: () => void }) {
  const [connected, setConnected] = useState(false);

  return (
    <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 exn-gradient-bg rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,245,255,0.4)] group-hover:scale-110 transition-transform">
          <ShieldCheck className="text-black w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold exn-gradient-text tracking-wider">EXN STAKER</h1>
      </Link>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleAdmin}
          className="flex items-center gap-2 text-white/70 hover:text-[#00f5ff] transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Protocol Controls</span>
        </button>
        
        <button 
          onClick={() => setConnected(!connected)}
          className={`exn-button flex items-center gap-2 ${connected ? 'opacity-80' : ''}`}
        >
          <Wallet className="w-5 h-5" />
          {connected ? '0x7a...d2f1' : 'Connect Wallet'}
        </button>
      </div>
    </nav>
  );
}
