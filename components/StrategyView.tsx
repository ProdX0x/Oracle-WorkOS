
import React, { useState } from 'react';
import { Task, User, UserRole, TaskStatus } from '../types';
import { evaluateTaskStrategy } from '../services/geminiService';
import { Rocket, Hammer, BrainCircuit, RefreshCw, Filter, ArrowUpRight, AlertCircle, CheckCircle2, Circle, Target } from 'lucide-react';

interface StrategyViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: User;
}

const StrategyView: React.FC<StrategyViewProps> = ({ tasks, setTasks, currentUser }) => {
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'HIGH_IMPACT'>('ALL');

  const canAnalyze = currentUser.systemRole !== UserRole.VISITOR;

  const handleEvaluateTask = async (task: Task) => {
    if (!canAnalyze) return;
    
    setLoadingTasks(prev => new Set(prev).add(task.id));
    try {
      const evaluation = await evaluateTaskStrategy(task.title, task.description);
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, ...evaluation } : t
      ));
    } catch (error) {
      console.error("Failed to evaluate task", error);
    } finally {
      setLoadingTasks(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleEvaluateAll = async () => {
    if (!canAnalyze) return;
    
    const tasksToEvaluate = tasks.filter(t => !t.impactScore); // Seulement ceux qui n'ont pas de score
    
    for (const task of tasksToEvaluate) {
        await handleEvaluateTask(task);
        // Petit délai pour ne pas spammer l'API trop violemment
        await new Promise(r => setTimeout(r, 500)); 
    }
  };

  // Logic de filtrage
  const filteredTasks = tasks.filter(t => {
      if (filter === 'TODO') return t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS;
      if (filter === 'HIGH_IMPACT') return (t.impactScore || 0) >= 80;
      return true;
  }).sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0)); // Tri par impact décroissant par défaut

  const getImpactColor = (score?: number) => {
    if (score === undefined) return 'text-gray-600 bg-gray-800/50';
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 50) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  const getThemeColor = (theme?: string) => {
      if (!theme) return 'bg-gray-800 text-gray-500';
      if (theme.includes('Rev')) return 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20';
      if (theme.includes('UX') || theme.includes('Exp')) return 'bg-pink-900/40 text-pink-400 border border-pink-500/20';
      if (theme.includes('Tech') || theme.includes('Sec')) return 'bg-blue-900/40 text-blue-400 border border-blue-500/20';
      return 'bg-purple-900/40 text-purple-400 border border-purple-500/20';
  };

  return (
    <div className="h-full flex flex-col gap-6">
       {/* Header */}
       <div className="flex justify-between items-end p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
             <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="text-emerald-400" size={32} />
                Stratégie & Impact
             </h1>
             <p className="text-gray-400 max-w-xl">
                Analysez la pertinence de vos actions. Utilisez l'IA pour prioriser les tâches qui apportent le plus de valeur business (Impact) par rapport à leur coût (Effort).
             </p>
          </div>
          <div className="flex gap-3 relative z-10">
              {canAnalyze ? (
                <button 
                  onClick={handleEvaluateAll}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                >
                    <BrainCircuit size={18} />
                    Auto-Scoring IA
                </button>
              ) : (
                <div className="bg-white/5 px-4 py-2 rounded-xl text-gray-500 text-sm">Mode Visiteur</div>
              )}
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex items-center gap-4 px-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
             <button 
                onClick={() => setFilter('ALL')}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filter === 'ALL' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                Tout
             </button>
             <button 
                onClick={() => setFilter('TODO')}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${filter === 'TODO' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                À faire
             </button>
             <button 
                onClick={() => setFilter('HIGH_IMPACT')}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${filter === 'HIGH_IMPACT' ? 'bg-emerald-500/20 text-emerald-300 shadow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                <Rocket size={14} />
                Fort Impact
             </button>
          </div>
          <div className="ml-auto text-xs text-gray-500 uppercase font-semibold">
             {filteredTasks.length} Tâches
          </div>
       </div>

       {/* Data Grid */}
       <div className="flex-1 glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 border-b border-white/5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
             <div className="col-span-4 pl-2">Tâche / Résumé</div>
             <div className="col-span-2">Thème</div>
             <div className="col-span-2 text-center">Score Impact</div>
             <div className="col-span-1 text-center">Effort</div>
             <div className="col-span-2">IA Rationale</div>
             <div className="col-span-1 text-right pr-2">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
             {filteredTasks.map(task => {
                const isLoading = loadingTasks.has(task.id);
                const hasScore = task.impactScore !== undefined;

                return (
                   <div key={task.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center group">
                      
                      {/* Task Info */}
                      <div className="col-span-4 pl-2">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === TaskStatus.DONE ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <div>
                               <div className="font-medium text-sm text-white group-hover:text-blue-300 transition-colors">{task.title}</div>
                               <div className="text-xs text-gray-500 line-clamp-1">{task.description}</div>
                            </div>
                         </div>
                      </div>

                      {/* Theme */}
                      <div className="col-span-2">
                         {task.strategicTheme ? (
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${getThemeColor(task.strategicTheme)}`}>
                               {task.strategicTheme}
                            </span>
                         ) : (
                            <span className="text-gray-600 text-xs italic">-</span>
                         )}
                      </div>

                      {/* Impact Score */}
                      <div className="col-span-2 flex justify-center">
                         {hasScore ? (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getImpactColor(task.impactScore)}`}>
                               <Rocket size={14} />
                               <span className="font-bold text-sm">{task.impactScore}</span>
                            </div>
                         ) : (
                            <span className="text-gray-700">-</span>
                         )}
                      </div>

                      {/* Effort Score */}
                      <div className="col-span-1 flex justify-center">
                         {hasScore ? (
                            <div className="flex items-center gap-1 text-gray-400" title={`Effort: ${task.effortScore}/10`}>
                               <Hammer size={14} />
                               <span className="text-sm">{task.effortScore}</span>
                            </div>
                         ) : (
                             <span className="text-gray-700">-</span>
                         )}
                      </div>

                      {/* AI Rationale */}
                      <div className="col-span-2">
                         {task.aiRationale ? (
                            <div className="text-xs text-gray-400 italic leading-snug">"{task.aiRationale}"</div>
                         ) : (
                            <div className="h-1 w-10 bg-gray-800 rounded-full"></div>
                         )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex justify-end pr-2">
                         {canAnalyze && (
                            <button 
                                onClick={() => handleEvaluateTask(task)}
                                disabled={isLoading}
                                className={`p-2 rounded-lg transition-all ${hasScore ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-emerald-400 hover:bg-emerald-500/20'}`}
                                title={hasScore ? "Recalculer" : "Analyser avec l'IA"}
                            >
                               {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                            </button>
                         )}
                      </div>

                   </div>
                );
             })}
             
             {filteredTasks.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                   Aucune tâche ne correspond aux critères.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default StrategyView;
