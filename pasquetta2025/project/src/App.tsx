import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, PartyPopper, Clock, Music, Gift, Cake, Heart } from 'lucide-react';

function App() {
  const [clicks, setClicks] = useState(0);
  const [requiredClicks, setRequiredClicks] = useState(0);
  const [cracks, setCracks] = useState<string[]>([]);
  const [shakeDirection, setShakeDirection] = useState(1);
  const [lighting, setLighting] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    setRequiredClicks(Math.floor(Math.random() * 6) + 3);
  }, []);

  const handleEggClick = () => {
    if (clicks < requiredClicks) {
      setClicks(prev => prev + 1);
      addNewCrack();
      setShakeDirection(prev => -prev);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (clicks >= requiredClicks) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setLighting({ x, y });
  };

  const addNewCrack = () => {
    const newCrack = generateCrackPath();
    setCracks(prev => [...prev, newCrack]);
  };

  const generateCrackPath = () => {
    const sectors = [
      { x: 30, y: 20, spread: 15 },  // Alto sinistra
      { x: 70, y: 20, spread: 15 },  // Alto destra
      { x: 30, y: 50, spread: 15 },  // Centro sinistra
      { x: 70, y: 50, spread: 15 },  // Centro destra
      { x: 30, y: 80, spread: 15 },  // Basso sinistra
      { x: 70, y: 80, spread: 15 },  // Basso destra
    ];
    
    const availableSectors = sectors.filter((_, index) => 
      !cracks.some(crack => crack.startsWith(`M ${sectors[index].x}`))
    );
    
    const sector = availableSectors.length > 0
      ? availableSectors[Math.floor(Math.random() * availableSectors.length)]
      : sectors[Math.floor(Math.random() * sectors.length)];
    
    const startX = sector.x + (Math.random() - 0.5) * sector.spread;
    const startY = sector.y + (Math.random() - 0.5) * sector.spread;
    
    const points = [];
    let currentX = startX;
    let currentY = startY;
    
    const numPoints = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numPoints; i++) {
      const angleVariation = (Math.random() * Math.PI - Math.PI/2) * 0.8;
      const length = Math.random() * 12 + 5;
      
      const controlX = currentX + Math.cos(angleVariation) * length * 0.5;
      const controlY = currentY + Math.sin(angleVariation) * length * 0.5;
      
      currentX += Math.cos(angleVariation) * length;
      currentY += Math.sin(angleVariation) * length;
      
      points.push(`Q ${controlX} ${controlY} ${currentX} ${currentY}`);
      
      if (Math.random() > 0.6) {
        const branchAngle = angleVariation + (Math.random() - 0.5) * Math.PI/2;
        const branchLength = length * (Math.random() * 0.5 + 0.3);
        const branchX = currentX + Math.cos(branchAngle) * branchLength;
        const branchY = currentY + Math.sin(branchAngle) * branchLength;
        points.push(`L ${branchX} ${branchY}`);
        points.push(`L ${currentX} ${currentY}`);
      }
    }
    
    return `M ${startX} ${startY} ${points.join(' ')}`;
  };

  const getEggState = () => {
    if (clicks === 0) return 'Perfetto';
    const progress = clicks / requiredClicks;
    if (progress < 0.3) return 'Prima crepa in vista...';
    if (progress < 0.6) return 'Le crepe si espandono...';
    if (progress < 0.9) return 'Quasi rotto...';
    return 'Si sta aprendo!';
  };

  const getLightingStyle = () => {
    const xOffset = (lighting.x - 0.5) * 100;
    const yOffset = (lighting.y - 0.5) * 100;
    return {
      background: `
        linear-gradient(
          135deg,
          #FFECD1 0%,
          #FFE4B5 50%,
          #DEB887 100%
        ),
        radial-gradient(
          circle at ${lighting.x * 100}% ${lighting.y * 100}%,
          rgba(255,255,255,0.8) 0%,
          rgba(255,255,255,0) 50%
        )
      `,
      boxShadow: `
        0 10px 30px rgba(0,0,0,0.1),
        inset ${-5 + xOffset * 0.1}px ${-5 + yOffset * 0.1}px 20px rgba(0,0,0,0.1),
        inset ${5 - xOffset * 0.1}px ${5 - yOffset * 0.1}px 20px rgba(255,255,255,0.8)
      `
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        {clicks < requiredClicks ? (
          <div 
            className="cursor-pointer transform transition-transform hover:scale-105 relative p-12"
            onClick={handleEggClick}
            onMouseMove={handleMouseMove}
          >
            <div 
              className={`relative egg-3d ${clicks > 0 ? 'animate-subtle-shake' : ''}`}
              style={{ 
                animation: clicks > 0 ? `subtle-shake 0.15s ${shakeDirection > 0 ? 'ease-in' : 'ease-out'}` : 'none',
                transform: `translateZ(20px)`
              }}
            >
              <div className="relative w-[120px] h-[160px] mx-auto">
                <div 
                  className="absolute inset-0 transition-all duration-200"
                  style={{
                    ...getLightingStyle(),
                    clipPath: 'ellipse(40% 50% at 50% 50%)',
                    transform: 'scale(1.5, 1.2)',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  <div 
                    className="absolute inset-0 transition-all duration-200"
                    style={{
                      background: `
                        radial-gradient(circle at ${30 + lighting.x * 10}% ${30 + lighting.y * 10}%, rgba(255,213,168,0.6) 0%, transparent 20%),
                        radial-gradient(circle at ${70 - lighting.x * 10}% ${40 + lighting.y * 10}%, rgba(255,213,168,0.6) 0%, transparent 15%),
                        radial-gradient(circle at ${40 + lighting.x * 10}% ${60 - lighting.y * 10}%, rgba(255,213,168,0.6) 0%, transparent 18%),
                        radial-gradient(circle at ${60 - lighting.x * 10}% ${70 - lighting.y * 10}%, rgba(255,213,168,0.6) 0%, transparent 12%)
                      `,
                      clipPath: 'ellipse(40% 50% at 50% 50%)',
                      mixBlendMode: 'overlay'
                    }}
                  />
                </div>
                
                <svg 
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  style={{
                    filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))'
                  }}
                >
                  {cracks.map((crack, index) => (
                    <g key={index}>
                      <path
                        d={crack}
                        className="stroke-[rgba(139,94,52,0.3)]"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          animation: `crack-appear 0.3s ease-out forwards`,
                          opacity: 0,
                          filter: 'blur(1px)',
                          transform: 'translate(1px, 1px)'
                        }}
                      />
                      <path
                        d={crack}
                        className="stroke-[#8B5E34]"
                        fill="none"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          animation: `crack-appear 0.3s ease-out forwards`,
                          opacity: 0
                        }}
                      />
                      <path
                        d={crack}
                        className="stroke-[rgba(255,255,255,0.5)]"
                        fill="none"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          animation: `crack-appear 0.3s ease-out forwards`,
                          opacity: 0,
                          transform: 'translate(-0.5px, -0.5px)'
                        }}
                      />
                    </g>
                  ))}
                </svg>
              </div>
              
              <div 
                className="egg-shadow transition-all duration-200"
                style={{
                  transform: `translateX(${(lighting.x - 0.5) * 20}px) translateY(${(lighting.y - 0.5) * 10}px)`
                }}
              ></div>
              
              <p className="mt-4 text-gray-600 italic">{getEggState()}</p>
              <p className="mt-2 text-sm text-gray-500">
                {clicks === 0 ? "Cliccami!" : `Continua a toccare...`}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50"></div>
            
            <div className="relative py-16 px-4">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${5 + Math.random() * 5}s`
                    }}
                  >
                    <div className={`
                      w-${Math.floor(Math.random() * 8 + 4)} 
                      h-${Math.floor(Math.random() * 8 + 4)} 
                      rounded-full 
                      bg-gradient-to-br 
                      ${i % 2 === 0 ? 'from-purple-400/20 to-pink-300/20' : 'from-orange-300/20 to-yellow-200/20'}
                    `}></div>
                  </div>
                ))}
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="animate-slide-up bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                        Pasquetta in Festa! 
                        <span className="animate-bounce inline-block ml-2">🎉</span>
                      </h1>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                      <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-center">
                        <Calendar className="w-8 h-8 text-purple-500 mb-3" />
                        <div>
                          <h2 className="text-xl font-bold text-purple-700 mb-2">Quando</h2>
                          <p className="text-gray-700 mb-2">Lunedì 1 Aprile 2024</p>
                          <div className="flex items-center justify-center text-gray-600">
                            <Clock className="w-5 h-5 mr-2" />
                            <span>14:00 - 19:00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                      <div className="flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 text-center">
                        <MapPin className="w-8 h-8 text-orange-500 mb-3" />
                        <div>
                          <h2 className="text-xl font-bold text-orange-700 mb-2">Dove</h2>
                          <p className="text-gray-700">
                            Località a sorpresa, immersa nel nostro<br />
                            magnifico territorio del Veneto
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                      <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50">
                        <div className="flex flex-col items-center mb-6">
                          <PartyPopper className="w-8 h-8 text-pink-500 mb-2" />
                          <h2 className="text-xl font-bold text-pink-700">Programma della Giornata</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="flex flex-col items-center text-center">
                            <Gift className="w-6 h-6 text-pink-400 mb-2" />
                            <div>
                              <h3 className="font-semibold text-gray-800">Caccia alle Uova</h3>
                              <p className="text-gray-600">Grande caccia nel frutteto con premi speciali</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Heart className="w-6 h-6 text-pink-400 mb-2" />
                            <div>
                              <h3 className="font-semibold text-gray-800">Angoli dell'amore</h3>
                              <p className="text-gray-600">Per voi piccioncini sarà possibile avere la vostra privacy con dei fantastici locali privati</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Cake className="w-6 h-6 text-pink-400 mb-2" />
                            <div>
                              <h3 className="font-semibold text-gray-800">Merenda Toscana</h3>
                              <p className="text-gray-600">Degustazione di prodotti tipici locali</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center text-center">
                            <Music className="w-6 h-6 text-pink-400 mb-2" />
                            <div>
                              <h3 className="font-semibold text-gray-800">Intrattenimento</h3>
                              <p className="text-gray-600">Musica dal vivo e animazione</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="animate-slide-up bg-gradient-to-r from-purple-600 to-pink-500 p-8 text-center" 
                       style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl font-bold text-white mb-4">Non perdere questa magica giornata!</h2>
                    <a 
                      href="#prenota"
                      className="inline-block bg-white text-purple-600 px-8 py-3 rounded-full 
                               hover:bg-purple-50 transition-all duration-300 shadow-lg
                               hover:shadow-white/30 transform hover:-translate-y-0.5"
                    >
                      Prenota il Tuo Posto
                    </a>
                    <p className="text-white/80 mt-3 text-sm">
                      Posti limitati, prenotazione obbligatoria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;