
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MessageSquare, ExternalLink } from 'lucide-react';
import { USERS } from '../constants';

const VirtualRoom: React.FC = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Simuler un speaker actif aléatoire pour l'effet visuel (Mode démo)
  useEffect(() => {
    if (isLiveMode) return;
    const interval = setInterval(() => {
      const randomUser = USERS[Math.floor(Math.random() * USERS.length)];
      setActiveSpeaker(randomUser.id);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveMode]);

  return (
    <div className="flex flex-col h-full w-full bg-black/40 rounded-3xl overflow-hidden relative border border-white/5">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white font-medium tracking-wide text-sm">Design Review - Oracle Navigator</span>
        </div>
        <div className="pointer-events-auto">
           <button 
             onClick={() => setIsLiveMode(!isLiveMode)}
             className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors flex items-center gap-2"
           >
             {isLiveMode ? 'Retour Vue 3D' : 'Rejoindre le Live (Jitsi)'}
             <ExternalLink size={12} />
           </button>
        </div>
      </div>

      {isLiveMode ? (
        // Intégration Jitsi Meet (Mode Live Réel)
        <div className="w-full h-full bg-black">
          <iframe 
            src="https://meet.jit.si/OracleNavigatorRoom" 
            className="w-full h-full border-none"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
          ></iframe>
        </div>
      ) : (
        // Mode Simulation UI 3D (Design actuel)
        <>
          {/* Grid Vidéo */}
          <div className="flex-1 grid grid-cols-2 gap-4 p-4 mt-8 mb-20 overflow-y-auto no-scrollbar">
            {USERS.map((user) => (
              <div 
                key={user.id} 
                className={`relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group transition-all duration-300 ${activeSpeaker === user.id ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border border-white/5'}`}
              >
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                />
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="text-xs font-semibold">{user.name}</span>
                  {activeSpeaker === user.id && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                </div>
              </div>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/90 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl z-20">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/80 hover:bg-red-500'}`}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition-colors ${isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/80 hover:bg-red-500'}`}
            >
              {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button 
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Partager l'écran"
            >
              <MonitorUp size={20} />
            </button>
            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <MessageSquare size={20} />
            </button>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors">
              <PhoneOff size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VirtualRoom;
