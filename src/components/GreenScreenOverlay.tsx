import React, { useState, useEffect, useRef } from 'react';
import { RideProject } from '../types';
import { X, Play, Pause, Heart, Info, Monitor } from 'lucide-react';

interface GreenScreenOverlayProps {
  project: RideProject;
  onClose: () => void;
}

export function GreenScreenOverlay({ project, onClose }: GreenScreenOverlayProps) {
  const tcxData = project.telemetry.tcxData;
  const hasData = !!tcxData && tcxData.points.length > 0;
  const hasDiablo = !!project.telemetry.diabloImage;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(hasData ? tcxData.points[0].hr : 0);
  const [showInstructions, setShowInstructions] = useState(false);

  // Playback timer
  useEffect(() => {
    let interval: number;
    if (isPlaying && hasData) {
      interval = window.setInterval(() => {
        setCurrentTimeIndex((prev) => {
          const next = prev + 1;
          if (next >= tcxData.points.length) {
            setIsPlaying(false);
            return prev;
          }
          setCurrentBpm(tcxData.points[next].hr);
          return next;
        });
      }, 1000); // 1 point per second playback (standard TCX is usually 1Hz)
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasData, tcxData]);

  if (!hasData && !hasDiablo) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
        <div className="text-center space-y-4 text-zinc-100">
          <p className="text-xl">Nemáš nahraná žádná TCX data ani mapu pro tento projekt.</p>
          <button onClick={onClose} className="px-6 py-2 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700">Zpět</button>
        </div>
      </div>
    );
  }

  // Calculate some simple graph points or a ring color based on Zone
  const getZoneColor = (bpm: number) => {
    if (bpm < 120) return "text-zinc-400"; // Z1/Z2
    if (bpm < 150) return "text-green-500"; // Z3
    if (bpm < 170) return "text-amber-500"; // Z4
    return "text-red-500"; // Z5
  };

  const currentPoint = hasData ? tcxData.points[currentTimeIndex] : null;
  const timeDisplay = currentPoint ? new Date(currentPoint.time).toLocaleTimeString('cs-CZ') : '';

  return (
    <div className="fixed inset-0 z-[100] bg-[#00FF00] overflow-hidden select-none">
      
      {/* Controls UI (Will not be recorded if we crop the bottom in OBS, or we can make it auto-hide) */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur p-4 flex items-center justify-between z-20 transition-opacity hover:opacity-100 opacity-0">
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
        </div>

        <div className="flex items-center gap-8">
          {hasData && (
            <div className="flex flex-col gap-1 items-end">
              <div className="flex items-center gap-4">
                <span className="text-zinc-400 font-mono text-sm bg-zinc-900 px-3 py-1 rounded">
                  {currentTimeIndex}s / {tcxData.points.length}s
                </span>
                <span className="text-white font-mono font-bold bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
                  {timeDisplay}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={tcxData.points.length - 1} 
                value={currentTimeIndex} 
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCurrentTimeIndex(val);
                  setCurrentBpm(tcxData.points[val].hr);
                }} 
                className="w-64 accent-blue-500 cursor-pointer"
              />
            </div>
          )}
          {hasData && (
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
        <div className="absolute top-24 left-4 z-20 bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white p-6 rounded-2xl shadow-2xl max-w-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Monitor size={20} className="text-blue-400"/> Návod pro DaVinci Resolve</h3>
          <ol className="space-y-3 text-sm text-zinc-300 list-decimal list-inside">
            <li>Rozetáhni okno s aplikací na celou obrazovku.</li>
            <li>Najdi si na posuvníku nahoře <strong>reálný čas dne</strong>, kdy nahrávka z kamery začíná (je třeba znát hrubý čas obou zařízení).</li>
            <li>Zapni nahrávání obrazovky (např. pomocí OBS Studio, nebo <code>Win + Alt + R</code> ve Windows / <code>Cmd + Shift + 5</code> na Macu).</li>
            <li>Klikni na Start.</li>
            <li>Nahrané video naimportuj do DaVinci a polož ho <strong>do videostopy NAD</strong> video z tvé kamery.</li>
            <li>V záložce <strong>Edit</strong> (nebo Color) vyhledej efekt <strong>3D Keyer</strong> (případně Delta Keyer), aplikuj ho na stopu, zvol kapátko a klikni na zelené pozadí.</li>
            <li>V sekci Video &rarr; Cropping obraz ořízni shora, aby nezbyla ovládací lišta, ale pouze samotný widget tepu.</li>
            <li>Posouvej naklíčovanou vrstvu doleva/doprava na časové ose, abys doladil synchronizaci přesně např. s příchodem dechu nebo akcelerace.</li>
          </ol>
          <button onClick={() => setShowInstructions(false)} className="mt-6 w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-colors">Rozumím, skrýt</button>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
         {/* THE WIDGET ITSELF - we can place it bottom-right or center. Let's do a bottom-left overlay look. */}
         {hasData && (
           <div className="absolute bottom-16 left-16 flex items-end gap-6 bg-transparent">
              {/* Box style Graphic Element */}
              <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm p-4 rounded-3xl border border-zinc-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-[280px]">
                <div className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-black/60 shadow-inner ${getZoneColor(currentBpm)} transition-colors duration-500 ring-2 ring-current ring-offset-4 ring-offset-zinc-900`}>
                  <div className={`absolute flex items-center justify-center ${isPlaying && currentBpm > 0 ? 'animate-pulse' : ''}`}>
                    <Heart size={32} className="fill-current" />
                  </div>
                </div>

                <div className="flex flex-col ml-2 justify-center">
                  <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Tepová freq.</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {currentBpm}
                    </span>
                    <span className="text-zinc-400 font-bold ml-1 text-sm">bpm</span>
                  </div>
                </div>
              </div>
           </div>
         )}
         
         {/* Diablo Widget (If they also have a diablo picture!) */}
         {project.telemetry.diabloImage && (
            <div className="absolute bottom-16 right-16 w-[400px] h-[400px] bg-contain bg-bottom bg-no-repeat opacity-90 drop-shadow-2xl" style={{ backgroundImage: `url(${project.telemetry.diabloImage})` }} />
         )}
      </div>

    </div>
  );
}
