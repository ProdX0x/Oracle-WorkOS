
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, MessageSquare, BrainCircuit, User as UserIcon, LogOut, Send, Plus } from 'lucide-react';
import { User, Task, Meeting, ChatMessage, AnalysisHistoryItem, Sector, TaskStatus } from '../types';
import TeamDashboard from './TeamDashboard';
import AIPulse from './AIPulse';

interface MobileLayoutProps {
  currentUser: User;
  tasks: Task[];
  meetings: Meeting[];
  chatMessages: ChatMessage[];
  aiHistory: AnalysisHistoryItem[];
  setAiHistory: React.Dispatch<React.SetStateAction<AnalysisHistoryItem[]>>;
  onSendMessage: (text: string) => void;
  onLogout: () => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  currentUser, 
  tasks, 
  meetings, 
  chatMessages, 
  aiHistory, 
  setAiHistory, 
  onSendMessage, 
  onLogout,
  setTasks
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'chat' | 'ai'>('home');
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="h-full overflow-y-auto pb-20 pt-16 bg-black">
             <TeamDashboard currentUser={currentUser} tasks={tasks} meetings={meetings} />
          </div>
        );
      
      case 'tasks':
        const myTasks = tasks.filter(t => t.assignee.id === currentUser.id);
        return (
          <div className="h-full overflow-y-auto pb-20 pt-16 px-4 bg-black">
            <h2 className="text-2xl font-bold text-white mb-4">Mes Tâches</h2>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <div className="text-gray-500 text-center py-10">Aucune tâche assignée.</div>
              ) : (
                myTasks.map(task => (
                  <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                         task.status === TaskStatus.DONE ? 'bg-green-500/20 text-green-400' : 
                         task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                       }`}>
                         {task.status}
                       </span>
                       <span className="text-xs text-gray-500">{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-medium text-white mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{task.description}</p>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-dashed border-white/20 rounded-xl text-gray-400 flex items-center justify-center gap-2">
               <Plus size={18} />
               Note rapide
            </button>
          </div>
        );

      case 'chat':
        return (
          <div className="h-full flex flex-col pt-16 pb-20 bg-black">
             <div className="flex-1 overflow-y-auto px-4 space-y-4">
               {chatMessages.map(msg => {
                 const isMe = msg.senderId === currentUser.id;
                 return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'}`}>
                        {!isMe && <div className="text-xs text-gray-400 mb-1">Collaborateur</div>}
                        <p className="text-sm">{msg.text}</p>
                        <div className="text-[10px] opacity-50 text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                   </div>
                 );
               })}
               <div ref={chatEndRef} />
             </div>
             <div className="p-4 bg-gray-900 border-t border-white/10 flex gap-2">
               <input 
                 type="text" 
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                 placeholder="Message..."
               />
               <button 
                 onClick={handleSend}
                 disabled={!newMessage.trim()}
                 className="p-2 bg-blue-600 rounded-full text-white disabled:opacity-50"
               >
                 <Send size={20} />
               </button>
             </div>
          </div>
        );

      case 'ai':
        return (
          <div className="h-full overflow-y-auto pb-20 pt-16 px-4 bg-black">
             <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
               <BrainCircuit className="text-purple-400" />
               Oracle AI
             </h2>
             <div className="h-[500px]">
               <AIPulse 
                 tasks={tasks} 
                 history={aiHistory} 
                 setHistory={setAiHistory} 
                 currentUser={currentUser} 
               />
             </div>
          </div>
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex flex-col">
       {/* Top Bar */}
       <div className="absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                <LayoutDashboard size={16} className="text-white" />
             </div>
             <span className="font-bold text-white tracking-tight">Oracle Mobile</span>
          </div>
          <button onClick={onLogout} className="p-2 bg-white/5 rounded-full text-gray-400">
             <LogOut size={18} />
          </button>
       </div>

       {/* Main Content */}
       <div className="flex-1 relative">
         {renderContent()}
       </div>

       {/* Bottom Navigation Bar */}
       <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0a0a0c] border-t border-white/10 flex justify-around items-center pb-4 z-50">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-500'}`}
          >
             <LayoutDashboard size={24} />
             <span className="text-[10px] font-medium">Accueil</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'tasks' ? 'text-blue-500' : 'text-gray-500'}`}
          >
             <CheckSquare size={24} />
             <span className="text-[10px] font-medium">Tâches</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'chat' ? 'text-blue-500' : 'text-gray-500'}`}
          >
             <MessageSquare size={24} />
             <span className="text-[10px] font-medium">Chat</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'ai' ? 'text-purple-500' : 'text-gray-500'}`}
          >
             <BrainCircuit size={24} />
             <span className="text-[10px] font-medium">IA</span>
          </button>
       </div>
    </div>
  );
};

export default MobileLayout;
