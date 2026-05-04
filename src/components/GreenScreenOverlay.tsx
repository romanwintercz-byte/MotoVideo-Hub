import React, { useState, useEffect, useRef } from 'react';
import { RideProject } from '../types';
import { X, Play, Pause, Heart, Info, Monitor, Settings2 } from 'lucide-react';

interface GreenScreenOverlayProps {
  project: RideProject;
  onClose: () => void;
}

export function GreenScreenOverlay({ project, onClose }: GreenScreenOverlayProps) {
  const tcxData = project.telemetry.tcxData;
  const hasTcx = !!tcxData && tcxData.points.length > 0;
  
  const techAirData = project.telemetry.techAirData;
  const hasTechAir = !!techAirData && techAirData.points.length > 0;
  
  const hasAnyData = hasTcx || hasTechAir;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Design settings
  const [design, setDesign] = useState<{
    style: 'digital' | 'circular';
    color: string;
    speedColor: string;
    size: number;
    layout: 'vertical' | 'horizontal';
  }>({
    style: 'circular',
    color: '#ff0a0a', // Barva okysličené krve
    speedColor: '#3b82f6', // Modrá pro rychlost
    size: 1,
    layout: 'vertical'
  });

  // Calculate current point data dynamically to avoid stale state in intervals
  const safeTcxIndex = Math.min(currentTimeIndex, (hasTcx ? tcxData.points.length : 1) - 1);
  const currentBpm = hasTcx ? Math.round(tcxData.points[safeTcxIndex].hr) : 0;
  
  const safeTechAirIndex = Math.min(currentTimeIndex, (hasTechAir ? techAirData.points.length : 1) - 1);
  const currentSpeed = hasTechAir ? Math.round(techAirData.points[safeTechAirIndex].speed || 0) : 0;
  const currentLeanAngle = hasTechAir ? (techAirData.points[safeTechAirIndex].leanAngle || 0) : 0;
  const currentAccel = hasTechAir ? (techAirData.points[safeTechAirIndex].acceleration || 0) : 0;

  // Playback timer
  useEffect(() => {
    let interval: number;
    if (isPlaying && hasAnyData) {
      interval = window.setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          const maxIdx = Math.max(hasTcx ? tcxData.points.length : 0, hasTechAir ? techAirData.points.length : 0);
          if (next >= maxIdx) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, 1000); // 1 point per second playback (standard TCX is usually 1Hz)
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasAnyData, hasTcx, hasTechAir, tcxData, techAirData]);

  if (!hasAnyData) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
        <div className="text-center space-y-4 text-zinc-100">
          <p className="text-xl">Nemáš nahraná žádná TCX ani data z vesty pro tento projekt.</p>
          <button onClick={onClose} className="px-6 py-2 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700">Zpět</button>
        </div>
      </div>
    );
  }

  const getZoneColor = (bpm: number) => {
    if (bpm < 120) return "text-zinc-400"; // Z1/Z2
    if (bpm < 150) return "text-green-500"; // Z3
    if (bpm < 170) return "text-amber-500"; // Z4
    return "text-red-500"; // Z5
  };

  const currentPoint = hasTcx ? tcxData.points[currentTimeIndex] : (hasTechAir ? techAirData.points[currentTimeIndex] : null);
  const timeDisplay = currentPoint ? new Date(currentPoint.time).toLocaleTimeString('cs-CZ') : '';
  const maxIdxForSlider = Math.max(hasTcx ? tcxData.points.length : 0, hasTechAir ? techAirData.points.length : 0) - 1;

  // SVG Gauge calculations (HR)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const minHr = 60;
  const maxHr = 200;
  const hrRange = maxHr - minHr;
  const hrPercent = Math.max(0, Math.min(1, (currentBpm - minHr) / hrRange));
  const dashoffsetHr = circumference - hrPercent * circumference;

  // SVG Gauge calculations (Speed)
  const minSpeed = 0;
  const maxSpeed = hasTechAir ? Math.max(200, techAirData.maxSpeed + 20) : 200;
  const speedRange = maxSpeed - minSpeed;
  const speedPercent = Math.max(0, Math.min(1, (currentSpeed - minSpeed) / speedRange));
  const dashoffsetSpeed = circumference - speedPercent * circumference;

  return (
    <div className="fixed inset-0 z-[100] bg-[#00FF00] overflow-hidden select-none">
      
      {/* Controls UI (Will not be recorded if we crop the bottom in OBS, or we can make it auto-hide) */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur p-4 flex items-center justify-between z-20 transition-opacity hover:opacity-100 opacity-0 group">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-white hover:text-red-400 p-2 bg-zinc-900 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
            <X size={20} />
          </button>
          <div className="text-white font-medium flex items-center gap-3">
            <span className="text-zinc-400">Zelené plátno:</span> 
            {project.title}
          </div>
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="ml-4 flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors"
          >
            <Info size={16} /> Jak pracovat s DaVinci?
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md transition-colors"
          >
            <Settings2 size={16} /> Vzhled
          </button>
        </div>

        <div className="flex items-center gap-8">
          {hasAnyData && (
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 font-mono text-sm bg-zinc-900 px-3 py-1 rounded">
                  {currentTimeIndex}s / {maxIdxForSlider + 1}s
                </span>
                <span className="text-white font-mono font-bold bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
                  {timeDisplay}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={maxIdxForSlider} 
                value={currentTimeIndex} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTimeIndex(val);
                }} 
                className="w-64 accent-blue-500 cursor-pointer"
              />
            </div>
          )}
          {hasAnyData && (
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-colors w-32 justify-center"
            >
              {isPlaying ? <><Pause size={20} /> Pauza</> : <><Play size={20} /> Start</>}
            </button>
          )}
        </div>
      </div>

      {showInstructions && (
        <div className="absolute bottom-24 left-4 z-20 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white p-6 rounded-2xl shadow-2xl max-w-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Monitor size={20} className="text-blue-400"/> Návod pro DaVinci Resolve</h3>
          <ol className="space-y-3 text-sm text-zinc-300 list-decimal list-inside">
            <li>Rozetáhni okno s aplikací na celou obrazovku.</li>
            <li>Najdi si na posuvníku dole <strong>reálný čas dne</strong>, kdy nahrávka z kamery začíná (je třeba znát hrubý čas obou zařízení).</li>
            <li>Zapni nahrávání obrazovky (např. pomocí OBS Studio, nebo <code>Win + Alt + R</code> ve Windows / <code>Cmd + Shift + 5</code> na Macu).</li>
            <li>Klikni na Start.</li>
            <li>Nahrané video naimportuj do DaVinci a polož ho <strong>do videostopy NAD</strong> video z tvé kamery.</li>
            <li>V záložce <strong>Edit</strong> (nebo Color) vyhledej efekt <strong>3D Keyer</strong> (případně Delta Keyer), aplikuj ho na stopu, zvol kapátko a klikni na zelené pozadí.</li>
            <li>V sekci Video &rarr; Cropping obraz ořízni zespodu, aby nezbyla ovládací lišta, ale pouze samotný widget tepu/rychlosti.</li>
            <li>Posouvej naklíčovanou vrstvu doleva/doprava na časové ose, abys doladil synchronizaci přesně např. s příchodem dechu nebo akcelerace.</li>
          </ol>
          <button onClick={() => setShowInstructions(false)} className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors">Rozumím, skrýt</button>
        </div>
      )}

      {showSettings && (
        <div className="absolute bottom-24 left-4 z-20 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white p-6 rounded-2xl shadow-2xl w-80">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings2 size={20} className="text-blue-400"/> Nastavení Vzhledu</h3>
          <div className="space-y-4">
             <div>
                <label className="text-xs text-zinc-400 block mb-1">Styl widgetu</label>
                <div className="flex bg-zinc-800 rounded-lg p-1">
                  <button onClick={() => setDesign({...design, style: 'digital'})} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${design.style === 'digital' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>Digitální</button>
                  <button onClick={() => setDesign({...design, style: 'circular'})} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${design.style === 'circular' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>Kruhový</button>
                </div>
             </div>
             
             {hasTcx && hasTechAir && (
               <div>
                  <label className="text-xs text-zinc-400 block mb-1">Uspořádání</label>
                  <div className="flex bg-zinc-800 rounded-lg p-1">
                    <button onClick={() => setDesign({...design, layout: 'vertical'})} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${design.layout === 'vertical' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>Pod sebou</button>
                    <button onClick={() => setDesign({...design, layout: 'horizontal'})} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${design.layout === 'horizontal' ? 'bg-zinc-600 text-white' : 'text-zinc-400'}`}>Vedle sebe</button>
                  </div>
               </div>
             )}

             <div>
                <label className="text-xs text-zinc-400 block mb-1">Barva (Tepovka)</label>
                <div className="flex gap-2">
                   <input type="color" value={design.color} onChange={e => setDesign({...design, color: e.target.value})} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
                   <input type="text" value={design.color} onChange={e => setDesign({...design, color: e.target.value})} className="flex-1 bg-zinc-800 rounded px-2 text-sm text-zinc-300 border border-zinc-700" />
                </div>
             </div>

             <div>
                <label className="text-xs text-zinc-400 block mb-1">Barva (Rychlost)</label>
                <div className="flex gap-2">
                   <input type="color" value={design.speedColor} onChange={e => setDesign({...design, speedColor: e.target.value})} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
                   <input type="text" value={design.speedColor} onChange={e => setDesign({...design, speedColor: e.target.value})} className="flex-1 bg-zinc-800 rounded px-2 text-sm text-zinc-300 border border-zinc-700" />
                </div>
             </div>
             
             <div>
                <label className="text-xs text-zinc-400 block mb-1">Velikost (Scale)</label>
                <input type="range" min="0.5" max="3" step="0.1" value={design.size} onChange={e => setDesign({...design, size: parseFloat(e.target.value)})} className="w-full accent-blue-500" />
             </div>
          </div>
          <button onClick={() => setShowSettings(false)} className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors">Zavřít</button>
        </div>
      )}

      <div className="absolute inset-0 flex items-start justify-start p-12">
         {/* THE WIDGET ITSELF */}
         {hasAnyData && (
           <div 
             className={`origin-top-left transition-transform flex gap-6 ${design.layout === 'vertical' ? 'flex-col' : 'flex-row'}`} 
             style={{ transform: `scale(${design.size})` }}
           >
              {hasTcx && (design.style === 'digital' ? (
                <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm p-4 rounded-3xl border border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-[280px]">
                  <div className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-black/60 shadow-inner ${getZoneColor(currentBpm)} transition-colors duration-500 ring-2 ring-current ring-offset-4 ring-offset-zinc-900`}>
                    <div className={`absolute flex items-center justify-center ${isPlaying && currentBpm > 0 ? 'animate-pulse' : ''}`}>
                      <Heart size={32} style={{ color: design.color, fill: design.color }} />
                    </div>
                  </div>

                  <div className="flex flex-col ml-2 justify-center text-white">
                    <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Tepová freq.</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {currentBpm}
                      </span>
                      <span className="text-zinc-400 font-bold ml-1 text-sm">bpm</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-48 h-48 relative drop-shadow-2xl">
                  {/* Circular Gauge */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle 
                       cx="50" cy="50" r={radius} 
                       fill="none" 
                       stroke="rgba(0,0,0,0.4)" 
                       strokeWidth="8"
                    />
                    <circle 
                       cx="50" cy="50" r={radius} 
                       fill="none" 
                       stroke={design.color} 
                       strokeWidth="8"
                       strokeLinecap="round"
                       style={{
                         strokeDasharray: circumference,
                         strokeDashoffset: dashoffsetHr,
                         transition: 'stroke-dashoffset 0.5s ease-out'
                       }}
                    />
                  </svg>
                  
                  {/* Inside content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                     <div className={`flex items-center justify-center mb-1 ${isPlaying && currentBpm > 60 ? 'animate-pulse' : ''}`}>
                        <Heart size={20} style={{ color: design.color, fill: design.color }} />
                     </div>
                     <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-md">
                        {currentBpm}
                     </span>
                     <span className="text-xs font-bold text-zinc-300 tracking-wider">BPM</span>
                  </div>
                </div>
              ))}

              {hasTechAir && (design.style === 'digital' ? (
                <div className="flex items-center gap-6 bg-black/80 backdrop-blur-sm p-4 rounded-3xl border border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] pr-8">
                  {/* SPEED */}
                  <div className="flex items-center gap-4">
                    <div className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-black/60 shadow-inner transition-colors duration-500 ring-2 ring-current ring-offset-4 ring-offset-zinc-900`} style={{ color: currentSpeed > 100 ? '#ef4444' : design.speedColor }}>
                      <div className="absolute flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: design.speedColor }}>KMH</span>
                      </div>
                    </div>

                    <div className="flex flex-col ml-1 justify-center text-white">
                      <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Rychlost</div>
                      <div className="flex items-baseline gap-1 min-w-[100px]">
                        <span className="text-5xl font-black tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                          {currentSpeed}
                        </span>
                        <span className="text-zinc-400 font-bold ml-1 text-sm">km/h</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-16 bg-zinc-800"></div>

                  {/* LEAN ANGLE */}
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col items-center justify-center w-16">
                        <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Náklon</div>
                        <div className="relative w-12 h-12 flex items-center justify-center">
                           <div style={{ transform: `rotate(${currentLeanAngle}deg)`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                              <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                                 <circle cx="12" cy="6" r="4" fill="white" />
                                 <path d="M6 12 L 18 12 L 15 18 L 9 18 Z" fill="white" />
                                 <rect x="9" y="19" width="6" height="9" rx="2" fill="white" />
                              </svg>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-baseline gap-1 min-w-[60px]">
                        <span className="text-4xl font-black tracking-tighter text-white">
                          {Math.round(Math.abs(currentLeanAngle))}°
                        </span>
                     </div>
                  </div>

                  <div className="w-px h-16 bg-zinc-800"></div>

                  {/* G-FORCE (Acceleration/Deceleration) */}
                  <div className="flex flex-col justify-center min-w-[120px]">
                     <div className="flex justify-between items-end mb-1.5">
                       <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Přetížení</div>
                       <div className="text-white font-bold text-lg leading-none">{Math.abs(currentAccel).toFixed(2)}<span className="text-xs text-zinc-400 ml-0.5">G</span></div>
                     </div>
                     <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden relative shadow-inner border border-zinc-800">
                        {/* Center line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-500 z-10"></div>
                        {/* Bar moving left/right */}
                        {currentAccel < 0 ? (
                           <div className="absolute top-0 bottom-0 right-1/2 bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.abs(currentAccel) / 1.5 * 100)}%` }} />
                        ) : (
                           <div className="absolute top-0 bottom-0 left-1/2 bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.abs(currentAccel) / 1.5 * 100)}%` }} />
                        )}
                     </div>
                     <div className="flex justify-between text-[8px] text-zinc-600 font-bold uppercase mt-1">
                        <span>Brzda</span>
                        <span>Plyn</span>
                     </div>
                  </div>

                </div>
              ) : (
                <div className="flex gap-8 items-center">
                  <div className="flex items-center justify-center w-48 h-48 relative drop-shadow-2xl">
                    {/* Speed Circular Gauge */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="8" />
                      <circle cx="50" cy="50" r={radius} fill="none" stroke={design.speedColor} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: dashoffsetSpeed, transition: 'stroke-dashoffset 0.5s ease-out' }} />
                    </svg>
                    
                    {/* Inside content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                       <span className="text-5xl font-black text-white leading-none tracking-tighter drop-shadow-md">
                          {currentSpeed}
                       </span>
                       <span className="text-xs font-bold text-zinc-300 tracking-wider mt-1">KM/H</span>
                    </div>
                  </div>

                  {/* Circular-compatible lean angle widget */}
                  <div className="flex items-center justify-center w-32 h-32 relative drop-shadow-2xl bg-black/40 rounded-full border border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div style={{ transform: `rotate(${currentLeanAngle}deg)`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                          <svg width="40" height="48" viewBox="0 0 24 28" fill="none">
                               <circle cx="12" cy="6" r="4" fill="white" />
                               <path d="M6 12 L 18 12 L 15 18 L 9 18 Z" fill="white" />
                               <rect x="9" y="19" width="6" height="9" rx="2" fill="white" />
                          </svg>
                       </div>
                     </div>
                     <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-md font-black text-white drop-shadow-md bg-black/60 px-2 rounded-full border border-zinc-800">
                           {Math.round(Math.abs(currentLeanAngle))}°
                        </span>
                     </div>
                  </div>

                  {/* Circular-compatible G Force */}
                  <div className="flex flex-col items-center justify-center w-32 h-32 relative drop-shadow-2xl bg-black/40 rounded-full border border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                     <span className="text-2xl font-black text-white leading-none tracking-tighter drop-shadow-md mb-2">
                        {Math.abs(currentAccel).toFixed(2)}<span className="text-xs text-zinc-400">G</span>
                     </span>
                     <div className="w-20 h-2.5 bg-zinc-900 rounded-full overflow-hidden relative shadow-inner border border-zinc-800">
                        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-zinc-500 z-10"></div>
                        {currentAccel < 0 ? (
                           <div className="absolute top-0 bottom-0 right-1/2 bg-red-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.abs(currentAccel) / 1.5 * 100)}%` }} />
                        ) : (
                           <div className="absolute top-0 bottom-0 left-1/2 bg-green-500 transition-all duration-300" style={{ width: `${Math.min(100, Math.abs(currentAccel) / 1.5 * 100)}%` }} />
                        )}
                     </div>
                  </div>
                </div>
              ))}
           </div>
         )}
      </div>

    </div>
  );
}

