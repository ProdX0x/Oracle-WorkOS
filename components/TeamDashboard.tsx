
import React, { useState } from 'react';
import { Task, Meeting, User, TaskStatus, UserRole, Sector } from '../types';
import { CheckCircle2, Clock, Calendar as CalendarIcon, PieChart, AlertCircle, ArrowUpRight, Video, Users, Settings, Save, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TeamDashboardProps {
  currentUser: User;
  tasks: Task[];
  meetings: Meeting[];
  users?: User[]; // Liste dynamique des utilisateurs
  onUpdateUser?: (updatedUser: User) => void; // Fonction de mise à jour (Admin)
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ currentUser, tasks, meetings, users, onUpdateUser }) => {
  // Filtrer les données pour l'utilisateur connecté
  const myTasks = tasks.filter(t => t.assignee.id === currentUser.id);
  const myMeetings = meetings
    .filter(m => m.attendees.includes(currentUser.id))
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  // Gestion de l'admin
  const isAdmin = currentUser.systemRole === UserRole.ADMIN;
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState<Partial<User>>({});

  // Calcul des statistiques
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressTasks = myTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const reviewTasks = myTasks.filter(t => t.status === TaskStatus.REVIEW).length;
  const todoTasks = myTasks.filter(t => t.status === TaskStatus.TODO).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tâches urgentes (Deadline dépassée ou aujourd'hui/demain)
  const urgentTasks = myTasks.filter(t => {
    if (t.status === TaskStatus.DONE) return false;
    const deadline = new Date(t.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 2; // En retard ou moins de 2 jours
  });

  const chartData = [
    { name: 'À faire', value: todoTasks, color: '#9ca3af' },
    { name: 'En cours', value: inProgressTasks, color: '#3b82f6' },
    { name: 'En revue', value: reviewTasks, color: '#a855f7' },
    { name: 'Terminé', value: completedTasks, color: '#10b981' },
  ];

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUserForm(user);
  };

  const handleSaveUser = () => {
    if (onUpdateUser && editUserForm.id) {
        onUpdateUser(editUserForm as User);
        setEditingUserId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar pr-2">
      {/* Header Profile */}
      <div className="flex items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl border border-white/10">
        <div className="relative">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-black shadow-xl" />
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-black rounded-full"></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Bonjour, {currentUser.name} 👋</h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="bg-white/10 px-2 py-0.5 rounded text-sm">{currentUser.role}</span>
            <span>•</span>
            <span>Voici ton récapitulatif personnel</span>
          </p>
        </div>
        <div className="ml-auto flex gap-4 text-center">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 min-w-[100px]">
                <div className="text-3xl font-bold text-blue-400">{myTasks.length}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Missions</div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 min-w-[100px]">
                <div className="text-3xl font-bold text-green-400">{completionRate}%</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Complété</div>
            </div>
        </div>
      </div>

      {/* ADMIN PANEL (Only visible to Steve) */}
      {isAdmin && users && (
          <div className="mb-8 p-6 bg-gray-900/50 border border-yellow-500/20 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                  <Shield className="text-yellow-500" />
                  <h2 className="text-xl font-bold text-white">Gestion de l'Équipe (Admin)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map(user => (
                      <div key={user.id} className="bg-black/40 p-4 rounded-xl border border-white/10 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                              <img src={user.avatar} className="w-10 h-10 rounded-full" />
                              <div>
                                  <div className="font-bold">{user.name}</div>
                                  <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                              {editingUserId === user.id ? (
                                  <button onClick={handleSaveUser} className="ml-auto p-2 bg-green-500/20 text-green-400 rounded-lg">
                                      <Save size={16} />
                                  </button>
                              ) : (
                                  <button onClick={() => handleEditUser(user)} className="ml-auto p-2 bg-white/5 text-gray-400 hover:text-white rounded-lg">
                                      <Settings size={16} />
                                  </button>
                              )}
                          </div>
                          
                          {editingUserId === user.id ? (
                              <div className="space-y-2 text-sm">
                                  <div>
                                      <label className="text-xs text-gray-500 block">Rôle Système</label>
                                      <select 
                                          className="w-full bg-black border border-white/20 rounded p-1"
                                          value={editUserForm.systemRole}
                                          onChange={e => setEditUserForm({...editUserForm, systemRole: e.target.value as UserRole})}
                                      >
                                          {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-xs text-gray-500 block">Secteur</label>
                                      <select 
                                          className="w-full bg-black border border-white/20 rounded p-1"
                                          value={editUserForm.sector}
                                          onChange={e => setEditUserForm({...editUserForm, sector: e.target.value as Sector})}
                                      >
                                          {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                  </div>
                              </div>
                          ) : (
                              <div className="flex gap-2 text-xs">
                                  <span className={`px-2 py-0.5 rounded border ${user.systemRole === UserRole.ADMIN ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                                      {user.systemRole}
                                  </span>
                                  <span className="px-2 py-0.5 rounded border bg-white/5 border-white/10 text-gray-400">
                                      {user.sector || 'Sans secteur'}
                                  </span>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tasks & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Urgent Tasks Alert */}
          {urgentTasks.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg shrink-0">
                <AlertCircle className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-red-200 font-bold">Attention requise</h3>
                <p className="text-sm text-red-300/70 mb-2">Tu as {urgentTasks.length} tâche(s) qui arrivent à échéance ou sont en retard.</p>
                <div className="flex flex-wrap gap-2">
                  {urgentTasks.map(t => (
                    <span key={t.id} className="text-xs bg-red-500/20 text-red-200 px-2 py-1 rounded border border-red-500/20">
                      {t.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="text-blue-400" />
                Mes Tâches Actives
              </h2>
            </div>
            
            <div className="space-y-3">
              {myTasks.filter(t => t.status !== TaskStatus.DONE).length === 0 ? (
                 <div className="text-center py-10 text-gray-500">
                    <p>Aucune tâche active. Bon travail ! 🎉</p>
                 </div>
              ) : (
                myTasks.filter(t => t.status !== TaskStatus.DONE).map(task => (
                  <div key={task.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 transition-all flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' : 
                        task.status === TaskStatus.REVIEW ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <h4 className="font-medium text-gray-200 group-hover:text-white transition-colors">{task.title}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] uppercase font-bold tracking-wider bg-black/30 px-2 py-0.5 rounded text-gray-400">{task.sector}</span>
                           <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-900/30 text-blue-400' : 
                              task.status === TaskStatus.REVIEW ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-800 text-gray-400'
                           }`}>{task.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 text-right">
                       <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 bg-black/20 px-2 py-1 rounded">
                          <Clock size={12} />
                          {new Date(task.deadline).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Stats */}
        <div className="space-y-6">
          
          {/* Stats Chart */}
          <div className="glass-panel rounded-3xl p-6 h-64 flex flex-col">
             <h3 className="text-sm font-semibold uppercase text-gray-500 mb-4 flex items-center gap-2">
                <PieChart size={16} /> Répartition
             </h3>
             <div className="flex-1 -ml-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barSize={20}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 10, fill: '#9ca3af'}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        cursor={{fill: 'transparent'}}
                     />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Next Meetings */}
          <div className="glass-panel rounded-3xl p-6 flex-1">
            <h3 className="text-sm font-semibold uppercase text-gray-500 mb-4 flex items-center gap-2">
               <CalendarIcon size={16} /> Mon Planning
            </h3>
            
            <div className="space-y-4">
               {myMeetings.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">Rien de prévu.</div>
               ) : (
                  myMeetings.map(meeting => {
                    const isToday = new Date().toISOString().split('T')[0] === meeting.date;
                    return (
                       <div key={meeting.id} className={`p-3 rounded-xl border ${isToday ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
                          <div className="flex justify-between items-start mb-2">
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                                {isToday ? 'AUJOURD\'HUI' : new Date(meeting.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short'})}
                             </span>
                             <div className="p-1.5 bg-white/5 rounded-lg text-gray-400">
                                {meeting.type === 'video' ? <Video size={14} /> : <Users size={14} />}
                             </div>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{meeting.title}</h4>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                             <Clock size={12} />
                             {meeting.time}
                          </div>
                       </div>
                    );
                  })
               )}
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
