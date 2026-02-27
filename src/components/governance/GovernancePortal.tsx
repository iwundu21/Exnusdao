
"use client";

import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, ShieldAlert, History, User, CheckCircle2, ChevronDown, ChevronUp, Landmark, Settings2 } from 'lucide-react';

export function GovernancePortal({ proposals = [], userStakeWeight = 0, walletAddress = '', onVote, onCreate, onComment }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', description: '', type: 0, amount: '', recipient: '' });
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [votingOn, setVotingOn] = useState<{ id: number; support: boolean } | null>(null);
  const [voteRationale, setVoteRationale] = useState('');

  const handleCreate = () => {
    if (!newProp.title || !newProp.description) {
      return toast({ title: "Fields Required", description: "Title and description are mandatory.", variant: "destructive" });
    }
    
    if (newProp.type === 1) {
      if (!newProp.recipient || !newProp.amount || Number(newProp.amount) <= 0) {
        return toast({ title: "Distribution Details Required", description: "Please specify a valid recipient and amount.", variant: "destructive" });
      }
    }

    onCreate({
      ...newProp,
      amount: Number(newProp.amount) || 0
    });
    
    setShowCreate(false);
    setNewProp({ title: '', description: '', type: 0, amount: '', recipient: '' });
  };

  const handleConfirmVote = () => {
    if (!votingOn) return;
    if (!voteRationale.trim()) {
      return toast({ title: "Rationale Required", description: "You must provide a comment explaining your vote.", variant: "destructive" });
    }
    onVote(votingOn.id, votingOn.support, voteRationale);
    setVotingOn(null);
    setVoteRationale('');
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
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-[#a855f7]/20 rounded-lg">
              <Landmark className="w-5 h-5 text-[#a855f7]" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest">Submit Proposal (Fee: 100 EXN)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Proposal Title</label>
                 <input 
                   value={newProp.title}
                   onChange={e => setNewProp({...newProp, title: e.target.value})}
                   className="exn-input text-xs" 
                   placeholder="e.g. PIP-004: Network Expansion" 
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Proposal Category</label>
                 <select 
                   value={newProp.type}
                   onChange={e => setNewProp({...newProp, type: Number(e.target.value)})}
                   className="exn-input text-xs"
                 >
                   <option value={0}>Protocol Parameter Change</option>
                   <option value={1}>Treasury Distribution (Transaction)</option>
                 </select>
               </div>

               {newProp.type === 1 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-left-2">
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#a855f7] uppercase font-black tracking-widest">Recipient Address</label>
                      <input 
                        value={newProp.recipient}
                        onChange={e => setNewProp({...newProp, recipient: e.target.value})}
                        className="exn-input text-[10px] font-mono" 
                        placeholder="Solana Address..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#a855f7] uppercase font-black tracking-widest">Amount (EXN)</label>
                      <input 
                        type="number"
                        value={newProp.amount}
                        onChange={e => setNewProp({...newProp, amount: e.target.value})}
                        className="exn-input text-[10px]" 
                        placeholder="0.00" 
                      />
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest">Rationale & Details</label>
              <textarea 
                value={newProp.description}
                onChange={e => setNewProp({...newProp, description: e.target.value})}
                className="exn-input h-[210px] text-xs py-4" 
                placeholder="Describe the change, the technical impact, and the rationale for community voting..." 
              />
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={handleCreate} className="exn-button px-10 text-[10px]">Broadcast to Network</button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline px-10 text-[10px]">Cancel</button>
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
          const isVotingForThis = votingOn?.id === prop.id;

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
                  
                  {prop.type === 1 && prop.recipient && (
                    <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/5 w-fit">
                      <div className="space-y-1">
                        <p className="text-[8px] text-white/20 uppercase font-black">Recipient</p>
                        <p className="text-xs font-mono text-[#a855f7]">{prop.recipient.slice(0, 8)}...{prop.recipient.slice(-8)}</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="space-y-1">
                        <p className="text-[8px] text-white/20 uppercase font-black">Transfer Amount</p>
                        <p className="text-sm font-bold text-[#a855f7]">{prop.amount.toLocaleString()} EXN</p>
                      </div>
                    </div>
                  )}

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

                  {!isExpired && !isLocked && !hasVoted && !isVotingForThis && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setVotingOn({ id: prop.id, support: true })} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-3 rounded-lg border border-emerald-500/20 text-[10px] uppercase">Vote Yes</button>
                      <button onClick={() => setVotingOn({ id: prop.id, support: false })} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-lg border border-red-500/20 text-[10px] uppercase">Vote No</button>
                    </div>
                  )}

                  {isVotingForThis && (
                    <div className="space-y-4 animate-in zoom-in-95">
                      <div className={`p-3 rounded-lg text-center text-[10px] font-black uppercase ${votingOn.support ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        Stance: {votingOn.support ? 'YES' : 'NO'}
                      </div>
                      <textarea 
                        value={voteRationale}
                        onChange={e => setVoteRationale(e.target.value)}
                        placeholder="State your rationale (required)..."
                        className="exn-input h-24 text-xs bg-[#0f172a]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleConfirmVote} className="exn-button py-2 text-[10px]">Submit Vote</button>
                        <button onClick={() => setVotingOn(null)} className="exn-button-outline py-2 text-[10px]">Cancel</button>
                      </div>
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
                      {activeCommentId === prop.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    {activeCommentId === prop.id && (
                       <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest italic">Live Community Debate</span>
                    )}
                 </div>

                 {activeCommentId === prop.id && (
                   <div className="space-y-8 animate-in slide-in-from-top-2">
                      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                        {comments.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 opacity-20">
                             <MessageSquare className="w-10 h-10 mb-2" />
                             <p className="text-[10px] uppercase font-black tracking-widest text-center">No discussion entries found</p>
                          </div>
                        ) : (
                          [...comments].sort((a, b) => b.timestamp - a.timestamp).map((c: any) => {
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
                                        {c.vote_stance && (
                                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${c.vote_stance === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                            Stance: {c.vote_stance}
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
