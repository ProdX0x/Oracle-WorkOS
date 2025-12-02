import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, History, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, AIAnalysisResult } from '../types';
import { analyzeProjectProgress } from '../services/geminiService';

interface AIPulseProps {
  tasks: Task[];
}

// Extension du type pour inclure la date dans l'historique local
interface AnalysisHistoryItem extends AIAnalysisResult {
  date: Date;
}

const AIPulse: React.FC<AIPulseProps> = ({ tasks }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeProjectProgress(tasks);
      const resultWithDate: AnalysisHistoryItem = { ...result, date: new Date() };
      
      setAnalysis(result);
      setHistory(prev => [resultWithDate, ...prev]);
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-3xl border border-white/10 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Oracle AI Analyst
          </h2>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-sm font-medium disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {loading ? 'Analyse...' : 'Générer'}
        </button>
      </div>

      {!analysis && !loading && !error && history.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
          <Sparkles className="w-16 h-16 mb-4 opacity-20" />
          <p>Cliquez pour demander à l'IA d'analyser l'avancement du projet Oracle Navigator.</p>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
           <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
           <p className="text-sm text-purple-300 animate-pulse">L'IA analyse les tâches, les délais et les risques...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
           <XCircle className="w-12 h-12 text-red-400 mb-3" />
           <p className="text-red-300 font-medium mb-2">Erreur d'analyse</p>
           <p className="text-xs text-gray-400 mb-4">{error}</p>
           <button 
             onClick={handleAnalyze}
             className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
           >
             Réessayer
           </button>
        </div>
      )}

      {analysis && !loading && !error && (
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 z-10 mb-4">
          {/* Summary Section */}
          <div className="glass-panel p-4 rounded-xl">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-2 font-semibold">État des lieux</h3>
            <p className="text-lg leading-relaxed">{analysis.summary}</p>
          </div>

          {/* KPIs Section */}
          {analysis.kpis && analysis.kpis.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {analysis.kpis.map((kpi, idx) => (
                <div key={idx} className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="text-xs text-gray-400 mb-1 line-clamp-1" title={kpi.label}>{kpi.label}</div>
                  <div className="text-xl font-bold text-white mb-1">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {renderTrendIcon(kpi.trend)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chart Section */}
          <div className="glass-panel p-4 rounded-xl h-64">
             <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 font-semibold">Avancement par Mission</h3>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={analysis.chartData} layout="vertical" margin={{ left: 20 }}>
                 <XAxis type="number" hide />
                 <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                  />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                 <Bar dataKey="progress" radius={[0, 10, 10, 0]} barSize={20}>
                    {analysis.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress === 100 ? '#10b981' : '#8b5cf6'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risks */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-red-500">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-400" />
                <h3 className="font-semibold">Risques Détectés</h3>
              </div>
              <ul className="space-y-2">
                {analysis.risks.map((risk, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="glass-panel p-4 rounded-xl border-l-4 border-green-500">
               <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-green-400" />
                <h3 className="font-semibold">Plan d'action</h3>
              </div>
              <ul className="space-y-2">
                {analysis.nextSteps.map((step, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5"></span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-auto border-t border-white/10 pt-4 z-10 bg-black/20 -mx-6 px-6 pb-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <History size={14} /> Historique des analyses
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
            {history.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => loadFromHistory(item)}
                className={`p-3 rounded-lg cursor-pointer transition-all border border-transparent ${analysis === item ? 'bg-white/10 border-white/20' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-blue-300">
                    <Clock size={10} />
                    <span>{item.date.toLocaleDateString('fr-FR')} à {item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                  {idx === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">Récent</span>}
                </div>
                <p className="text-xs text-gray-400 line-clamp-1">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPulse;