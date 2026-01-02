
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] p-10">
      <div className="w-full max-w-md animate-in fade-in duration-700">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-indigo-600 w-16 h-16 rounded-sm mb-6 shadow-2xl">
            <i className="fas fa-store text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">ZIOS <span className="text-indigo-400">STORE</span></h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">Enterprise Management Suite</p>
        </div>

        <div className="bg-white p-12 border border-slate-200 shadow-2xl">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 text-center border-b border-slate-100 pb-6">Secure Gateway</h2>
          
          <form onSubmit={e => { e.preventDefault(); onLogin(username, password); }} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication Identity</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-600 text-sm font-bold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Access Token</label>
              <input
                type="password"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-600 text-sm font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in shake-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl"
            >
              Initialize Session
            </button>
          </form>
        </div>
        
        <p className="text-center mt-12 text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em]">
          Internal Systems // Unauthorized Access Prohibited
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
