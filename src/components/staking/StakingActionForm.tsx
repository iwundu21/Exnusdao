
"use client";

import React, { useState } from 'react';
import { Coins, Clock, ArrowRightLeft, AlertCircle, Calendar, ShieldCheck, Ticket } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STAKING_TIERS = [
  { days: 30, multiplier: 3000, label: '30 Days' },
  { days: 60, multiplier: 5000, label: '60 Days' },
  { days: 90, multiplier: 7500, label: '90 Days' },
  { days: 180, multiplier: 10000, label: '180 Days' },
];

export function StakingActionForm({ 
  selectedNode, 
  exnBalance, 
  usdcBalance, 
  onStake, 
  userStakes, 
  onUnstake,
  onPurchaseLicense,
  onRegisterNode,
  availableLicenses
}: any) {
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [activeTab, setActiveTab] = useState<'stake' | 'my-stakes' | 'validator'>('stake');
  const [newNode, setNewNode] = useState({ name: '', description: '' });

  const handleAction = () => {
    const numAmt = Number(amount);
    if (!amount || isNaN(numAmt) || numAmt <= 0) return toast({ title: "Invalid Amount", variant: "destructive" });
    if (numAmt > exnBalance) return toast({ title: "Insufficient Balance", variant: "destructive" });
    if (!selectedNode) return toast({ title: "Select Validator", variant: "destructive" });

    const tier = STAKING_TIERS.find(t => t.days.toString() === duration);
    onStake({
      validator_id: selectedNode.id,
      amount: numAmt,
      lock_multiplier: tier?.multiplier || 3000,
      unlock_timestamp: Date.now() + (Number(duration) * 86400000),
      reward_checkpoint: selectedNode.global_reward_index,
      claimed: false,
      unstaked: false
    });
    setAmount('');
  };

  return (
    <div className="exn-card p-8 space-y-6 sticky top-28 border-[#00f5ff]/10">
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
        <button 
          onClick={() => setActiveTab('stake')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'stake' ? 'exn-gradient-bg text-black' : 'text-white/40 hover:bg-white/5'}`}
        >
          Stake
        </button>
        <button 
          onClick={() => setActiveTab('my-stakes')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'my-stakes' ? 'exn-gradient-bg text-black' : 'text-white/40 hover:bg-white/5'}`}
        >
          My Stakes
        </button>
        <button 
          onClick={() => setActiveTab('validator')}
          className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all uppercase ${activeTab === 'validator' ? 'exn-gradient-bg text-black' : 'text-white/40 hover:bg-white/5'}`}
        >
          Validator
        </button>
      </div>

      {activeTab === 'stake' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-white/50 uppercase tracking-widest">Amount (EXN)</label>
              <span className="text-[10px] text-white/30">Available: {exnBalance.toLocaleString()}</span>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="exn-input pl-10 h-12"
              />
              <Coins className="absolute left-3 top-3.5 w-5 h-5 text-[#00f5ff]/60" />
              <button onClick={() => setAmount(exnBalance.toString())} className="absolute right-3 top-2.5 text-xs text-[#00f5ff] font-bold hover:underline">MAX</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Lock-up Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {STAKING_TIERS.map((tier) => (
                <button
                  key={tier.days}
                  onClick={() => setDuration(tier.days.toString())}
                  className={`py-3 px-2 border rounded-md transition-all flex flex-col items-center ${duration === tier.days.toString() ? 'border-[#00f5ff] bg-[#00f5ff]/10 text-[#00f5ff]' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                >
                  <span className="text-sm font-bold">{tier.label}</span>
                  <span className="text-[10px] opacity-70">{(tier.multiplier/1000).toFixed(1)}x Yield</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Node</span>
              <span className="text-white font-medium">{selectedNode ? selectedNode.name : 'Not Selected'}</span>
            </div>
          </div>

          <button onClick={handleAction} className="w-full h-12 exn-button uppercase tracking-widest flex items-center justify-center gap-2">
            <ArrowRightLeft className="w-5 h-5" /> Confirm Stake
          </button>
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-4 max-h-[400px] overflow-auto pr-2">
          {userStakes.filter((s: any) => !s.unstaked).length === 0 ? (
            <p className="text-center text-white/30 text-xs py-10">No active stake records.</p>
          ) : (
            userStakes.filter((s: any) => !s.unstaked).map((s: any) => {
              const isLocked = Date.now() < s.unlock_timestamp;
              return (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white">{s.amount.toLocaleString()} EXN</p>
                      <p className="text-[10px] text-white/40 uppercase">Multiplier: {(s.lock_multiplier/1000).toFixed(1)}x</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black ${isLocked ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      {isLocked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <Calendar className="w-3 h-3" />
                    Unlock: {new Date(s.unlock_timestamp).toLocaleDateString()}
                  </div>
                  {!isLocked && (
                    <button 
                      onClick={() => onUnstake(s.id)}
                      className="w-full py-2 bg-emerald-500 text-black text-[10px] font-bold rounded uppercase hover:bg-emerald-400"
                    >
                      Unstake Funds
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'validator' && (
        <div className="space-y-6">
          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-xs font-bold text-[#00f5ff] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Node Licensing
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] text-white/40 uppercase">
                <span>Owned Licenses:</span>
                <span className="text-white font-bold">{availableLicenses}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-white/40 uppercase">
                <span>License Price:</span>
                <span className="text-white font-bold">500 USDC</span>
              </div>
              <button 
                onClick={onPurchaseLicense}
                className="w-full exn-button-outline text-[10px] font-black py-3"
              >
                Purchase License
              </button>
            </div>
          </div>

          <div className="p-5 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Register Validator
            </h4>
            <div className="space-y-3">
              <input 
                value={newNode.name}
                onChange={e => setNewNode({...newNode, name: e.target.value})}
                className="exn-input text-xs" 
                placeholder="Node Name..." 
              />
              <input 
                value={newNode.description}
                onChange={e => setNewNode({...newNode, description: e.target.value})}
                className="exn-input text-xs" 
                placeholder="Description..." 
              />
              <button 
                disabled={availableLicenses === 0}
                onClick={() => { onRegisterNode(newNode.name, newNode.description); setNewNode({name: '', description: ''}); }}
                className={`w-full py-3 text-[10px] font-bold rounded uppercase transition-all ${availableLicenses > 0 ? 'exn-button' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
              >
                {availableLicenses > 0 ? 'Register Now' : 'Requires License'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-red-400">Lock periods are strictly enforced by the smart contract. Principal cannot be withdrawn prematurely.</p>
      </div>
    </div>
  );
}
