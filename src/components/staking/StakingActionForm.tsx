
"use client";

import React, { useState } from 'react';
import { Coins, Clock, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function StakingActionForm({ selectedNode }: { selectedNode: any }) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [isStaking, setIsStaking] = useState(true);

  const handleAction = () => {
    if (!amount || isNaN(Number(amount))) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount of EXN tokens.", variant: "destructive" });
      return;
    }
    toast({ title: "Transaction Sent", description: `Successfully ${isStaking ? 'staked' : 'unstaked'} ${amount} EXN with ${selectedNode?.name || 'Protocol'}.` });
  };

  return (
    <div className="exn-card p-8 space-y-6 sticky top-28">
      <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setIsStaking(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isStaking ? 'exn-gradient-bg text-black' : 'text-white/70 hover:bg-white/5'}`}
        >
          Stake
        </button>
        <button 
          onClick={() => setIsStaking(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isStaking ? 'exn-gradient-bg text-black' : 'text-white/70 hover:bg-white/5'}`}
        >
          Unstake
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Amount (EXN)</label>
          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="exn-input pl-10 h-12"
            />
            <Coins className="absolute left-3 top-3.5 w-5 h-5 text-[#00f5ff]/60" />
            <button className="absolute right-3 top-2.5 text-xs text-[#00f5ff] font-bold hover:underline">MAX</button>
          </div>
        </div>

        {isStaking && (
          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Lock-up Period</label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 90, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d.toString())}
                  className={`py-2 text-xs border rounded-md transition-all ${duration === d.toString() ? 'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                >
                  {d} Days
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Validator</span>
            <span className="text-white font-medium">{selectedNode ? selectedNode.name : 'Select a node'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Exchange Rate</span>
            <span className="text-white font-medium">1 EXN = 1 sEXN</span>
          </div>
          {isStaking && (
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Unlock Date</span>
              <span className="text-white font-medium">Sept 24, 2025</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleAction}
          className="w-full h-12 exn-button uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-5 h-5" />
          {isStaking ? 'Confirm Stake' : 'Confirm Unstake'}
        </button>

        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-400">Tokens are locked during the staking period. Unstaking before the deadline may result in slashing penalties.</p>
        </div>
      </div>
    </div>
  );
}
