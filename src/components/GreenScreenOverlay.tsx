import React, { useState, useEffect, useRef } from 'react';
import { RideProject } from '../types';
import { X, Play, Pause, Heart, Monitor } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-[100] bg-[#00FF00] overflow-hidden select-none">
      
      {/* Controls UI (Will not be recorded if we crop the bottom in OBS, or we can make it auto-hide) */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur p-4 flex items-center justify-between z-10 transition-opacity hover:opacity-100 opacity-5">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-white hover:text-red-400 P-2 bg-zinc-900 rounded-full w-10 h-10 flex items-center justify-center">
            <X size={20} />
          </button>
          <div className="text-white font-medium">
            <span className="text-zinc-400 mr-2">Zelené plátno:</span> 
            {project.title}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasData && (
            <div className="text-zinc-400 font-mono text-sm">
              {currentTimeIndex}s / {tcxData.points.length}s
            </div>
          )}
          {hasData && (
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold"
            >
              {isPlaying ? <><Pause size={20} /> Pauza</> : <><Play size={20} /> Start</>}
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
         {/* THE WIDGET ITSELF - we can place it bottom-right or center. Let's do a bottom-left overlay look. */}
         {hasData && (
           <div className="absolute bottom-16 left-16 flex items-end gap-6 bg-transparent">
              {/* Simple Graphic Element */}
              <div className={`relative flex items-center justify-center w-36 h-36 rounded-full border-8 border-current bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${getZoneColor(currentBpm)} transition-colors duration-500`}>
                <div className="absolute flex flex-col items-center justify-center animate-pulse">
                  <Heart size={36} className="fill-current mb-0" />
                  <span className="text-5xl font-black text-white tracking-tighter" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    {currentBpm}
                  </span>
                </div>
              </div>

              {/* Optional text or max */}
              <div className="flex flex-col mb-4 bg-black/60 px-4 py-2 rounded-xl border-l-4 border-current shadow-lg text-white" style={{ borderColor: 'inherit' }}>
                 <div className="text-xs uppercase tracking-wider text-zinc-300 font-bold">Tepová Freq.</div>
                 <div className="text-sm font-mono text-zinc-400">Max: {tcxData.maxHr} | Avg: {tcxData.avgHr}</div>
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
