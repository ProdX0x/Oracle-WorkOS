
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, History, Clock, XCircle, Maximize2, X, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Task, AIAnalysisResult, AnalysisHistoryItem } from '../types';
import { analyzeProjectProgress } from '../services/geminiService';

interface AIPulseProps {
  tasks: Task[];
  history: AnalysisHistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<AnalysisHistoryItem[]>>;
}

const AIPulse: React.FC<AIPulseProps> = ({ tasks, history, setHistory }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // État pour la fenêtre modale

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeProjectProgress(tasks);
      const resultWithDate: AnalysisHistoryItem = { ...result, date: new Date().toISOString() };
      
      setAnalysis(result);
      setHistory(prev => [resultWithDate, ...prev]); // Persistance via App.tsx
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Une erreur est survenue lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: AnalysisHistoryItem) => {
    setAnalysis(item);
    setError(null);
  };

  const renderTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch(trend) {
      case 'up': return <TrendingUp size={16} className="text-green-400" />;
      case 'down': return <TrendingDown size={16} className="text-red-400" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  // Composant interne pour afficher le contenu du rapport (réutilisé en petit et grand format)
  const ReportContent = ({ isFullSize = false }) => {
    if (!analysis) return null;

    return (
      <div className={`flex flex-col gap-6 ${isFullSize ? 'h-full' : ''}`}>
        {/* KPIs Section */}
        {analysis.kpis && analysis.kpis.length > 0 && (
           <div className={`grid ${isFullSize ? 'grid-cols-3 gap-6' : 'grid-cols-3 gap-2'}`}>
             {analysis.kpis.map((kpi, idx) => (
               <div key={idx} className={`glass-panel rounded-xl flex flex-col items-center justify-center text-center ${isFullSize ? 'p-6' : 'p-2 py-3'}`}>
                 <div className={`${isFullSize ? 'text-sm mb-2' : 'text-[10px] mb-1'} text-gray-400 line-clamp-1`} title={kpi.label}>{kpi.label}</div>
                 <div className={`${isFullSize ? 'text-3xl' : 'text-lg'} font-bold text-white mb-1 leading-none`}>{kpi.value}</div>
                 <div className="flex items-center gap-1 text-xs">
                   {renderTrendIcon(kpi.trend)}
                 </div>
               </div>
             ))}
           </div>
        )}

        {/* Summary Section */}
        <div className="glass-panel p-4 rounded-xl shrink-0">
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-semibold">État des lieux</h3>
          <p className={`${isFullSize ? 'text-lg' : 'text-xs'} leading-relaxed text-gray-200 line-clamp-4 hover:line-clamp-none transition-all`}>
            {analysis.summary}
          </p>
        </div>

        <div className={`grid ${isFullSize ? 'grid-cols-2 gap-6 flex-1' : 'grid-cols-1 gap-4'}`}>
           {/* Chart Section */}
           <div className={`glass-panel p-4 rounded-xl flex flex-col ${isFullSize ? 'min-h-[300px]' : 'h-48'}`}>
              <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold">Avancement</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.chartData} layout="vertical" margin={{ left: isFullSize ? 0 : 0, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={isFullSize ? 150 : 80} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }} 
                      interval={0}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      cursor={{fill: '#ffffff10'}}
                    />
                    <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={isFullSize ? 24 : 12}>
                      {analysis.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Risks & Next Steps (Shown fully only in maximized view or if space permits) */}
           {isFullSize && (
             <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar">
               {/* Risks */}
               <div className="glass-panel p-4 rounded-xl border-l-4 border-red-500 shrink-0">
                 <div className="flex items-center gap-2 mb-3">
                   <AlertTriangle size={18} className="text-red-400" />
                   <h3 className="font-semibold">Risques Détectés</h3>
                 </div>
                 <ul className="space-y-2">
                   {analysis.risks.map((risk, i) => (
                     <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                       {risk}
                     </li>
                   ))}
                 </ul>
               </div>

               {/* Next Steps */}
               <div className="glass-panel p-4 rounded-xl border-l-4 border-green-500 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                   <CheckCircle size={18} className="text-green-400" />
                   <h3 className="font-semibold">Plan d'action</h3>
                 </div>
                 <ul className="space-y-2">
                   {analysis.nextSteps.map((step, i) => (
                     <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                       {step}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* --- MINIMIZED VIEW (SIDEBAR) --- */}
      <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-white/10 p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Header Compact */}
        <div className="flex justify-between items-center mb-4 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Oracle AI
            </h2>
          </div>
          <div className="flex gap-1">
             <button
               onClick={() => setIsExpanded(true)}
               className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-gray-300 hover:text-white"
               title="Agrandir le rapport"
             >
               <Maximize2 size={16} />
             </button>
             <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-xs font-medium disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
              <span className="hidden xl:inline">{loading ? '...' : 'Générer'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar z-10 mb-2">
          {!analysis && !loading && !error && history.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
              <Sparkles className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-xs">Cliquez sur Générer pour lancer l'analyse.</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
               <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-xs text-purple-300 animate-pulse text-center">Analyse intelligente en cours...</p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
               <XCircle className="w-8 h-8 text-red-400 mb-2" />
               <p className="text-xs text-red-300 mb-2">{error}</p>
               <button onClick={handleAnalyze} className="text-xs underline hover:text-white">Réessayer</button>
            </div>
          )}

          {analysis && !loading && !error && (
             <ReportContent isFullSize={false} />
          )}
        </div>

        {/* Compact Footer for History (Replacing large list) */}
        {history.length > 0 && (
          <div className="shrink-0 pt-3 border-t border-white/10 z-10">
            <button 
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-2">
                 <History size={14} className="text-blue-400" />
                 <div className="flex flex-col items-start">
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Historique</span>
                    <span className="text-xs text-gray-200">
                      {history.length} rapport{history.length > 1 ? 's' : ''} disponible{history.length > 1 ? 's' : ''}
                    </span>
                 </div>
              </div>
              <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* --- MAXIMIZED MODAL (PORTAL) --- */}
      {isExpanded && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-200">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsExpanded(false)}></div>
           
           {/* Modal Container */}
           <div className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden">
              
              {/* Left Sidebar: History */}
              <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col hidden md:flex">
                 <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <History className="text-blue-400" />
                       Historique
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{history.length} rapports générés</p>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {history.map((item, idx) => (
                       <button
                          key={idx}
                          onClick={() => loadFromHistory(item)}
                          className={`w-full text-left p-4 rounded-xl border transition-all group ${analysis === item ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                       >
                          <div className="flex justify-between items-center mb-2">
                             <span className={`text-xs font-semibold ${analysis === item ? 'text-blue-400' : 'text-gray-400'}`}>
                                {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                             </span>
                             <span className="text-[10px] text-gray-600 bg-black/30 px-2 py-0.5 rounded">
                                {new Date(item.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'})}
                             </span>
                          </div>
                          <div className="text-sm text-gray-300 line-clamp-2 leading-snug group-hover:text-white">
                             {item.summary}
                          </div>
                       </button>
                    ))}
                    {history.length === 0 && (
                       <div className="text-center text-gray-500 py-10">Aucun historique disponible</div>
                    )}
                 </div>
              </div>

              {/* Right Main Content */}
              <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-black relative">
                 {/* Header */}
                 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-purple-500/20 rounded-xl">
                          <BrainCircuit size={28} className="text-purple-400" />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-white">Rapport d'Analyse IA</h2>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                             <span>Oracle AI Analyst</span>
                             {analysis && (
                                <>
                                 <span>•</span>
                                 <span className="text-blue-400">Généré le {new Date(analysis.date || new Date()).toLocaleDateString()}</span>
                                </>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button
                          onClick={handleAnalyze}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                       >
                          {loading ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                          {loading ? 'Analyse...' : 'Nouvelle Analyse'}
                       </button>
                       <button 
                          onClick={() => setIsExpanded(false)}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                       >
                          <X size={24} />
                       </button>
                    </div>
                 </div>

                 {/* Scrollable Content */}
                 <div className="flex-1 overflow-y-auto p-8 relative">
                    {loading ? (
                       <div className="h-full flex flex-col items-center justify-center">
                          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                          <h3 className="text-xl font-semibold text-white mb-2">Analyse de votre projet en cours...</h3>
                          <p className="text-gray-400">L'IA examine vos tâches, les délais et les risques potentiels.</p>
                       </div>
                    ) : analysis ? (
                       <div className="max-w-5xl mx-auto pb-10">
                          <ReportContent isFullSize={true} />
                       </div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <BrainCircuit size={64} className="mb-4 opacity-20" />
                          <p className="text-lg">Sélectionnez un rapport dans l'historique ou lancez une nouvelle analyse.</p>
                       </div>
                    )}
                 </div>
              </div>

           </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AIPulse;
