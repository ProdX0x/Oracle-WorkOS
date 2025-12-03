import React, { useState, useRef } from 'react';
import { LayoutGrid, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, AlertCircle, X, Grip } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  users: User[];
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, users }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'form'>('grid');
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Selected User for Quick Login
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      // Check against the users prop provided by App component
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('Mot de passe incorrect (Indice: 1234)');
        setLoading(false);
        // Reset password field on error
        setPassword('');
        passwordInputRef.current?.focus();
      }
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !email || !password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const exists = users.some(u => u.email === email);

      if (exists) {
        setError("Cet email est déjà utilisé.");
        setLoading(false);
        return;
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        role: 'Nouveau Membre',
        systemRole: UserRole.MEMBER
      };

      // Note: Ideally, this should update the users state in App.tsx via a callback
      // For now, we just log the user in locally.
      onLogin(newUser);
    }, 1000);
  };

  const handleAvatarClick = (user: User) => {
    if (!user.email) return;
    setSelectedUser(user);
    setEmail(user.email);
    setViewMode('form');
    setIsLoginMode(true);
    setError(null);
    setPassword('');
    // Focus password after transition
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  const handleSwitchMode = () => {
    if (viewMode === 'grid') {
      setViewMode('form');
      setSelectedUser(null);
      setEmail('');
    } else {
      setViewMode('grid');
      setError(null);
    }
  };

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>

      {/* Switcher Button (Top Right) */}
      <button 
        onClick={handleSwitchMode}
        className="absolute top-8 right-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all backdrop-blur-md group"
      >
        {viewMode === 'grid' ? (
           <>
             <Lock size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
             <span className="text-sm font-medium">Connexion Manuelle</span>
           </>
        ) : (
           <>
             <Grip size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
             <span className="text-sm font-medium">Vue Équipe</span>
           </>
        )}
      </button>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* Logo Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <LayoutGrid size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Oracle WorkOS</h1>
          <p className="text-gray-400 text-lg">
            {viewMode === 'grid' ? 'Identifiez-vous pour accéder à l\'espace de travail' : 'Authentification Sécurisée'}
          </p>
        </div>

        {/* --- VIEW MODE: GRID (TEAM) --- */}
        {viewMode === 'grid' && (
          <div className="w-full animate-in fade-in zoom-in duration-300">
             <div className="flex flex-wrap justify-center gap-6">
                {users.map((user) => (
                  <button 
                    key={user.id}
                    onClick={() => handleAvatarClick(user)}
                    className="group relative flex flex-col items-center gap-4 p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300 w-40"
                  >
                    <div className="relative">
                       <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-20 h-20 rounded-full border-4 border-transparent group-hover:border-blue-500 transition-all shadow-xl" 
                       />
                       {user.systemRole === UserRole.ADMIN && (
                         <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-1 rounded-full border-2 border-black" title="Admin">
                            <ShieldCheck size={12} strokeWidth={3} />
                         </div>
                       )}
                    </div>
                    <div className="text-center">
                       <div className="text-white font-bold text-lg leading-tight">{user.name}</div>
                       <div className="text-gray-500 text-xs mt-1">{user.role}</div>
                    </div>
                    <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                       user.systemRole === UserRole.ADMIN ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                       user.systemRole === UserRole.VISITOR ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' :
                       'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                       {user.systemRole}
                    </div>
                  </button>
                ))}
             </div>
             
             <div className="text-center mt-12">
               <button 
                 onClick={handleSwitchMode}
                 className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
               >
                 <Mail size={14} />
                 Se connecter avec un autre compte
               </button>
             </div>
          </div>
        )}

        {/* --- VIEW MODE: FORM (SECURE) --- */}
        {viewMode === 'form' && (
          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Quick Login Header (Avatar) */}
            {selectedUser && (
               <div className="flex flex-col items-center mb-6 -mt-12">
                  <div className="relative">
                    <img 
                      src={selectedUser.avatar} 
                      className="w-24 h-24 rounded-full border-4 border-[#0a0a0c] shadow-2xl"
                      alt={selectedUser.name}
                    />
                    <button 
                      onClick={() => { setSelectedUser(null); setEmail(''); setViewMode('grid'); }}
                      className="absolute top-0 right-0 bg-gray-800 text-gray-400 hover:text-white p-1 rounded-full border border-gray-700 transition-colors"
                      title="Changer d'utilisateur"
                    >
                       <X size={14} />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-3">Bon retour, {selectedUser.name} !</h3>
                  <p className="text-sm text-gray-400">Veuillez confirmer votre identité.</p>
               </div>
            )}

            {!selectedUser && (
              <div className="flex gap-4 mb-8 p-1 bg-black/20 rounded-xl">
                <button 
                  onClick={() => { setIsLoginMode(true); setError(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLoginMode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Connexion
                </button>
                <button 
                  onClick={() => { setIsLoginMode(false); setError(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLoginMode ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Inscription
                </button>
              </div>
            )}

            <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
              
              {!isLoginMode && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Nom complet</label>
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-3 text-gray-500" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-500" />
                  <input 
                    type="email" 
                    value={email}
                    readOnly={!!selectedUser}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors ${selectedUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="nom@entreprise.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Mot de passe</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-gray-500" />
                  <input 
                    ref={passwordInputRef}
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLoginMode ? 'Accéder au Workspace' : 'Créer mon compte'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {!selectedUser && isLoginMode && (
               <div className="mt-6 text-center">
                 <button onClick={() => setViewMode('grid')} className="text-sm text-gray-500 hover:text-white underline decoration-gray-700 hover:decoration-white transition-all">
                    Retour à la vue équipe
                 </button>
               </div>
            )}
          </div>
        )}
        
        <div className="text-center mt-8 text-xs text-gray-600 flex items-center justify-center gap-2">
           <ShieldCheck size={12} />
           Système d'authentification Oracle v1.2
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;