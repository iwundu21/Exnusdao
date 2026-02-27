
"use client";

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, ShieldAlert, History, User, CheckCircle2 } from 'lucide-react';

export function GovernancePortal({ proposals = [], userStakeWeight = 0, walletAddress = '', onVote, onCreate, onComment }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', description: '', type: 0 });
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleCreate = () => {
    if (!newProp.title || !newProp.description) return toast({ title: "Fields Required", variant: "destructive" });
    onCreate(newProp);
    setShowCreate(false);
    setNewProp({ title: '', description: '', type: 0 });
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold exn-gradient-text tracking-tighter uppercase">DAO Governance</h2>
          <p className="text-white/40 text-sm">Propose upgrades. All proposals live for 7 days. Voting locks 4 hours before deadline.</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="exn-button uppercase tracking-widest text-xs font-black"
        >
          {showCreate ? 'Close Form' : 'New Proposal'}
        </button>
      </div>

      <div className="p-4 bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-xl flex items-center justify-between">
         <div className="flex items-center gap-3">
           <User className="w-4 h-4 text-[#00f5ff]" />
           <p className="text-[10px] uppercase font-black tracking-widest text-white/60">Your Current Voting Weight</p>
         </div>
         <p className="text-xl font-bold text-[#00f5ff]">{userStakeWeight.toLocaleString()} EXN</p>
      </div>

      {showCreate && (
        <div className="exn-card p-8 border-[#a855f7]/40 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold mb-6 uppercase tracking-widest">Submit Proposal (Fee: 100 EXN)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <input 
                 value={newProp.title}
                 onChange={e => setNewProp({...newProp, title: e.target.value})}
                 className="exn-input text-xs" 
                 placeholder="Proposal Title (PIP-XXX)..." 
               />
               <select 
                 value={newProp.type}
                 onChange={e => setNewProp({...newProp, type: Number(e.target.value)})}
                 className="exn-input text-xs"
               >
                 <option value={0}>Protocol Parameter Change</option>
                 <option value={1}>Treasury Distribution</option>
               </select>
            </div>
            <textarea 
              value={newProp.description}
              onChange={e => setNewProp({...newProp, description: e.target.value})}
              className="exn-input h-[104px] text-xs" 
              placeholder="Describe the change and rationale..." 
            />
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleCreate} className="exn-button text-xs">Broadcast Proposal</button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {proposals.map((prop: any) => {
          const totalVotes = (prop.yes_votes || 0) + (prop.no_votes || 0);
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          const isExpired = Date.now() > prop.deadline;
          const isLocked = Date.now() > (prop.voting_ends_at || prop.deadline - 14400000) && !isExpired;
          const hasVoted = prop.voters?.includes(walletAddress) || false;
          const comments = prop.comments || [];

          return (
            <div key={prop.id} className="exn-card p-0 border-white/5 overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row justify-between gap-8 border-b border-white/5">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${prop.type === 1 ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-[#00f5ff]/20 text-[#00f5ff]'}`}>
                      {prop.type === 1 ? 'Treasury' : 'Parameter'}
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight uppercase">{prop.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{prop.description}</p>
                  
                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black">
                      <History className="w-3 h-3" />
                      Ends: {new Date(prop.deadline).toLocaleDateString()}
                    </div>
                    {isLocked && (
                      <div className="flex items-center gap-2 text-[10px] text-amber-500 uppercase font-black">
                        <ShieldAlert className="w-3 h-3" />
                        Voting Lock Active
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-6 bg-white/5 p-6 rounded-2xl">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span className="text-emerald-400">YES ({yesPercent.toFixed(1)}%)</span>
                      <span className="text-red-400">NO</span>
                    </div>
                    <Progress value={yesPercent} className="h-2 bg-red-400/20" />
                  </div>

                  {!isExpired && !isLocked && !hasVoted && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => onVote(prop.id, true)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3 rounded-lg border border-emerald-500/20 text-[10px] uppercase">Vote Yes</button>
                      <button onClick={() => onVote(prop.id, false)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-lg border border-red-500/20 text-[10px] uppercase">Vote No</button>
                    </div>
                  )}

                  {hasVoted && !isExpired && (
                    <div className="py-3 bg-white/5 border border-white/10 rounded-lg text-center text-[10px] text-white/40 uppercase font-black">
                      Your Vote Cast
                    </div>
                  )}

                  {isLocked && !isExpired && (
                    <div className="py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center text-[10px] text-amber-500 uppercase font-black">
                      Locked for Finalization
                    </div>
                  )}

                  {isExpired && (
                    <div className={`py-3 rounded-lg text-center text-[10px] uppercase font-black ${yesPercent >= 51 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {yesPercent >= 51 ? 'Passed' : 'Failed'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.02] p-6">
                 <div className="flex items-center justify-between mb-6">
                    <button 
                      onClick={() => setActiveCommentId(activeCommentId === prop.id ? null : prop.id)}
                      className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-black hover:text-white transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> Discussion ({comments.length})
                    </button>
                    {activeCommentId === prop.id && (
                       <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest italic">Live Community Debate</span>
                    )}
                 </div>

                 {activeCommentId === prop.id && (
                   <div className="space-y-8 animate-in slide-in-from-top-2">
                      <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                        {comments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 opacity-20">
                             <MessageSquare className="w-10 h-10 mb-2" />
                             <p className="text-[10px] uppercase font-black tracking-widest text-center">No discussion entries found</p>
                          </div>
                        ) : (
                          comments.map((c: any) => {
                            const commenterHasVoted = prop.voters?.includes(c.author);
                            return (
                              <div key={c.id} className="flex gap-4 items-start group">
                                 <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-colors ${commenterHasVoted ? 'bg-[#00f5ff]/10 border-[#00f5ff]/30 text-[#00f5ff]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                    <User className="w-5 h-5" />
                                 </div>
                                 <div className="flex-1 space-y-1.5 bg-white/5 p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono font-bold text-[#00f5ff]">{c.author.slice(0, 8)}...{c.author.slice(-4)}</span>
                                        {commenterHasVoted && (
                                          <span className="flex items-center gap-1 text-[8px] bg-[#00f5ff] text-black px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> Voter
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-white/20 font-bold">{new Date(c.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-white/70 leading-relaxed">{c.text}</p>
                                 </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                      <div className="flex gap-3 pt-4 border-t border-white/5">
                        <input 
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          className="exn-input h-12 text-sm flex-1 bg-white/5 rounded-xl px-6" 
                          placeholder="Contribute to the governance discussion..." 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onComment(prop.id, commentText);
                              setCommentText('');
                            }
                          }}
                        />
                        <button 
                          onClick={() => { onComment(prop.id, commentText); setCommentText(''); }}
                          disabled={!commentText.trim()}
                          className={`h-12 px-8 text-xs font-black uppercase tracking-widest transition-all rounded-xl ${commentText.trim() ? 'exn-button' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
                        >Post</button>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
