
"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, ShieldAlert, User, CheckCircle2, ChevronDown, ChevronUp, Landmark, Clock, ExternalLink, Zap, Info, ShieldCheck, Wallet } from 'lucide-react';
import { shortenAddress, getExplorerLink } from '@/lib/utils';
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

function ProposalCountdown({ deadline, votingEndsAt }: { deadline: number; votingEndsAt: number }) {
  const [timeLeft, setTimeLeft] = useState<{ label: string; value: string; colorClass: string }>({
    label: 'Syncing...',
    value: '',
    colorClass: 'text-muted-foreground'
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      
      if (now > deadline) {
        setTimeLeft({ label: 'Proposal Concluded', value: '', colorClass: 'text-muted-foreground' });
        return true;
      }

      if (now > votingEndsAt) {
        const diff = Math.max(0, deadline - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const f = (n: number) => n.toString().padStart(2, '0');
        setTimeLeft({ 
          label: 'VOTING_LOCKED | FINAL_RESULTS_IN: ', 
          value: `${days}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`,
          colorClass: 'text-destructive' 
        });
        return false;
      }

      const diff = Math.max(0, votingEndsAt - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const f = (n: number) => n.toString().padStart(2, '0');
      setTimeLeft({ 
        label: 'VOTING_ENDS_IN: ', 
        value: `${days}d ${f(hours)}h ${f(minutes)}m ${f(seconds)}s`,
        colorClass: 'text-emerald-500' 
      });
      return false;
    };

    updateCountdown();
    const timer = setInterval(() => {
      if (updateCountdown()) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, votingEndsAt]);

  return (
    <div className={`flex items-center gap-2 text-[10px] uppercase font-black tracking-widest ${timeLeft.colorClass}`}>
      <Clock className="w-3 h-3" />
      <span>{timeLeft.label}</span>
      <span className="font-mono text-foreground">{timeLeft.value}</span>
    </div>
  );
}

export function GovernancePortal({ proposals = [], userStakeWeight = 0, isNodeOwner = false, walletAddress = '', onVote, onCreate, onExecute, setFeedback }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', description: '', type: 0, amount: '', recipient: '' });
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [votingOn, setVotingOn] = useState<{ id: number; support: boolean } | null>(null);
  const [voteRationale, setVoteRationale] = useState('');
  
  const [reviewAction, setReviewAction] = useState<'create' | 'vote' | null>(null);

  const connected = !!walletAddress;

  const handleCreateRequest = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to submit proposals.');
    if (userStakeWeight < 1000000) {
      return setFeedback('error', 'Stake Requirement Not Met: 1,000,000 EXN minimum weight required.');
    }
    setReviewAction('create');
  };

  const handleVoteRequest = () => {
    if (!connected) return setFeedback('warning', 'Please connect your wallet to participate in DAO consensus.');
    if (!votingOn) return;
    if (!isNodeOwner && userStakeWeight < 10000) {
      return setFeedback('error', 'Consensus Requirement: 10,000 EXN minimum weight required.');
    }
    if (!voteRationale.trim()) {
      return setFeedback('warning', 'Rationale Required: Please provide context for your consensus decision.');
    }
    setReviewAction('vote');
  };

  const confirmCreate = () => {
    onCreate({
      ...newProp,
      amount: Number(newProp.amount) || 0
    });
    setShowCreate(false);
    setReviewAction(null);
    setNewProp({ title: '', description: '', type: 0, amount: '', recipient: '' });
  };

  const confirmVote = () => {
    if (!votingOn) return;
    onVote(votingOn.id, votingOn.support, voteRationale);
    setVotingOn(null);
    setReviewAction(null);
    setVoteRationale('');
  };

  const isProposalDisabled = !newProp.title.trim() || !newProp.description.trim() || !connected || (newProp.type === 1 && (!newProp.recipient.trim() || !newProp.amount || Number(newProp.amount) <= 0));

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <h2 className="text-4xl font-black exn-gradient-text tracking-tighter uppercase leading-none">DAO_GOVERNANCE</h2>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em]">Direct stake-weighted consensus protocol v3.0</p>
        </div>
        <button 
          onClick={() => {
            if (!connected) return setFeedback('warning', 'Connect wallet to create a new proposal.');
            setShowCreate(!showCreate);
          }}
          className={`exn-button uppercase tracking-[0.3em] text-[11px] font-black h-12 flex items-center justify-center px-10 ${!connected ? 'opacity-50' : ''}`}
        >
          {showCreate ? 'CLOSE_FORM' : 'SUBMIT_PROPOSAL'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between shadow-xl backdrop-blur-xl">
           <div className="flex items-center gap-4">
             <User className="w-5 h-5 text-primary" />
             <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40">CONSENSUS_WEIGHT</p>
           </div>
           <div className="text-right">
             <p className="text-sm font-black text-primary font-mono tracking-tighter">{connected ? userStakeWeight.toLocaleString() : '0'} EXN</p>
             {connected && isNodeOwner && (
               <div className="flex items-center gap-2 justify-end text-[9px] text-emerald-500 font-black uppercase mt-1">
                 <ShieldCheck className="w-3 h-3" /> SEED_POWER_ACTIVE
               </div>
             )}
           </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5 shadow-xl backdrop-blur-xl">
           <Info className="w-5 h-5 text-white/30" />
           <p className="text-[10px] text-white/40 uppercase font-black leading-relaxed tracking-tight">
             7-DAY CYCLE: 6 DAYS VOTING (EMERALD) <br/>
             FINAL 24H: CONSENSUS FREEZE (RED)
           </p>
        </div>
      </div>

      {showCreate && connected && (
        <div className="exn-card p-10 border-secondary/40 animate-in fade-in slide-in-from-top-6 duration-700 bg-black/60 backdrop-blur-3xl shadow-3xl">
          <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
            <div className="p-3 bg-secondary/20 rounded-xl">
              <Landmark className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-[0.3em]">NEW_DAO_PROPOSAL (FEE_10_EXN)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
               <div className="space-y-4">
                 <label className="text-[11px] text-white/30 uppercase font-black tracking-[0.3em]">PROPOSAL_TITLE</label>
                 <input 
                   value={newProp.title}
                   onChange={e => setNewProp({...newProp, title: e.target.value})}
                   className="exn-input text-xs font-mono font-bold h-14" 
                   placeholder="e.g. PIP-004: NETWORK_EXPANSION" 
                 />
               </div>

               <div className="space-y-4">
                 <label className="text-[11px] text-white/30 uppercase font-black tracking-[0.3em]">PROPOSAL_CATEGORY</label>
                 <select 
                   value={newProp.type}
                   onChange={e => setNewProp({...newProp, type: Number(e.target.value)})}
                   className="exn-input text-[11px] font-black h-14 uppercase tracking-widest"
                 >
                   <option value={0}>PROTOCOL_PARAMETER_CHANGE</option>
                   <option value={1}>TREASURY_DISTRIBUTION</option>
                 </select>
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] text-white/30 uppercase font-black tracking-[0.3em]">RATIONALE_DETAILS</label>
              <textarea 
                value={newProp.description}
                onChange={e => setNewProp({...newProp, description: e.target.value})}
                className="exn-input h-[230px] text-xs py-6 font-mono font-medium leading-relaxed" 
                placeholder="Describe infrastructure adjustments. Required weight: 1M EXN." 
              />
            </div>
          </div>

          <div className="flex gap-6 mt-12">
            <button 
              onClick={handleCreateRequest} 
              disabled={isProposalDisabled}
              className={`px-12 text-[11px] transition-all h-14 flex items-center justify-center font-black uppercase tracking-[0.3em] shadow-2xl ${!isProposalDisabled ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}
            >
              REVIEW_&_BROADCAST
            </button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline px-12 text-[11px] h-14 uppercase font-black tracking-[0.3em] border-white/20 text-white hover:bg-white/10">CANCEL</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {proposals.map((prop: any) => {
          const totalVotes = (prop.yes_votes || 0) + (prop.no_votes || 0);
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          
          const now = Date.now();
          const isExpired = now > prop.deadline;
          const isVotingLocked = now > prop.voting_ends_at && !isExpired;
          const hasVoted = connected && prop.voters?.includes(walletAddress);
          const isVotingForThis = connected && votingOn?.id === prop.id;
          const showComments = activeCommentId === prop.id;

          return (
            <div key={prop.id} className="exn-card p-0 border-white/10 overflow-hidden shadow-2xl bg-black/40 backdrop-blur-3xl">
              <div className="p-10 flex flex-col md:flex-row justify-between gap-10 border-b border-white/5">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${prop.type === 1 ? 'bg-secondary/10 text-secondary border-secondary/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                      {prop.type === 1 ? 'TREASURY' : 'PARAMETER'}
                    </span>
                    <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-tight">{prop.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed font-medium tracking-tight italic border-l-2 border-primary/20 pl-6">{prop.description}</p>
                  
                  <div className="flex items-center gap-8 pt-4">
                    <ProposalCountdown deadline={prop.deadline} votingEndsAt={prop.voting_ends_at} />
                    {isVotingLocked && (
                      <div className="flex items-center gap-2.5 text-[10px] text-destructive uppercase font-black bg-destructive/10 px-4 py-1.5 rounded-full border border-destructive/30 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        CONSENSUS_FREEZE
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-96 space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 shadow-3xl">
                  <div className="space-y-5">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.3em]">
                        <div className="flex flex-col gap-1">
                          <span className="text-emerald-500">YES: {(prop.yes_votes || 0).toLocaleString()}</span>
                          <span className="text-[9px] text-emerald-500/40 font-mono">{yesPercent.toFixed(1)}%</span>
                        </div>
                        <div className="flex flex-col text-right gap-1">
                          <span className="text-destructive">NO: {(prop.no_votes || 0).toLocaleString()}</span>
                          <span className="text-[9px] text-destructive/40 font-mono">{(100 - yesPercent).toFixed(1)}%</span>
                        </div>
                    </div>
                    <Progress value={yesPercent} className="h-2.5 bg-destructive/20 border border-white/5" />
                    <p className="text-[9px] text-white/20 uppercase font-black text-center tracking-[0.2em]">TOTAL_CONSOLIDATED_WEIGHT: {totalVotes.toLocaleString()} EXN</p>
                  </div>

                  {!isExpired && !isVotingLocked && !hasVoted && !isVotingForThis && (
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setVotingOn({ id: prop.id, support: true })} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black py-4 rounded-xl border border-emerald-500/30 text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-lg">VOTE_YES</button>
                      <button onClick={() => setVotingOn({ id: prop.id, support: false })} className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-black py-4 rounded-xl border border-destructive/30 text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-lg">VOTE_NO</button>
                    </div>
                  )}

                  {isVotingForThis && (
                    <div className="space-y-5 animate-in zoom-in-95 duration-500">
                      <textarea 
                        value={voteRationale}
                        onChange={e => setVoteRationale(e.target.value)}
                        placeholder="State your rationale... (3 EXN Fee)"
                        className="exn-input h-28 text-xs bg-background font-mono font-medium py-4"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleVoteRequest} disabled={!voteRationale.trim()} className={`py-3 text-[10px] font-black uppercase tracking-widest ${voteRationale.trim() ? 'exn-button h-12 flex items-center justify-center' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed h-12'}`}>REVIEW</button>
                        <button onClick={() => setVotingOn(null)} className="exn-button-outline py-3 text-[10px] h-12 flex items-center justify-center border-white/20 text-white/60">ABORT</button>
                      </div>
                    </div>
                  )}

                  {isVotingLocked && !isExpired && (
                    <div className="py-4 bg-destructive/10 border border-destructive/30 rounded-xl text-center text-[10px] text-destructive uppercase font-black tracking-[0.4em] shadow-lg">
                      CONSENSUS_FREEZE
                    </div>
                  )}

                  {isExpired && (
                    <button onClick={() => onExecute(prop.id)} disabled={prop.executed} className={`w-full h-14 uppercase text-[11px] font-black tracking-[0.4em] flex items-center justify-center gap-3 transition-all ${prop.executed ? 'bg-white/5 text-white/20 border border-white/10' : 'exn-button shadow-2xl'}`}>
                      <Zap className="w-4 h-4 fill-current" /> {prop.executed ? 'FINALIZED' : 'EXECUTE_ACTION'}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-black/20">
                <button 
                  onClick={() => setActiveCommentId(activeCommentId === prop.id ? null : prop.id)}
                  className="w-full flex items-center justify-between px-10 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all border-b border-white/5 backdrop-blur-3xl"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    VOTER_RATIONALES ({prop.comments?.length || 0})
                  </div>
                  {showComments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {showComments && (
                  <div className="p-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 max-h-[450px] overflow-y-auto custom-scrollbar bg-black/40">
                    {(!prop.comments || prop.comments.length === 0) ? (
                      <p className="text-[10px] text-white/10 uppercase font-black text-center py-12 tracking-[0.3em] italic">NO_RATIONALES_LOGGED_FOR_THIS_SECTOR</p>
                    ) : (
                      prop.comments.map((comment: any, idx: number) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4 shadow-xl hover:border-white/20 transition-all">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <span className={`w-2 h-2 rounded-full ${comment.vote_stance === 'YES' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-destructive shadow-[0_0_10px_#ef4444]'}`} />
                              <p className="text-[11px] font-mono text-primary font-black tracking-tighter">{shortenAddress(comment.author)}</p>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${comment.vote_stance === 'YES' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                                {comment.vote_stance}
                              </span>
                            </div>
                            <p className="text-[9px] text-white/20 uppercase font-black tracking-widest">{new Date(comment.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed font-medium tracking-tight border-l border-white/10 pl-4">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Governance Review Dialog */}
      <AlertDialog open={reviewAction !== null} onOpenChange={() => setReviewAction(null)}>
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 backdrop-blur-3xl p-0 overflow-hidden max-w-lg">
          <div className="p-10 space-y-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-[0.3em] text-primary flex items-center gap-4">
                <ShieldCheck className="w-8 h-8" />
                VERIFY_DAO_ACTION
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-8 pt-8">
                  <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-6 shadow-3xl">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                      <span className="text-white/30 font-black">OP_CODE</span>
                      <span className="text-white font-black font-mono">{reviewAction === 'create' ? 'PROPOSAL_BROADCAST' : 'CONSENSUS_VOTE'}</span>
                    </div>
                    {reviewAction === 'create' ? (
                      <>
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                          <span className="text-white/30 font-black">ID_STRING</span>
                          <span className="text-white font-black font-mono truncate max-w-[180px]">{newProp.title}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                          <span className="text-white/30 font-black">NETWORK_FEE</span>
                          <span className="text-primary font-mono font-black text-sm">10 EXN</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                          <span className="text-white/30 font-black">STANCE</span>
                          <span className={votingOn?.support ? "text-emerald-500 font-black" : "text-destructive font-black"}>
                            {votingOn?.support ? 'YES_SUPPORT' : 'NO_REJECT'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                          <span className="text-white/30 font-black">WEIGHT</span>
                          <span className="text-primary font-mono font-black text-sm">{userStakeWeight.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.4em]">
                          <span className="text-white/30 font-black">NETWORK_FEE</span>
                          <span className="text-primary font-mono font-black text-sm">3 EXN</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-white/40 uppercase leading-relaxed font-black tracking-tight">
                    BY CONFIRMING, YOUR DECISION WILL BE RECORDED ON THE GLOBAL PROTOCOL LEDGER. GOVERNANCE ACTIONS REQUIRE NETWORK FEES TO PREVENT CONSENSUS SPAM.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-6 pt-4">
              <AlertDialogCancel className="exn-button-outline flex-1 text-[11px] h-14 uppercase font-black border-white/20 text-white hover:bg-white/10">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={reviewAction === 'create' ? confirmCreate : confirmVote} className="exn-button flex-1 text-[11px] h-14 uppercase font-black">CONFIRM_BROADCAST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
