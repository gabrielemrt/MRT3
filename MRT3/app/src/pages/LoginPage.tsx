import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'gabriele@mrt3.it' && password === 'Admin!123') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/list');
    } else {
      setError('Credenziali non valide');
    }
  };

  return (
    <div className="min-h-screen apple-bg p-8">
      <div className="max-w-md mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alla home
        </Link>
        
        <div className="bg-white/10 rounded-lg p-8">
          <h1 className="text-3xl font-light text-white mb-6">Accesso</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full interactive-button px-6 py-2 rounded-lg text-white flex items-center justify-center space-x-2"
            >
              <span>Accedi</span>
              <LogIn className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;