import React, { useState, useRef } from 'react';
import { useProjects } from './hooks/useProjects';
import { Library } from './components/Library';
import { ProjectModal } from './components/ProjectModal';
import { RideProject } from './types';
import { Plus, LayoutDashboard, FolderOpen, Settings, Bike, Map, Activity, Clock, Download, Upload } from 'lucide-react';
import { backupDatabase } from './utils/exportTools';

export default function App() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<RideProject | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'settings'>('library');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (project?: RideProject) => {
    setEditingProject(project || null);
    setIsModalOpen(true);
  };

  const handleSaveProject = (projectData: Omit<RideProject, 'id' | 'createdAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      addProject(projectData);
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          localStorage.setItem('motovideo_hub_projects_v2', JSON.stringify(data));
          window.location.reload();
        } else {
          alert('Nepodporovaný formát zálohy.');
        }
      } catch (err) {
        alert('Chyba při čtení souboru.');
      }
    };
    reader.readAsText(file);
  };

  // Simple stats
  const rawCount = projects.filter(p => p.status === 'raw').length;
  const doneCount = projects.filter(p => p.status === 'done').length;
  const totalHighlights = projects.reduce((acc, p) => acc + p.highlights.length, 0);
  const totalMinutes = projects.reduce((acc, p) => acc + (p.totalSegments * p.segmentLengthMinutes), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800/50 bg-zinc-950/50 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20">
            <Bike size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MotoVideo</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Hub</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800/50 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <LayoutDashboard size={18} />
            Přehled
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-zinc-800/50 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FolderOpen size={18} />
            Knihovna vyjížděk
            <span className="ml-auto bg-zinc-800 text-xs py-0.5 px-2 rounded-full text-zinc-300">
              {projects.length}
            </span>
          </button>
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-zinc-800/50 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Settings size={18} />
            Nastavení
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md z-10">
          <h2 className="text-xl font-semibold text-zinc-100">
            {activeTab === 'dashboard' ? 'Přehled' : 'Knihovna vyjížděk (Projekty)'}
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus size={18} />
            Přidat vyjížďku
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm font-medium mb-1 flex items-center gap-2">
                      <FolderOpen size={16} /> Celkem projektů
                    </p>
                    <p className="text-3xl font-bold text-zinc-100">{projects.length}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm font-medium mb-1 flex items-center gap-2">
                      <Clock size={16} /> Záznamu (min)
                    </p>
                    <p className="text-3xl font-bold text-amber-500">~{totalMinutes}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <p className="text-zinc-400 text-sm font-medium mb-1">Zajímavé momenty</p>
                    <p className="text-3xl font-bold text-blue-400">{totalHighlights}</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center gap-3">
                     <div className="flex items-center gap-3 text-zinc-300 text-sm">
                       <Map size={16} className="text-red-500" />
                       {projects.filter(p => p.telemetry.hasDiablo).length}x Trasy
                     </div>
                     <div className="flex items-center gap-3 text-zinc-300 text-sm">
                       <Activity size={16} className="text-blue-500" />
                       {projects.filter(p => p.telemetry.hasAmazfit).length}x Tepovka
                     </div>
                  </div>
                </div>

                {/* Quick actions / Info */}
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 text-center">
                  <h3 className="text-lg font-medium text-zinc-200 mb-2">Jak fungují Projekty?</h3>
                  <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
                    Už nemusíš přidávat videa po jednom. Založ si "Vyjížďku", zadej do ní cestu ke složce se všemi 1, 2 nebo 3 minutovými smyčkami z tvé AOOCCI BX kamery. Poté označ, zda máš nahraná data z Diabla nebo Amazfitu a do značek (highlights) si piš přímo číslo souboru (např. <code>REC_005</code>), ve kterém se nachází zajímavá akce.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <Library
                projects={projects}
                onEdit={handleOpenModal}
                onDelete={deleteProject}
              />
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100">Nastavení aplikace</h2>
                  <p className="text-zinc-400 mt-1">Zálohuj svá data nebo je obnov z počítače.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-zinc-100 mb-4">Záchranný kruh (Zálohování)</h3>
                  <p className="text-sm text-zinc-400 mb-6">
                    MotoVideo Hub běží aktuálně kompletně ve tvém prohlížeči a data nikam na internet neposílá. 
                    Pokud ale promažeš historii prohlížeče, přijdeš o ně. Pravidelně svá data stahuj jako JSON soubor.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => backupDatabase(projects)}
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-5 py-2.5 rounded-lg font-medium transition-colors border border-zinc-700"
                    >
                      <Download size={20} />
                      Zálohovat do PC
                    </button>

                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleRestore}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 px-5 py-2.5 rounded-lg font-medium transition-colors border border-amber-500/20"
                    >
                      <Upload size={20} />
                      Načíst ze zálohy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
}
