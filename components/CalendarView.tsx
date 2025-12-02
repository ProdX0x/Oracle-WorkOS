import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Video, Users, Clock, Calendar as CalendarIcon, X, CheckCircle2 } from 'lucide-react';
import { Task, Meeting, User } from '../types';
import { USERS } from '../constants';

interface CalendarViewProps {
  tasks: Task[];
  meetings: Meeting[];
  onMoveTask: (taskId: string, newDate: string) => void;
  onMoveMeeting: (meetingId: string, newDate: string) => void;
  onAddMeeting: (meeting: Meeting) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, meetings, onMoveTask, onMoveMeeting, onAddMeeting }) => {
  // Initialize to November 2023 to match mock data
  const [currentDate, setCurrentDate] = useState(new Date(2023, 10, 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState<Partial<Meeting>>({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'video',
    title: ''
  });

  // State for Hover Preview
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // 0 = Sunday, 1 = Monday, etc. Adjusting so Monday is 0 for UI if needed, but standard US calendar starts Sunday
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'meeting') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    const dataString = e.dataTransfer.getData('text/plain');
    if (!dataString) return;

    const { id, type } = JSON.parse(dataString);
    
    // Construct new date string YYYY-MM-DD
    // Note: Month is 0-indexed in JS Date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const newDateStr = `${year}-${month}-${dayStr}`;

    if (type === 'task') {
      onMoveTask(id, newDateStr);
    } else if (type === 'meeting') {
      onMoveMeeting(id, newDateStr);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCreateMeeting = () => {
    if (!newMeetingData.title || !newMeetingData.date) return;
    
    const meeting: Meeting = {
      id: `m${Date.now()}`,
      title: newMeetingData.title,
      date: newMeetingData.date,
      time: newMeetingData.time || '10:00',
      type: newMeetingData.type as 'video' | 'person',
      attendees: ['u1'] // Default to current user for now
    };
    
    onAddMeeting(meeting);
    setIsModalOpen(false);
    setNewMeetingData({
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        type: 'video',
        title: ''
    });
  };

  // Hover Handlers
  const handleMouseEnter = (e: React.MouseEvent, dateStr: string) => {
    setHoveredDate(dateStr);
    updateTooltipPosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateTooltipPosition(e);
  };

  const handleMouseLeave = () => {
    setHoveredDate(null);
  };

  const updateTooltipPosition = (e: React.MouseEvent) => {
    // Offset slightly to not block the cursor
    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  const days = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  
  const totalDays = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);

  // Helper to format date for comparison
  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Prepare data for tooltip if active
  const renderTooltip = () => {
    if (!hoveredDate) return null;

    const dayTasks = tasks.filter(t => t.deadline === hoveredDate);
    const dayMeetings = meetings.filter(m => m.date === hoveredDate);

    if (dayTasks.length === 0 && dayMeetings.length === 0) return null;

    const formattedDate = new Date(hoveredDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <div 
        className="fixed z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-64 pointer-events-none animate-in fade-in zoom-in duration-200"
        style={{ top: tooltipPos.y, left: tooltipPos.x }}
      >
        <h4 className="text-sm font-bold text-white mb-3 capitalize border-b border-white/10 pb-2">
          {formattedDate}
        </h4>
        
        <div className="space-y-3">
          {dayMeetings.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold text-purple-400 mb-1 flex items-center gap-1">
                <Video size={10} /> Réunions
              </div>
              <div className="space-y-1">
                {dayMeetings.map(m => (
                  <div key={m.id} className="text-xs text-gray-300 flex justify-between items-center bg-white/5 p-1.5 rounded">
                    <span>{m.title}</span>
                    <span className="font-mono text-gray-500 text-[10px]">{m.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dayTasks.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-400 mb-1 flex items-center gap-1">
                <CheckCircle2 size={10} /> Tâches (Deadline)
              </div>
              <div className="space-y-1">
                {dayTasks.map(t => (
                  <div key={t.id} className="text-xs text-gray-300 bg-white/5 p-1.5 rounded flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Terminé' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden border border-white/5">
      
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-sm z-10">
        <h2 className="text-2xl font-bold capitalize text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {monthName}
        </h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all hidden sm:block"
          >
            Aujourd'hui
          </button>

          <div className="flex items-center bg-black/40 rounded-full border border-white/10 p-1">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1"></div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
        {days.map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-5 overflow-hidden">
        {/* Empty cells for previous month */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-white/5 bg-white/[0.02]"></div>
        ))}

        {/* Days */}
        {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const dateStr = getDateString(day);
            const dayTasks = tasks.filter(t => t.deadline === dateStr);
            const dayMeetings = meetings.filter(m => m.date === dateStr);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div 
                key={day}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                onMouseEnter={(e) => handleMouseEnter(e, dateStr)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={`border-r border-b border-white/5 p-2 relative group hover:bg-white/5 transition-colors ${isToday ? 'bg-blue-500/5' : ''}`}
              >
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
                    {day}
                </span>

                <div className="space-y-1 overflow-y-auto max-h-[100px] no-scrollbar">
                    {dayMeetings.map(meeting => (
                         <div 
                            key={meeting.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, meeting.id, 'meeting')}
                            className="bg-gradient-to-r from-purple-500/80 to-pink-600/80 text-white text-[10px] p-1.5 rounded flex items-center gap-1 cursor-grab active:cursor-grabbing shadow-lg"
                            title={meeting.title}
                         >
                            {meeting.type === 'video' ? <Video size={10} /> : <Users size={10} />}
                            <span className="truncate font-medium">{meeting.time} {meeting.title}</span>
                         </div>
                    ))}
                    
                    {dayTasks.map(task => (
                        <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id, 'task')}
                            className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] p-1.5 rounded flex items-center gap-1 cursor-grab active:cursor-grabbing hover:bg-blue-500/30 transition-colors"
                            title={`Deadline: ${task.title}`}
                        >
                           <Clock size={10} />
                           <span className="truncate">{task.title}</span>
                        </div>
                    ))}
                </div>
                
                {/* Plus button on hover */}
                <button 
                    onClick={() => {
                        setNewMeetingData(prev => ({...prev, date: dateStr}));
                        setIsModalOpen(true);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500"
                >
                    <Plus size={12} />
                </button>
              </div>
            );
        })}
      </div>

      {/* Hover Tooltip Portal (rendered outside grid to avoid clipping) */}
      {renderTooltip()}

      {/* New Meeting Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1a1b1e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <CalendarIcon className="text-blue-400" size={20} />
                        Planifier une réunion
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Titre</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white"
                            placeholder="Ex: Daily Scrum"
                            value={newMeetingData.title}
                            onChange={(e) => setNewMeetingData({...newMeetingData, title: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Date</label>
                            <input 
                                type="date" 
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                                value={newMeetingData.date}
                                onChange={(e) => setNewMeetingData({...newMeetingData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Heure</label>
                            <input 
                                type="time" 
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none text-white appearance-none"
                                value={newMeetingData.time}
                                onChange={(e) => setNewMeetingData({...newMeetingData, time: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-2">Type</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setNewMeetingData({...newMeetingData, type: 'video'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${newMeetingData.type === 'video' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                            >
                                Vidéo
                            </button>
                            <button 
                                onClick={() => setNewMeetingData({...newMeetingData, type: 'person'})}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${newMeetingData.type === 'person' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                            >
                                Présentiel
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleCreateMeeting}
                        disabled={!newMeetingData.title}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Planifier
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;