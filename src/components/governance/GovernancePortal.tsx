"use client";

import React, { useState } from 'react';
import { Vote, Send, Clock, CheckCircle, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

export function GovernancePortal({ proposals, onVote, onExecute }: any) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Phase 12-14: DAO</h2>
          <p className="text-white/40 text-sm">Propose upgrades, vote with staked EXN weight, and execute on-chain.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="exn-button flex items-center gap-2"
        >
          <Send className="w-5 h-5" /> New Proposal
        </button>
      </div>

      {showCreate && (
        <div className="exn-card p-8 border-[#a855f7]/40 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#a855f7]" /> Create Proposal (Phase 12)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <input className="exn-input text-xs" placeholder="Proposal Title (PIP-XXX)..." />
               <select className="exn-input text-xs">
                 <option>Standard Param Change</option>
                 <option>Treasury Transaction (Phase 14 Target)</option>
               </select>
            </div>
            <textarea className="exn-input h-[104px] text-xs" placeholder="Describe the change and rationale..." />
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => { setShowCreate(false); toast({ title: "Proposal Created", description: "Broadcasting to stakeholders." }); }} className="exn-button text-xs">Submit to DAO</button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {proposals.map((prop: any) => {
          const totalVotes = prop.yes_votes + prop.no_votes;
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          const isClosed = Date.now() > prop.deadline;
          const passed = yesPercent >= 51;

          return (
            <div key={prop.id} className="exn-card p-8 border-white/5 hover:border-white/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${prop.type === 1 ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-[#00f5ff]/20 text-[#00f5ff]'}`}>
                      {prop.type === 1 ? 'Treasury' : 'Param'}
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{prop.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{prop.description}</p>
                  
                  <div className="flex gap-8 pt-4">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Clock className="w-4 h-4" /> {isClosed ? 'Voting Closed' : `Ends: ${new Date(prop.deadline).toLocaleDateString()}`}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Vote className="w-4 h-4" /> Threshold: 51%
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-emerald-400">YES ({yesPercent.toFixed(1)}%)</span>
                      <span className="text-red-400">NO</span>
                    </div>
                    <Progress value={yesPercent} className="h-2 bg-red-400/20" />
                    <div className="flex justify-between text-[10px] text-white/30 uppercase">
                      <span>{prop.yes_votes.toLocaleString()} Weight</span>
                      <span>{prop.no_votes.toLocaleString()} Weight</span>
                    </div>
                  </div>

                  {!isClosed ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => onVote(prop.id, true)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 rounded-lg border border-emerald-500/20 text-[10px] uppercase">Vote Yes</button>
                      <button onClick={() => onVote(prop.id, false)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg border border-red-500/20 text-[10px] uppercase">Vote No</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                       <div className={`text-center py-2 rounded-lg font-black text-[10px] uppercase ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                         {passed ? 'Passed' : 'Failed'}
                       </div>
                       {passed && !prop.executed && (
                         <button onClick={() => onExecute(prop.id)} className="w-full exn-button text-[10px] font-black h-10">Execute (Phase 14)</button>
                       )}
                       {prop.executed && (
                         <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase pt-2">
                           <CheckCircle className="w-4 h-4" /> On-Chain Applied
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
