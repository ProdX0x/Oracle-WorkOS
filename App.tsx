
import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Calendar as CalendarIcon, Users, Settings, MessageSquare, Briefcase, Video, Send, LogOut, LayoutDashboard } from 'lucide-react';
import AIPulse from './components/AIPulse';
import ProjectBoard from './components/ProjectBoard';
import VirtualRoom from './components/VirtualRoom';
import CalendarView from './components/CalendarView';
import TeamDashboard from './components/TeamDashboard';
import { INITIAL_TASKS, INITIAL_MEETINGS, USERS } from './constants';
import { Sector, Task, Meeting, User, ChatMessage, AnalysisHistoryItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workspace' | 'calendar' | 'video'>('dashboard');
  const [activeSector, setActiveSector] = useState<Sector>(Sector.GENERAL);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // -- PERSISTANCE DES DONNÉES --

  // Tâches
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('oracle_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  // Réunions
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('oracle_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  // Historique IA
  const [aiHistory, setAiHistory] = useState<AnalysisHistoryItem[]>(() => {
    const saved = localStorage.getItem('oracle_ai_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('oracle_chat');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', senderId: 'u2', text: "J'ai pushé les modifs de la carte 3D. @Kiki tu peux check ?", timestamp: new Date(Date.now() - 3600000).toISOString(), sector: Sector.DEV },
      { id: 'm2', senderId: 'u1', text: "Ça marche, je regarde ça avant la réunion de midi.", timestamp: new Date(Date.now() - 1800000).toISOString(), sector: Sector.DEV }
    ];
  });
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sauvegarde automatique
  useEffect(() => { localStorage.setItem('oracle_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('oracle_meetings', JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem('oracle_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('oracle_ai_history', JSON.stringify(aiHistory)); }, [aiHistory]);

  // Scroll automatique du chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;
    
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toISOString(),
      sector: activeSector
    };

    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const getUserById = (id: string) => USERS.find(u => u.id === id);

  // -- ÉCRAN DE LOGIN / SÉLECTION UTILISATEUR --
  if (!currentUser) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl shadow-2xl z-10 max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <LayoutGrid size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Oracle WorkOS</h1>
            <p className="text-gray-400">Identifiez-vous pour accéder à l'espace de travail</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/50 transition-all flex flex-col items-center gap-3"
              >
                <div className="relative">
                   <img src={user.avatar} className="w-16 h-16 rounded-full group-hover:scale-105 transition-transform" alt={user.name} />
                   <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-colors"></div>
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filtrage des messages par secteur (ou général)
  const displayedMessages = activeSector === Sector.GENERAL 
    ? chatMessages 
    : chatMessages.filter(m => m.sector === activeSector || !m.sector);

  return (
    <div className="w-screen h-screen bg-black text-white flex overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 border-r border-white/10 flex flex-col bg-black/50 backdrop-blur-xl p-4 gap-2 z-50">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <span className="hidden md:block font-bold text-lg tracking-tight">Oracle WorkOS</span>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2 hidden md:block">Navigation</div>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={18} />
            <span className="hidden md:block">Mon Espace</span>
          </button>

          <button 
            onClick={() => setActiveTab('workspace')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'workspace' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Briefcase size={18} />
            <span className="hidden md:block">Workspace</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('video')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'video' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Video size={18} />
            <span className="hidden md:block">Meet Room</span>
          </button>
          
          <button 
             onClick={() => setActiveTab('calendar')}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-white/10 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <CalendarIcon size={18} />
            <span className="hidden md:block">Calendrier</span>
          </button>
        </div>

        {activeTab === 'workspace' && (
          <div className="mt-8 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2 hidden md:block">Secteurs</div>
            {Object.values(Sector).map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeSector === sector ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white'}`}
              >
                <div className={`w-2 h-2 rounded-full ${activeSector === sector ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                <span className="hidden md:block truncate">{sector}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs text-gray-500 uppercase font-semibold hidden md:block">Profil</span>
            <button onClick={() => setCurrentUser(null)} title="Se déconnecter" className="text-gray-500 hover:text-red-400">
               <LogOut size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-2 bg-white/5 p-2 rounded-xl border border-white/5">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="Profile" />
            <div className="hidden md:block overflow-hidden">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-xs text-gray-500 truncate">{currentUser.role}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]"></div>

        <div className="flex-1 p-4 md:p-8 flex flex-col gap-6 z-10 overflow-hidden relative w-full lg:w-2/3">
          
          {activeTab === 'dashboard' && (
            <TeamDashboard 
              currentUser={currentUser}
              tasks={tasks}
              meetings={meetings}
            />
          )}

          {activeTab === 'workspace' && (
            <ProjectBoard 
              tasks={tasks} 
              sector={activeSector} 
              setTasks={setTasks} 
              currentUser={currentUser}
            />
          )}

          {activeTab === 'video' && (
            <div className="h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Salle de Réunion Virtuelle</h2>
              <div className="flex-1">
                <VirtualRoom />
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <CalendarView 
              tasks={tasks} 
              meetings={meetings}
              onMoveTask={(taskId, newDate) => {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, deadline: newDate } : t));
              }}
              onMoveMeeting={(meetingId, newDate) => {
                setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, date: newDate } : m));
              }}
              onAddMeeting={(meeting) => setMeetings([...meetings, meeting])}
            />
          )}
        </div>

        {/* Right Panel - AI & Chat */}
        <aside className="hidden lg:flex w-96 flex-col gap-6 p-8 border-l border-white/10 bg-black/20 backdrop-blur-md z-20">
          <div className="h-[45%]">
             <AIPulse 
               tasks={tasks} 
               history={aiHistory}
               setHistory={setAiHistory}
             />
          </div>
          
          <div className="flex-1 flex flex-col glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare size={18} className="text-green-400" />
                Team Chat
              </h3>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">{activeSector}</span>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2 mb-2">
              {displayedMessages.map(msg => {
                const sender = getUserById(msg.senderId);
                const isMe = msg.senderId === currentUser.id;
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img src={sender?.avatar} className="w-8 h-8 rounded-full mt-1" alt={sender?.name} />
                    <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
                      <div className={`flex items-baseline justify-between ${isMe ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-medium text-gray-200">{sender?.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm inline-block text-left p-2 rounded-lg mt-1 ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-gray-300 rounded-tl-none'}`}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {displayedMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-10">
                  Aucun message dans ce secteur.
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/10">
               <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                 <button className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                   <Briefcase size={16} />
                 </button>
                 <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message pour #${activeSector}...`}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={14} />
                  </button>
               </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;
