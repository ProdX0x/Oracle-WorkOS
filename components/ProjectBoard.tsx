
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Sector, User, UserRole } from '../types';
import { Calendar as CalendarIcon, Clock, Paperclip, Plus, Send, X, Activity, User as UserIcon, FileText, Trash2, AlertTriangle, CheckSquare, Edit, Save, Lock } from 'lucide-react';
import { USERS } from '../constants';

interface ProjectBoardProps {
  tasks: Task[];
  sector: Sector;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: User;
}

const ProjectBoard: React.FC<ProjectBoardProps> = ({ tasks, sector, setTasks, currentUser }) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Permissions Logic
  const canCreate = currentUser.systemRole !== UserRole.VISITOR;
  const canEdit = currentUser.systemRole !== UserRole.VISITOR;
  const canDelete = currentUser.systemRole === UserRole.ADMIN;

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    // Utilise le secteur par défaut de l'utilisateur, ou le secteur actuel de la vue, ou DEV par défaut
    sector: currentUser.defaultSector || (sector === Sector.GENERAL ? Sector.DEV : sector),
    status: TaskStatus.TODO,
    deadline: new Date().toISOString().split('T')[0],
    assignee: USERS[0]
  });

  const filteredTasks = sector === Sector.GENERAL 
    ? tasks 
    : tasks.filter(t => t.sector === sector);

  const columns = Object.values(TaskStatus);

  // Initialize edit form when a task is selected
  useEffect(() => {
    if (selectedTask) {
      setEditForm({
        title: selectedTask.title,
        description: selectedTask.description,
        assignee: selectedTask.assignee,
        deadline: selectedTask.deadline,
        status: selectedTask.status
      });
      setIsEditing(false); // Reset edit mode on new selection
    }
  }, [selectedTask]);

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || !canEdit) {
      if (!canEdit) setNotification("Mode lecture seule : modification interdite.");
      return;
    }

    setTasks(prev => prev.map(t => 
      t.id === draggedTask ? { 
        ...t, 
        status, 
        history: [...t.history, { 
          id: `h${Date.now()}`, 
          userId: currentUser.id, 
          type: 'status_change', 
          content: `Passé en ${status}`, 
          timestamp: new Date().toISOString() 
        }] 
      } : t
    ));
    setDraggedTask(null);
  };

  const handleNotify = (e: React.MouseEvent, userName: string) => {
    e.stopPropagation();
    setNotification(`Notification envoyée à @${userName}`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteTask = () => {
    if (selectedTask && canDelete) {
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setSelectedTask(null);
      setShowDeleteConfirm(false);
      setNotification("Tâche supprimée avec succès");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignee) return;

    const task: Task = {
      id: `t${Date.now()}`,
      title: newTask.title,
      description: newTask.description || '',
      sector: newTask.sector || Sector.DEV,
      status: newTask.status || TaskStatus.TODO,
      deadline: newTask.deadline || new Date().toISOString(),
      assignee: newTask.assignee,
      history: [
        {
          id: `h${Date.now()}`,
          userId: currentUser.id,
          type: 'creation',
          content: 'Tâche créée',
          timestamp: new Date().toISOString()
        }
      ]
    };

    setTasks(prev => [...prev, task]);
    setIsCreateModalOpen(false);
    setNotification("Nouvelle tâche créée");
    setTimeout(() => setNotification(null), 3000);
    
    // Reset form with default sector logic
    setNewTask({
      title: '',
      description: '',
      sector: currentUser.defaultSector || (sector === Sector.GENERAL ? Sector.DEV : sector),
      status: TaskStatus.TODO,
      deadline: new Date().toISOString().split('T')[0],
      assignee: USERS[0]
    });
  };

  const handleSaveEdit = () => {
    if (!selectedTask || !editForm.title || !canEdit) return;

    setTasks(prev => prev.map(t => {
      if (t.id === selectedTask.id) {
        // Check for changes to log in history
        const newHistory = [...t.history];
        if (t.status !== editForm.status) {
           newHistory.push({
             id: `h${Date.now()}-status`,
             userId: currentUser.id,
             type: 'status_change',
             content: `Passé en ${editForm.status}`,
             timestamp: new Date().toISOString()
           });
        }
        if (t.title !== editForm.title || t.description !== editForm.description) {
           newHistory.push({
             id: `h${Date.now()}-edit`,
             userId: currentUser.id,
             type: 'edit',
             content: `Détails modifiés`,
             timestamp: new Date().toISOString()
           });
        }
        if (t.assignee.id !== editForm.assignee?.id) {
            newHistory.push({
             id: `h${Date.now()}-assign`,
             userId: currentUser.id,
             type: 'edit',
             content: `Réassigné à ${editForm.assignee?.name}`,
             timestamp: new Date().toISOString()
           });
        }

        const updatedTask = {
          ...t,
          title: editForm.title || t.title,
          description: editForm.description || '',
          assignee: editForm.assignee || t.assignee,
          deadline: editForm.deadline || t.deadline,
          status: editForm.status || t.status,
          history: newHistory
        };
        
        // Update selected task immediately so UI reflects changes
        setSelectedTask(updatedTask);
        return updatedTask;
      }
      return t;
    }));

    setIsEditing(false);
    setNotification("Modifications enregistrées");
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-green-500/20 border-green-500/30 text-green-400';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case TaskStatus.REVIEW: return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getUserById = (id: string) => USERS.find(u => u.id === id);

  return (
    <div className="h-full flex flex-col relative">
       {notification && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{sector}</h2>
        <div className="flex -space-x-2">
          {USERS.map(u => (
            <img key={u.id} src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border-2 border-black" title={u.name} />
          ))}
          {canCreate && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map(status => (
          <div 
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="flex flex-col h-full bg-white/5 rounded-2xl p-3 border border-white/5"
          >
            <div className={`text-xs font-semibold uppercase tracking-wider mb-4 px-2 py-1 rounded w-fit ${getStatusColor(status)}`}>
              {status}
            </div>
            
            <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
              {filteredTasks.filter(t => t.status === status).map(task => (
                <div 
                  key={task.id}
                  draggable={canEdit}
                  onDragStart={() => setDraggedTask(task.id)}
                  onClick={() => setSelectedTask(task)}
                  className={`glass-panel p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group relative ${!canEdit ? 'cursor-default' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">{task.sector}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-2 leading-tight">{task.title}</h4>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <img src={task.assignee.avatar} className="w-5 h-5 rounded-full" />
                      <span className="text-xs text-gray-400">{task.assignee.name}</span>
                    </div>
                    <div 
                      className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-md border border-white/5 hover:bg-white/10 transition-colors"
                      title={`Échéance : ${new Date(task.deadline).toLocaleDateString('fr-FR', { dateStyle: 'full' })}`}
                    >
                       <Clock size={12} className="text-blue-400" />
                       <span>{new Date(task.deadline).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}</span>
                    </div>
                  </div>
                </div>
              ))}
              {canCreate && (
                <button 
                  onClick={() => {
                    setNewTask(prev => ({...prev, status}));
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full py-2 border border-dashed border-white/10 rounded-xl text-gray-500 text-sm hover:border-white/20 hover:text-gray-300 transition-colors"
                >
                  + Nouvelle Tâche
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Details Side Panel */}
      {selectedTask && (
        <div className="absolute inset-0 z-40 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTask(null)}
          ></div>
          <div className="relative w-full md:w-[480px] bg-gray-900/95 border-l border-white/10 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Panel Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start">
              <div className="flex-1 mr-4">
                {isEditing ? (
                  <select 
                    className="bg-black/40 text-white text-xs p-1 rounded border border-white/20 mb-2"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value as TaskStatus})}
                  >
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                )}
                
                {isEditing ? (
                  <input 
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-black/20 border border-white/20 rounded px-2 py-1 mt-2 text-xl font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <h2 className="text-2xl font-bold mt-3 leading-snug">{selectedTask.title}</h2>
                )}

                <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                  <span>{selectedTask.sector}</span>
                  <span>•</span>
                  <Clock size={14} />
                  {isEditing ? (
                    <input 
                      type="date"
                      value={editForm.deadline}
                      onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                      className="bg-black/20 border border-white/20 rounded px-2 py-0.5 text-xs text-white"
                    />
                  ) : (
                    <span>Echéance : {new Date(selectedTask.deadline).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* EDIT BUTTON LOGIC */}
                {canEdit ? (
                  isEditing ? (
                    <button 
                      onClick={handleSaveEdit}
                      className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                      title="Enregistrer"
                    >
                      <Save size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-blue-500/10 text-blue-400 rounded-full hover:bg-blue-500/20 transition-colors"
                      title="Modifier"
                    >
                      <Edit size={20} />
                    </button>
                  )
                ) : (
                   <div className="p-2 text-gray-500" title="Lecture seule">
                     <Lock size={20} />
                   </div>
                )}
                
                {/* DELETE BUTTON LOGIC */}
                {canDelete && (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors"
                    title="Supprimer la tâche"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              {/* Assignee Section */}
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                     <div className="flex-1">
                        <label className="text-xs text-gray-500 block mb-1">Assigné à</label>
                        <select 
                           className="bg-black/40 text-white text-sm p-1.5 rounded border border-white/20 w-full"
                           value={editForm.assignee?.id}
                           onChange={(e) => setEditForm({...editForm, assignee: USERS.find(u => u.id === e.target.value)})}
                        >
                           {USERS.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                           ))}
                        </select>
                     </div>
                  ) : (
                    <>
                      <img src={selectedTask.assignee.avatar} className="w-10 h-10 rounded-full" alt="Assignee" />
                      <div>
                        <div className="text-xs text-gray-400">Assigné à</div>
                        <div className="font-medium">{selectedTask.assignee.name}</div>
                      </div>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={(e) => handleNotify(e, selectedTask.assignee.name)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Send size={14} />
                    Notifier
                  </button>
                )}
              </div>

              {/* Description Section */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3 flex items-center gap-2">
                  <FileText size={16} /> Description
                </h3>
                {isEditing ? (
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full h-32 bg-black/20 border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="text-gray-300 leading-relaxed p-4 bg-white/5 rounded-xl border border-white/5 text-sm whitespace-pre-wrap">
                    {selectedTask.description}
                  </div>
                )}
              </div>

              {/* History / Activity Feed */}
              <div>
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-4 flex items-center gap-2">
                  <Activity size={16} /> Historique des modifications
                </h3>
                
                <div className="relative border-l border-white/10 ml-2 space-y-6">
                  {selectedTask.history && selectedTask.history.length > 0 ? (
                    selectedTask.history.slice().reverse().map((activity) => {
                      const user = getUserById(activity.userId);
                      return (
                        <div key={activity.id} className="relative pl-6">
                          <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-gray-800 border border-gray-600"></div>
                          <div className="flex items-start gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-200">{user?.name || 'Utilisateur inconnu'}</span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {new Date(activity.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                            {activity.type === 'status_change' && <span className="text-blue-400 text-xs font-bold uppercase mr-2">Status</span>}
                            {activity.type === 'creation' && <span className="text-green-400 text-xs font-bold uppercase mr-2">Nouveau</span>}
                            {activity.type === 'upload' && <span className="text-purple-400 text-xs font-bold uppercase mr-2">Fichier</span>}
                            {activity.type === 'edit' && <span className="text-yellow-400 text-xs font-bold uppercase mr-2">Edit</span>}
                            {activity.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="pl-6 text-sm text-gray-500 italic">Aucune activité récente.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur flex gap-2">
              <input 
                type="text" 
                placeholder="Ajouter un commentaire..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-gray-300">
                <Paperclip size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-sm text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer la tâche <span className="font-semibold text-white">"{selectedTask?.title}"</span> ? 
                Cette action est irréversible.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteTask}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
           <div className="bg-[#1a1b1e] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                   <CheckSquare className="text-blue-400" size={20} />
                   Nouvelle Tâche
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
             </div>

             <div className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Titre</label>
                   <input 
                      type="text" 
                      autoFocus
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white placeholder-gray-600"
                      placeholder="Ex: Refonte de la page d'accueil"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Description</label>
                   <textarea 
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 h-24 resize-none"
                      placeholder="Détails de la mission..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Assigné à</label>
                      <div className="relative">
                         <select 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                            value={newTask.assignee?.id}
                            onChange={(e) => setNewTask({...newTask, assignee: USERS.find(u => u.id === e.target.value)})}
                         >
                            {USERS.map(u => (
                               <option key={u.id} value={u.id} className="bg-gray-900 text-white">
                                  {u.name}
                               </option>
                            ))}
                         </select>
                         <div className="absolute right-3 top-2.5 pointer-events-none">
                            <UserIcon size={14} className="text-gray-400" />
                         </div>
                      </div>
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Deadline</label>
                       <input 
                          type="date"
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                          value={newTask.deadline}
                          onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                       />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Secteur</label>
                       <select 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                            value={newTask.sector}
                            onChange={(e) => setNewTask({...newTask, sector: e.target.value as Sector})}
                         >
                            {Object.values(Sector).map(s => (
                               <option key={s} value={s} className={`bg-gray-900 text-white ${s === currentUser.defaultSector ? 'font-bold text-blue-400' : ''}`}>
                                  {s}
                               </option>
                            ))}
                         </select>
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Statut Initial</label>
                       <select 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                            value={newTask.status}
                            onChange={(e) => setNewTask({...newTask, status: e.target.value as TaskStatus})}
                         >
                            {Object.values(TaskStatus).map(s => (
                               <option key={s} value={s} className="bg-gray-900 text-white">{s}</option>
                            ))}
                         </select>
                   </div>
                </div>
             </div>

             <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCreateTask}
                  disabled={!newTask.title}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Créer la tâche
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;