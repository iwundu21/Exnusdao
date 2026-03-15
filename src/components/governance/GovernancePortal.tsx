
"use client";

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, ShieldAlert, User, CheckCircle2, ChevronDown, ChevronUp, Landmark, Clock, Zap, Info, ShieldCheck, Coins, Wallet } from 'lucide-react';
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
    colorClass: 'text-white'
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (now > deadline) {
        setTimeLeft({ label: 'CONCLUDED', value: '', colorClass: 'text-white' });
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
          colorClass: 'text-destructive font-black' 
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
        colorClass: 'text-emerald-500 font-black' 
      });
      return false;
    };
    updateCountdown();
    const timer = setInterval(() => { if (updateCountdown()) clearInterval(timer); }, 1000);
    return () => clearInterval(timer);
  }, [deadline, votingEndsAt]);

  return (
    <div className={`flex items-center gap-2 text-[11px] uppercase font-black tracking-widest ${timeLeft.colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{timeLeft.label}</span>
      <span className="font-mono text-white">{timeLeft.value}</span>
    </div>
  );
}

export function GovernancePortal({ proposals = [], userStakeWeight = 0, isNodeOwner = false, isAdmin = false, walletAddress = '', onVote, onCreate, onExecute, setFeedback }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', description: '', type: 0, amount: '', recipient: '' });
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  
  const [votingOn, setVotingOn] = useState<{ id: number; support: boolean } | null>(null);
  const [voteRationale, setVoteRationale] = useState('');
  
  const [showCreateReview, setShowCreateReview] = useState(false);
  const [showVoteReview, setShowVoteReview] = useState(false);
  const [executingProposal, setExecutingProposal] = useState<any | null>(null);

  const connected = !!walletAddress;

  const handleCreateRequest = () => {
    if (!connected) return setFeedback('warning', 'Please connect wallet.');
    if (userStakeWeight < 1000000) return setFeedback('error', 'Min weight 1M EXN required.');
    if (newProp.type === 1 && !isAdmin) return setFeedback('error', 'Only Protocol Authority can broadcast Transaction Proposals.');
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
    setShowCreateReview(false);
    onCreate({ ...newProp, amount: Number(newProp.amount) || 0 });
    setShowCreate(false);
    setNewProp({ title: '', description: '', type: 0, amount: '', recipient: '' });
  };

  const confirmVote = () => {
    if (!votingOn) return;
    const vOnId = votingOn.id;
    const vOnSupport = votingOn.support;
    const rationale = voteRationale;
    setShowVoteReview(false);
    setVotingOn(null);
    onVote(vOnId, vOnSupport, rationale);
    setVoteRationale('');
  };

  const confirmExecute = () => {
    if (!executingProposal) return;
    const ePropId = executingProposal.id;
    setExecutingProposal(null);
    onExecute(ePropId);
  };

  const isProposalDisabled = !newProp.title.trim() || !newProp.description.trim() || !connected || (newProp.type === 1 && (!newProp.recipient.trim() || !newProp.amount || Number(newProp.amount) <= 0));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-black exn-gradient-text tracking-tighter uppercase leading-none">DAO_GOVERNANCE</h2>
          <p className="text-white font-black uppercase tracking-[0.4em] text-[10px]">STAKE-WEIGHTED CONSENSUS PROTOCOL</p>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          disabled={!connected}
          className={`exn-button uppercase tracking-[0.2em] text-[10px] font-black h-10 px-8 ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {showCreate ? 'CLOSE_FORM' : 'SUBMIT_PROPOSAL'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between backdrop-blur-xl shadow-lg">
           <div className="flex items-center gap-2">
             <User className="w-4 h-4 text-primary" />
             <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white">CONSENSUS_WEIGHT</p>
           </div>
           <div className="text-right">
             <p className="text-xs font-black text-primary font-mono">{connected ? userStakeWeight.toLocaleString() : '0'} EXN</p>
             {connected && isNodeOwner && (
               <div className="flex items-center gap-1 justify-end text-[8px] text-emerald-400 font-black uppercase mt-0.5">
                 <ShieldCheck className="w-3 h-3" /> SEED_ACTIVE
               </div>
             )}
           </div>
        </div>
      </div>

      {showCreate && connected && (
        <div className="exn-card p-8 border-secondary/50 bg-black/90 backdrop-blur-3xl shadow-3xl">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-5">
            <Landmark className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-secondary">NEW_DAO_PROPOSAL (FEE: 10 EXN)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
               <div className="space-y-2.5">
                 <label className="text-[10px] text-white uppercase font-black tracking-[0.2em]">PROPOSAL_TITLE</label>
                 <input value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} className="exn-input text-[11px] font-mono h-11" placeholder="e.g. PIP-004: NETWORK_EXPANSION" />
               </div>
               <div className="space-y-2.5">
                 <label className="text-[10px] text-white uppercase font-black tracking-[0.2em]">CATEGORY</label>
                 <select value={newProp.type} onChange={e => setNewProp({...newProp, type: Number(e.target.value)})} className="exn-input text-[10px] font-black h-11 uppercase">
                   <option value={0}>PROTOCOL_PARAMETER</option>
                   {isAdmin && <option value={1}>TREASURY_DISTRIBUTION</option>}
                 </select>
                 {newProp.type === 1 && !isAdmin && (
                   <p className="text-[9px] text-destructive font-black uppercase tracking-widest mt-1">AUTHORITY_RESTRICTED</p>
                 )}
               </div>
            </div>
            
            <div className="space-y-2.5">
              <label className="text-[10px] text-white uppercase font-black tracking-[0.2em]">RATIONALE_DETAILS</label>
              <textarea value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} className="exn-input h-[120px] text-[11px] py-4 font-mono font-medium leading-relaxed" placeholder="Describe infrastructure adjustments..." />
            </div>

            {newProp.type === 1 && isAdmin && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2.5">
                  <label className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                    <Coins className="w-3 h-3" /> TRANSACTION_AMOUNT (EXN)
                  </label>
                  <input 
                    type="number" 
                    value={newProp.amount} 
                    onChange={e => setNewProp({...newProp, amount: e.target.value})} 
                    className="exn-input text-[11px] font-mono h-11 bg-emerald-500/5 border-emerald-500/30 text-white" 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.2em] flex items-center gap-2">
                    <Wallet className="w-3 h-3" /> RECIPIENT_ADDRESS
                  </label>
                  <input 
                    value={newProp.recipient} 
                    onChange={e => setNewProp({...newProp, recipient: e.target.value})} 
                    className="exn-input text-[11px] font-mono h-11 bg-emerald-500/5 border-emerald-500/30 text-white" 
                    placeholder="SOL_WALLET_ADDRESS" 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-5 mt-8">
            <button onClick={handleCreateRequest} disabled={isProposalDisabled} className={`px-10 h-11 text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${!isProposalDisabled ? 'exn-button' : 'bg-white/10 text-white border border-white/20 cursor-not-allowed'}`}>
              REVIEW_&_BROADCAST
            </button>
            <button onClick={() => setShowCreate(false)} className="exn-button-outline px-10 h-11 text-[10px] uppercase font-black tracking-[0.3em] border-white/20 text-white hover:bg-white/10">CANCEL</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {proposals.map((prop: any) => {
          const totalVotes = (prop.yes_votes || 0) + (prop.no_votes || 0);
          const yesPercent = totalVotes > 0 ? (prop.yes_votes / totalVotes) * 100 : 0;
          const nowTime = Date.now();
          const isExpired = nowTime > prop.deadline;
          const isVotingLocked = nowTime > prop.voting_ends_at && !isExpired;
          const hasVoted = connected && prop.voters?.includes(walletAddress);
          const isVotingForThis = connected && votingOn?.id === prop.id;
          const showComments = activeCommentId === prop.id;

          return (
            <div key={prop.id} className="exn-card p-0 border-white/20 bg-black/60 backdrop-blur-3xl shadow-2xl">
              <div className="p-8 flex flex-col md:flex-row justify-between gap-8 border-b border-white/10">
                <div className="flex-1 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${prop.type === 1 ? 'bg-secondary/20 text-secondary border-secondary/40' : 'bg-primary/20 text-primary border-primary/40'}`}>
                      {prop.type === 1 ? 'TREASURY' : 'PARAMETER'}
                    </span>
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none">{prop.title}</h3>
                  </div>
                  <p className="text-white text-[12px] leading-relaxed font-medium italic border-l-2 border-primary/30 pl-5 tracking-tight">{prop.description}</p>
                  
                  {prop.type === 1 && prop.amount > 0 && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                         <span className="text-white/60">TX_AMOUNT</span>
                         <span className="text-emerald-400 font-mono">{prop.amount.toLocaleString()} EXN</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                         <span className="text-white/60">TARGET_RECIPIENT</span>
                         <span className="text-white font-mono">{shortenAddress(prop.recipient)}</span>
                       </div>
                    </div>
                  )}

                  <div className="flex items-center gap-8 pt-2">
                    <ProposalCountdown deadline={prop.deadline} votingEndsAt={prop.voting_ends_at} />
                    {isVotingLocked && <span className="text-[10px] text-destructive uppercase font-black bg-destructive/20 px-3 py-1 rounded border border-destructive/40 animate-pulse tracking-widest">FREEZE</span>}
                  </div>
                </div>

                <div className="w-full md:w-80 space-y-6 bg-white/5 p-6 rounded-2xl border border-white/15 shadow-xl">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                        <span className="text-emerald-400">YES: {yesPercent.toFixed(1)}%</span>
                        <span className="text-destructive">NO: {(100 - yesPercent).toFixed(1)}%</span>
                    </div>
                    <Progress value={yesPercent} className="h-2 bg-destructive/20" />
                    <p className="text-[9px] text-white uppercase font-black text-center tracking-[0.3em]">CONSENSUS_WEIGHT: {totalVotes.toLocaleString()} EXN</p>
                  </div>

                  {!isExpired && !isVotingLocked && !hasVoted && !isVotingForThis && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setVotingOn({ id: prop.id, support: true })} className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-black py-2.5 rounded-lg text-[10px] uppercase border border-emerald-500/30 transition-all shadow-md">VOTE_YES</button>
                      <button onClick={() => setVotingOn({ id: prop.id, support: false })} className="bg-destructive/15 hover:bg-destructive/25 text-destructive font-black py-2.5 rounded-lg text-[10px] uppercase border border-destructive/30 transition-all shadow-md">VOTE_NO</button>
                    </div>
                  )}

                  {isVotingForThis && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-500">
                      <textarea value={voteRationale} onChange={e => setVoteRationale(e.target.value)} placeholder="Rationale (3 EXN Fee)" className="exn-input h-24 text-[11px] bg-background font-mono py-3" />
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleVoteRequest} disabled={!voteRationale.trim()} className={`h-10 text-[10px] font-black uppercase transition-all shadow-lg ${voteRationale.trim() ? 'exn-button' : 'bg-white/10 text-white border border-white/20 cursor-not-allowed'}`}>
                          REVIEW
                        </button>
                        <button onClick={() => setVotingOn(null)} className="exn-button-outline h-10 text-[10px] font-black border-white/20 text-white">ABORT</button>
                      </div>
                    </div>
                  )}

                  {isExpired && (
                    <button onClick={() => setExecutingProposal(prop)} disabled={prop.executed} className={`w-full h-12 uppercase text-[10px] font-black tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl ${prop.executed ? 'bg-white/10 text-white border border-white/20' : 'exn-button'}`}>
                      {prop.executed ? 'FINALIZED_IN_LEDGER' : 'EXECUTE_CONSENSUS'}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-black/30">
                <button onClick={() => setActiveCommentId(activeCommentId === prop.id ? null : prop.id)} className="w-full flex items-center justify-between px-8 py-4 text-[10px] font-black uppercase text-white hover:text-primary transition-all border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    NETWORK_RATIONALES ({prop.comments?.length || 0})
                  </div>
                  {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showComments && (
                  <div className="p-8 space-y-5 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {(!prop.comments || prop.comments.length === 0) ? (
                      <p className="text-[10px] text-white uppercase font-black text-center py-10 tracking-[0.4em]">NO_RATIONALES_LOGGED</p>
                    ) : (
                      prop.comments.map((comment: any, idx: number) => (
                        <div key={idx} className="p-5 bg-white/5 rounded-xl border border-white/10 space-y-3 shadow-lg hover:border-primary/40 transition-all">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full ${comment.vote_stance === 'YES' ? 'bg-emerald-500' : 'bg-destructive'} shadow-lg`} />
                              <p className="font-mono text-primary">{shortenAddress(comment.author)}</p>
                            </div>
                            <p className="text-white tracking-widest">{new Date(comment.timestamp).toLocaleDateString()}</p>
                          </div>
                          <p className="text-[11px] text-white font-medium leading-relaxed pl-5 border-l-2 border-white/10 tracking-tight">{comment.text}</p>
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
        <AlertDialogContent className="exn-card border-secondary/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-3">
                <ShieldCheck className="w-6 h-6" /> VERIFY_PROPOSAL
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/15 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">TITLE</span>
                      <span className="text-white truncate max-w-[150px]">{newProp.title}</span>
                    </div>
                    {newProp.type === 1 && (
                      <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                        <span className="text-emerald-400">TX_VALUE</span>
                        <span className="text-emerald-400 font-mono">{Number(newProp.amount).toLocaleString()} EXN</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">NETWORK_FEE</span>
                      <span className="text-primary font-mono">10 EXN</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">PROPOSAL WILL BE BROADCAST TO THE NETWORK DAO FOR GLOBAL CONSENSUS.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCreate} className="exn-button flex-1 h-11 text-[10px] uppercase font-black bg-secondary">CONFIRM_BROADCAST</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Vote Review */}
      <AlertDialog open={showVoteReview} onOpenChange={setShowVoteReview}>
        <AlertDialogContent className="exn-card border-primary/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" /> VERIFY_VOTE
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/15 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">STANCE</span>
                      <span className={votingOn?.support ? "text-emerald-500" : "text-destructive"}>
                        {votingOn?.support ? 'YES_SUPPORT' : 'NO_REJECT'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">WEIGHT</span>
                      <span className="text-primary font-mono">{userStakeWeight.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">YOUR CONSENSUS WEIGHT WILL BE PERMANENTLY RECORDED ON THE NETWORK LEDGER.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmVote} className="exn-button flex-1 h-11 text-[10px] uppercase font-black">CONFIRM_VOTE</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Execute Review */}
      <AlertDialog open={!!executingProposal} onOpenChange={() => setExecutingProposal(null)}>
        <AlertDialogContent className="exn-card border-emerald-500/60 bg-black/95 p-0 overflow-hidden max-w-sm">
          <div className="p-8 space-y-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-3">
                <Zap className="w-6 h-6" /> VERIFY_EXECUTION
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6 pt-4">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/15 space-y-4 shadow-xl">
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">PROPOSAL_ID</span>
                      <span className="text-white font-mono">#{executingProposal?.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                      <span className="text-white">CONSENSUS</span>
                      <span className="text-emerald-400">PASSED_ENACTING</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-white uppercase leading-relaxed font-black tracking-tight">ENACTING THIS PROPOSAL WILL PERMANENTLY TRIGGER THE ASSOCIATED ON-CHAIN ACTIONS.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-4 pt-2">
              <AlertDialogCancel className="exn-button-outline flex-1 h-11 text-[10px] uppercase font-black border-white/20 text-white">ABORT</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExecute} className="bg-emerald-500 text-black flex-1 h-11 text-[10px] uppercase font-black rounded-xl hover:opacity-90 shadow-lg">CONFIRM_ENACT</AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
