import React from 'react';
import { RideProject } from '../types';
import { Film, Clock, CheckCircle, HardDrive, Tag, Calendar, Map, Activity, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface LibraryProps {
  projects: RideProject[];
  onEdit: (project: RideProject) => void;
  onDelete: (id: string) => void;
}

export function Library({ projects, onEdit, onDelete }: LibraryProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
        <FolderOpen size={48} className="mb-4 opacity-20" />
        <p>Zatím tu nemáš žádné projekty z vyjížděk.</p>
        <p className="text-sm">Klikni na "Přidat vyjížďku" a vytvoř první záznam.</p>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'raw': return { icon: HardDrive, text: 'K setřídění', color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
      case 'editing': return { icon: Clock, text: 'Ve střižně', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'done': return { icon: CheckCircle, text: 'Hotovo', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      default: return { icon: FolderOpen, text: 'Neznámý', color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => {
        const status = getStatusConfig(project.status);
        const StatusIcon = status.icon;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={project.id}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all hover:shadow-xl hover:shadow-black/50 cursor-pointer flex flex-col"
            onClick={() => onEdit(project)}
          >
            {/* Card Header */}
            <div className="h-32 bg-zinc-950 relative p-5 flex flex-col justify-between border-b border-zinc-800/50">
              <div className="flex justify-between items-start">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  <StatusIcon size={12} />
                  {status.text}
                </div>
                <div className="flex gap-1.5">
                  {project.telemetry.hasDiablo && (
                    <div title="Máš data z Diabla" className="bg-red-500/10 text-red-500 p-1.5 rounded-md flex items-center">
                      <Map size={14} />
                    </div>
                  )}
                  {project.telemetry.hasAmazfit && (
                    <div title="Máš data z Amazfitu" className="bg-blue-500/10 text-blue-500 p-1.5 rounded-md flex items-center">
                      <Activity size={14} />
                    </div>
                  )}
                  {project.highlights.length > 0 && (
                    <div className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded-md flex items-center gap-1">
                      <Tag size={12} />
                      {project.highlights.length}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 truncate">{project.title}</h3>
                <div className="text-xs text-zinc-500 mt-1 flex gap-2">
                  <span>{project.segmentLengthMinutes}min smyčky</span>
                  {project.totalSegments > 0 && (
                    <>
                      <span>•</span>
                      <span>{project.totalSegments} souborů</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {new Date(project.date).toLocaleDateString('cs-CZ')}
                </div>
                {project.totalSegments > 0 && (
                  <div className="text-xs font-medium text-amber-500/80">
                    ~{project.totalSegments * project.segmentLengthMinutes} min záznamu
                  </div>
                )}
              </div>

              {project.folderPath && (
                <div className="text-xs font-mono text-zinc-500 truncate bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/50" title={project.folderPath}>
                  <span className="opacity-50">📂 </span>{project.folderPath}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {project.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 3 && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-zinc-800 text-zinc-500 rounded-md">
                    +{project.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
