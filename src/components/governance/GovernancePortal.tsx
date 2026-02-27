
"use client";

import React, { useState } from 'react';
import { Vote, FileText, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

export function GovernancePortal({ proposals, totalStaked, onVote }: { proposals: any[], totalStaked: number, onVote: (id: number, support: boolean) => void }) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">Governance DAO</h2>
          <p className="text-white/40 text-sm">Phase 12-14: Stakeholders vote on protocol upgrades and treasury releases.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="exn-button flex items-center gap-2"
        >
          <Send className="w-5 h-5" /> Create Proposal
        </button>
      </div>

      {showCreate && (
        <div className="exn-card p-8 border-[#a855f7]/40 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#a855f7]" /> New Protocol Proposal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] text-white/50 uppercase block mb-1">Title</label>
                 <input className="exn-input" placeholder="PIP-003: Expand Treasury..." />
               </div>
               <div>
                 <label className="text-[10px] text-white/50 uppercase block mb-1">Type</label>
                 <select className="exn-input">
                   <option>Standard Parameter Change</option>
                   <option>Treasury Transaction (Admin only)</option>
                 </select>
               </div>
            </div>
            <div className="space-y-4">
               <div>
                 <label className="text-[10px] text-white/50 uppercase block mb-1">Description</label>
                 <textarea className="exn-input h-[104px]" placeholder="Detailed explanation of the change..." />
               </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={() => { setShowCreate(false); toast({ title: "Phase 12 Success", description: "Proposal registered on-chain." }); }} className="exn-button">Submit to DAO</button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {proposals.map((prop) => {
          const totalVotes = prop.yes_votes + prop.no_votes;
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          const isClosed = Date.now() > prop.deadline;
          const passed = yesPercent >= 51;

          return (
            <div key={prop.id} className="exn-card p-8 group border-white/5 hover:border-white/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${prop.type === 1 ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-[#00f5ff]/20 text-[#00f5ff]'}`}>
                      {prop.type === 1 ? 'Treasury' : 'Parameter'}
                    </span>
                    <span className="text-white/30 text-xs">ID: #{prop.id}</span>
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
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-emerald-400">YES ({yesPercent.toFixed(1)}%)</span>
                      <span className="text-red-400">NO</span>
                    </div>
                    <Progress value={yesPercent} className="h-2 bg-red-400/20" />
                    <div className="flex justify-between text-[10px] text-white/40 uppercase">
                      <span>{prop.yes_votes.toLocaleString()} EXN</span>
                      <span>{prop.no_votes.toLocaleString()} EXN</span>
                    </div>
                  </div>

                  {!isClosed ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => onVote(prop.id, true)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 rounded-lg border border-emerald-500/20 text-xs">VOTE YES</button>
                      <button onClick={() => onVote(prop.id, false)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg border border-red-500/20 text-xs">VOTE NO</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                       <div className={`text-center py-2 rounded-lg font-bold text-xs uppercase ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                         {passed ? 'Proposal Passed' : 'Proposal Failed'}
                       </div>
                       {passed && !prop.executed && (
                         <button onClick={() => toast({ title: "Phase 14 Initiated", description: "Proposal executed. State updated." })} className="w-full exn-button text-xs h-10">Execute (Phase 14)</button>
                       )}
                       {prop.executed && (
                         <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                           <CheckCircle className="w-4 h-4" /> Fully Executed
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
