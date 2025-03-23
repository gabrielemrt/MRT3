import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<string[]>([]);

  useEffect(() => {
    const savedWaitlist = localStorage.getItem('waitlist');
    if (savedWaitlist) {
      setWaitlist(JSON.parse(savedWaitlist));
    }
  }, []);

  return (
    <div className="min-h-screen apple-bg p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alla home
        </Link>
        
        <h1 className="text-4xl font-light text-white mb-8">Lista Iscritti</h1>
        
        <div className="bg-white/10 rounded-lg p-6">
          <div className="space-y-2">
            {waitlist.length > 0 ? (
              waitlist.map((email, index) => (
                <div 
                  key={index}
                  className="text-white/80 p-3 rounded bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {email}
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-8">
                Nessun iscritto nella lista d'attesa
              </p>
            )}
          </div>
          
          <div className="mt-6 text-white/60 text-sm">
            Totale iscritti: {waitlist.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitlistPage;