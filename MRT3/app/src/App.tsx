import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import WaitlistPage from './pages/WaitlistPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [waitlist, setWaitlist] = useState<string[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000);

    const savedWaitlist = localStorage.getItem('waitlist');
    if (savedWaitlist) {
      setWaitlist(JSON.parse(savedWaitlist));
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        if (waitlist.includes(email)) {
          setError('Questa email è già registrata.');
          return;
        }

        const newWaitlist = [...waitlist, email];
        setWaitlist(newWaitlist);
        localStorage.setItem('waitlist', JSON.stringify(newWaitlist));
        setIsSubmitted(true);
        setEmail('');
        setError('');
      } catch (err) {
        setError('Si è verificato un errore. Riprova più tardi.');
        console.error('Error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen apple-bg flex flex-col items-center justify-center relative overflow-hidden">
      <div 
        className="mouse-trailer"
        style={{
          transform: `translate(${mousePos.x - 10}px, ${mousePos.y - 10}px)`
        }}
      />
      
      <div className="logo-animation text-7xl md:text-9xl text-white cursor-default select-none mb-8">
        MRT3
      </div>

      {showContent && (
        <div className="flex flex-col items-center space-y-8 mt-8">
          <ChevronDown 
            className="text-white/50 w-8 h-8 float-animation cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          />
          
          <div className="fade-in flex flex-col items-center space-y-6 max-w-md px-6">
            {!isSubmitted ? (
              <>
                <p className="text-white/80 text-center text-lg">
                  Unisciti alla lista d'attesa per essere tra i primi a vivere un'esperienza straordinaria
                </p>
                <form onSubmit={handleSubmit} className="w-full flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Inserisci la tua email"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    required
                  />
                  <button
                    type="submit"
                    className="interactive-button px-6 py-2 rounded-lg text-white flex items-center space-x-2"
                  >
                    <span>Iscriviti</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
              </>
            ) : (
              <div className="fade-in text-white/80 text-center text-lg">
                Grazie per esserti iscritto! Ti contatteremo presto.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/list" 
        element={
          <ProtectedRoute>
            <WaitlistPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;