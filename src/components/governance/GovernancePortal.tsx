
"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, ShieldAlert, User, CheckCircle2, ChevronDown, ChevronUp, Landmark, Clock, Zap, Info, ShieldCheck } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
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
    colorClass: 'text-white/20'
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (now > deadline) {
        setTimeLeft({ label: 'CONCLUDED', value: '', colorClass: 'text-white/20' });
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
          value: `${days}D ${f(hours)}H ${f(minutes)}M ${f(seconds)}S`,
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
        value: `${days}D ${f(hours)}H ${f(minutes)}M ${f(seconds)}S`,
        colorClass: 'text-emerald-500' 
      });
      return false;
    };
    updateCountdown();
    const timer = setInterval(() => { if (updateCountdown()) clearInterval(timer); }, 1000);
    return () => clearInterval(timer);
  }, [deadline, votingEndsAt]);

  return (
    <div className={`flex items-center gap-2 text-[9px] uppercase font-black tracking-widest ${timeLeft.colorClass}`}>
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
  
  // Action/Process States
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [votingOn, setVotingOn] = useState<{ id: number; support: boolean } | null>(null);
  const [voteRationale, setVoteRationale] = useState('');
  
  // Review Dialog States
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [showVoteReview, setShowVoteReview] = useState(false);
  const [executingProposal, setExecutingProposal] = useState<any | null>(null);

  const connected = !!walletAddress;

  const startProcessing = (actionId: string, callback: () => void) => {
    setIsProcessing(actionId);
    callback();
    setTimeout(() => {
      setIsProcessing(null);
    }, 6500);
  };

  const handleCreateRequest = () => {
    if (!connected) return setFeedback('warning', 'Please connect wallet.');
    if (userStakeWeight < 1000000) return setFeedback('error', 'Min weight 1M EXN required.');
    setShowCreateReview(true);
  };

  const handleVoteRequest = () => {
    if (!connected) return setFeedback('warning', 'Please connect wallet.');
    if (!votingOn) return;
    if (!isNodeOwner && userStakeWeight < 10000) return setFeedback('error', 'Min weight 10k EXN required.');
    if (!voteRationale.trim()) return setFeedback('warning', 'Rationale required.');
    setShowVoteReview(true);
  };

  const confirmCreate = () => {
    startProcessing('SUBMIT_PROPOSAL', () => {
      onCreate({ ...newProp, amount: Number(newProp.amount) || 0 });
      setShowCreate(false);
      setNewProp({ title: '', description: '', type: 0, amount: '', recipient: '' });
    });
    setShowCreateReview(false);
  };

  const confirmVote = () => {
    if (!votingOn) return;
    startProcessing(`VOTE_${votingOn.id}`, () => {
      onVote(votingOn.id, votingOn.support, voteRationale);
      setVotingOn(null);
      setVoteRationale('');
    });
    setShowVoteReview(false);
  };

  const confirmExecute = () => {
    if (!executingProposal) return;
    startProcessing(`EXECUTE_${executingProposal.id}`, () => {
      onExecute(executingProposal.id);
    });
    setExecutingProposal(null);
  };

  const isProposalDisabled = !newProp.title.trim() || !newProp.description.trim() || !connected || (newProp.type === 1 && (!newProp.recipient.trim() || !newProp.amount || Number(newProp.amount) <= 0)) || !!isProcessing;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-black exn-gradient-text tracking-tighter uppercase leading-none">DAO_GOVERNANCE</h2>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">STAKE-WEIGHTED CONSENSUS PROTOCOL</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          disabled={!connected || !!isProcessing}
          className={`exn-button uppercase tracking-[0.2em] text-[10px] font-black h-10 px-8 ${!connected || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {showCreate ? 'CLOSE_FORM' : 'SUBMIT_PROPOSAL'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between backdrop-blur-xl">
           <div className="flex items-center gap-2">
             <User className="w-3.5 h-3.5 text-primary" />
             <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/40">CONSENSUS_WEIGHT</p>
           </div>
           <div className="text-right">
             <p className="text-xs font-black text-primary font-mono">{connected ? userStakeWeight.toLocaleString() : '0'} EXN</p>
             {connected && isNodeOwner && (
               <div className="flex items-center gap-1 justify-end text-[7px] text-emerald-500 font-black uppercase mt-0.5">
                 <ShieldCheck className="w-2.5 h-2.5" /> SEED_ACTIVE
               </div>
             )}
           </div>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
           <Info className="w-3.5 h-3.5 text-white/30" />
           <p className="text-[8px] text-white/40 uppercase font-black leading-tight tracking-tight">
             7-DAY CYCLE: 6 DAYS VOTING (EMERALD) <br/>
             FINAL 24H: CONSENSUS FREEZE (RED)
           </p>
        </div>
      </div>

      {showCreate && connected && (
        <div className="exn-card p-6 border-secondary/40 bg-black/60 backdrop-blur-3xl">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <Landmark className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em]">NEW_DAO_PROPOSAL (FEE: 10 EXN)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">PROPOSAL_TITLE</label>
                 <input value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} className="exn-input text-[10px] font-mono h-10" placeholder="e.g. PIP-004: NETWORK_EXPANSION" />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">CATEGORY</label>
                 <select value={newProp.type} onChange={e => setNewProp({...newProp, type: Number(e.target.value)})} className="exn-input text-[9px] font-black h-10 uppercase">
                   <option value={0}>PROTOCOL_PARAMETER</option>
                   <option value={1}>TREASURY_DISTRIBUTION</option>
                 </select>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-white/30 uppercase font-black tracking-[0.2em]">RATIONALE_DETAILS</label>
              <textarea value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="exn-input h-[110px] text-[10px] py-3 font-mono font-medium" placeholder="Describe infrastructure adjustments..." />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={handleCreateRequest} disabled={isProposalDisabled} className={`px-8 h-10 text-[9px] font-black uppercase tracking-[0.2em] transition-all ${!isProposalDisabled ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/10 cursor-not-allowed'}`}>
              {isProcessing === 'SUBMIT_PROPOSAL' ? 'SUBMITTING...' : 'REVIEW_&_BROADCAST'}
            </button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline px-8 h-10 text-[9px] uppercase font-black tracking-[0.2em] border-white/10 text-white/60">CANCEL</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {proposals.map((prop: any) => {
          const totalVotes = (prop.yes_votes || 0) + (prop.no_votes || 0);
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          const nowTime = Date.now();
          const isExpired = nowTime > prop.deadline;
          const isVotingLocked = nowTime > prop.voting_ends_at && !isExpired;
          const hasVoted = connected && prop.voters?.includes(walletAddress);
          const isVotingForThis = connected && votingOn?.id === prop.id;
          const showComments = activeCommentId === prop.id;
          const isActionProcessing = isProcessing === `VOTE_${prop.id}` || isProcessing === `EXECUTE_${prop.id}`;

          return (
            <div key={prop.id} className="exn-card p-0 border-white/5 bg-black/40 backdrop-blur-3xl">
              <div className="p-6 flex flex-col md:flex-row justify-between gap-6 border-b border-white/5">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.1em] border ${prop.type === 1 ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {prop.type === 1 ? 'TREASURY' : 'PARAMETER'}
                    </span>
                    <h3 className="text-lg font-black text-white tracking-tighter uppercase">{prop.title}</h3>
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed font-medium italic border-l border-primary/20 pl-4">{prop.description}</p>
                  <div className="flex items-center gap-6 pt-2">
                    <ProposalCountdown deadline={prop.deadline} votingEndsAt={prop.voting_ends_at} />
                    {isVotingLocked && <span className="text-[8px] text-destructive uppercase font-black bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20 animate-pulse">FREEZE</span>}
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-5 bg-white/5 p-5 rounded-xl border border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end text-[8px] font-black uppercase">
                        <span className="text-emerald-500">YES: {yesPercent.toFixed(1)}%</span>
                        <span className="text-destructive">NO: {(100 - yesPercent).toFixed(1)}%</span>
                    </div>
                    <Progress value={yesPercent} className="h-1.5 bg-destructive/10" />
                    <p className="text-[7px] text-white/20 uppercase font-black text-center tracking-widest">WEIGHT: {totalVotes.toLocaleString()} EXN</p>
                  </div>

                  {!isExpired && !isVotingLocked && !hasVoted && !isVotingForThis && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setVotingOn({ id: prop.id, support: true })} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-black py-2 rounded text-[8px] uppercase border border-emerald-500/20">VOTE_YES</button>
                      <button onClick={() => setVotingOn({ id: prop.id, support: false })} className="bg-destructive/10 hover:bg-destructive/20 text-destructive font-black py-2 rounded text-[8px] uppercase border border-destructive/20">VOTE_NO</button>
                    </div>
                  )}

                  {isVotingForThis && (
                    <div className="space-y-3 animate-in zoom-in-95 duration-500">
                      <textarea value={voteRationale} onChange={e => setVoteRationale(e.target.value)} placeholder="Rationale (3 EXN Fee)" className="exn-input h-20 text-[10px] bg-background font-mono py-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={handleVoteRequest} disabled={!voteRationale.trim() || !!isProcessing} className={`h-8 text-[8px] font-black uppercase transition-all ${voteRationale.trim() && !isProcessing ? 'exn-button' : 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed'}`}>
                          {isActionProcessing ? 'VOTING...' : 'REVIEW'}
                        </button>
                        <button onClick={() => setVotingOn(null)} className="exn-button-outline h-8 text-[8px] font-black border-white/10">ABORT</button>
                      </div>
                    </div>
                  )}

                  {isExpired && (
                    <button onClick={() => setExecutingProposal(prop)} disabled={prop.executed || !!isProcessing} className={`w-full h-10 uppercase text-[9px] font-black tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${prop.executed || isProcessing ? 'bg-white/5 text-white/10 border border-white/10' : 'exn-button'}`}>
                      {isActionProcessing ? 'EXECUTING...' : (prop.executed ? 'FINALIZED' : 'EXECUTE_ACTION')}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-black/20">
                <button onClick={() => setActiveCommentId(activeCommentId === prop.id ? null : prop.id)} className="w-full flex items-center justify-between px-6 py-3 text-[8px] font-black uppercase text-white/20 hover:text-white transition-all border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" />
                    VOTER_RATIONALES ({prop.comments?.length || 0})
                  </div>
                  {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {showComments && (
                  <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {(!prop.comments || prop.comments.length === 0) ? (
                      <p className="text-[8px] text-white/10 uppercase font-black text-center py-6 tracking-widest">NO_RATIONALES_LOGGED</p>
                    ) : (
                      prop.comments.map((comment: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                          <div className="flex justify-between items-center text-[8px]">
                            <div className="flex items-center gap-2">
                              <span className={`w-1 h-1 rounded-full ${comment.vote_stance === 'YES' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                              <p className="font-mono text-primary font-black">{shortenAddress(comment.author)}</p>
                            </div>
                            <p className="text-white/20 font-black">{new Date(comment.timestamp).toLocaleDateString()}</p>
                          </div>
                          <p className="text-[10px] text-white/70 leading-relaxed font-medium pl-3 border-l border-white/5">{comment.text}</p>
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

      {/* Create Proposal Review */}
      <AlertDialog open={showCreateReview} onOpenChange={setShowCreateReview}>
        <AlertDialogContent className="exn-card border-secondary/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> VERIFY_PROPOSAL
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">TITLE</span>
                      <span className="text-white font-black truncate max-w-[150px]">{newProp.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">NETWORK_FEE</span>
                      <span className="text-primary font-mono font-black">10 EXN</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">PROPOSAL WILL BE BROADCAST TO THE NETWORK DAO FOR CONSENSUS.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCreate} className="exn-button flex-1 h-10 text-[9px] uppercase font-black bg-secondary">CONFIRM_BROADCAST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vote Review */}
      <AlertDialog open={showVoteReview} onOpenChange={setShowVoteReview}>
        <AlertDialogContent className="exn-card border-primary/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> VERIFY_VOTE
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">STANCE</span>
                      <span className={votingOn?.support ? "text-emerald-500 font-black" : "text-destructive font-black"}>
                        {votingOn?.support ? 'YES_SUPPORT' : 'NO_REJECT'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">WEIGHT</span>
                      <span className="text-primary font-mono font-black">{userStakeWeight.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">YOUR CONSENSUS WEIGHT WILL BE RECORDED ON THE NETWORK LEDGER.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmVote} className="exn-button flex-1 h-10 text-[9px] uppercase font-black">CONFIRM_VOTE</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Execute Review */}
      <AlertDialog open={!!executingProposal} onOpenChange={() => setExecutingProposal(null)}>
        <AlertDialogContent className="exn-card border-emerald-500/50 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-6 space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <Zap className="w-5 h-5" /> VERIFY_EXECUTION
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">PROPOSAL_ID</span>
                      <span className="text-white font-mono font-black">#{executingProposal?.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase">
                      <span className="text-white/30 font-black">CONSENSUS</span>
                      <span className="text-emerald-500 font-black">PASSED_ENACTING</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 uppercase leading-relaxed font-black">ENACTING THIS PROPOSAL WILL PERMANENTLY TRIGGER THE ASSOCIATED ON-CHAIN ACTIONS.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3">
              <AlertDialogCancel className="exn-button-outline flex-1 h-10 text-[9px] uppercase font-black">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExecute} className="bg-emerald-500 text-black flex-1 h-10 text-[9px] uppercase font-black rounded-xl">CONFIRM_ENACT</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
