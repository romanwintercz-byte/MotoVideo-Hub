import React, { useState } from 'react';
import { RideProject, Highlight, ProjectStatus, TelemetryData, CameraView } from '../types';
import { X, Plus, Trash2, Clock, Map, Activity, FolderOpen, ArrowUpCircle, ArrowDownCircle, SplitSquareVertical, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resizeImageFile } from '../utils/imageTools';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<RideProject, 'id' | 'createdAt'>) => void;
  initialData?: RideProject | null;
}

export function ProjectModal({ isOpen, onClose, onSave, initialData }: ProjectModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [folderPath, setFolderPath] = useState(initialData?.folderPath || '');
  const [segmentLengthMinutes, setSegmentLengthMinutes] = useState<1 | 2 | 3>(initialData?.segmentLengthMinutes || 3);
  const [totalSegments, setTotalSegments] = useState<number>(initialData?.totalSegments || 0);
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || 'raw');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [highlights, setHighlights] = useState<Highlight[]>(initialData?.highlights || []);
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialData?.telemetry || { hasDiablo: false, hasAmazfit: false, syncOffsetMs: 0 });
  const [motorcycle, setMotorcycle] = useState(initialData?.motorcycle || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');

  // Custom Tag input
  const [tagInput, setTagInput] = useState('');

  // Highlight inputs
  const [hlSourceFile, setHlSourceFile] = useState('');
  const [hlTime, setHlTime] = useState('');
  const [hlNote, setHlNote] = useState('');
  const [hlCamera, setHlCamera] = useState<CameraView>('front');

  // Reset form when opened with new data
  React.useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setDate(initialData?.date || new Date().toISOString().split('T')[0]);
      setFolderPath(initialData?.folderPath || '');
      setSegmentLengthMinutes(initialData?.segmentLengthMinutes || 3);
      setTotalSegments(initialData?.totalSegments || 0);
      setStatus(initialData?.status || 'raw');
      setSelectedTags(initialData?.tags || []);
      setNotes(initialData?.notes || '');
      setHighlights(initialData?.highlights || []);
      setTelemetry(initialData?.telemetry || { hasDiablo: false, hasAmazfit: false, syncOffsetMs: 0 });
      setMotorcycle(initialData?.motorcycle || '');
      setCoverImage(initialData?.coverImage || '');
      setTagInput('');
      setHlSourceFile('');
      setHlTime('');
      setHlNote('');
      setHlCamera('front');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !selectedTags.includes(val)) {
        setSelectedTags([...selectedTags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const toggleTelemetry = (key: keyof TelemetryData) => {
    setTelemetry(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addHighlight = () => {
    if (!hlTime || !hlNote) return; // Note we don't strictly require sourceFile if they just want general time
    setHighlights([...highlights, { 
      id: crypto.randomUUID(), 
      sourceFile: hlSourceFile || 'Nevyplněno', 
      time: hlTime, 
      note: hlNote,
      camera: hlCamera
    }]);
    setHlSourceFile('');
    setHlTime('');
    setHlNote('');
    // Keep the same camera selected for convenience
  };

  const removeHighlight = (id: string) => {
    setHighlights(highlights.filter((h) => h.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      date,
      folderPath,
      segmentLengthMinutes,
      totalSegments,
      status,
      tags: selectedTags,
      notes,
      highlights,
      telemetry,
      coverImage,
      motorcycle
    });
    onClose();
  };

  const getCameraBadge = (cam: CameraView) => {
    switch (cam) {
      case 'front': return <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded text-xs font-medium"><ArrowUpCircle size={12} /> Přední</span>;
      case 'rear': return <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-medium"><ArrowDownCircle size={12} /> Zadní</span>;
      case 'dual': return <span className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded text-xs font-medium"><SplitSquareVertical size={12} /> Obě (PiP)</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-100">
              {initialData ? 'Upravit vyjížďku' : 'Přidat novou vyjížďku (Projekt)'}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">1. Základní informace</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Název vyjížďky *</label>
                    <input
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="např. Nedělní Slapy"
                      className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Datum</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Motorka (Stroj)</label>
                    <input
                      type="text"
                      value={motorcycle}
                      onChange={(e) => setMotorcycle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                      placeholder="např. Yamaha MT-07"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <label className="block text-sm font-medium text-zinc-300">Náhledový obrázek (Netflix Cover)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const base64 = await resizeImageFile(e.target.files[0], 800);
                        setCoverImage(base64);
                      }
                    }} 
                    className="hidden" 
                    id="cover-upload" 
                  />
                  <label 
                    htmlFor="cover-upload" 
                    className="flex items-center justify-center border-2 border-dashed border-zinc-700/50 rounded-xl h-40 cursor-pointer hover:bg-zinc-800/50 transition-all bg-cover bg-center overflow-hidden relative group" 
                    style={{ backgroundImage: coverImage ? `url(${coverImage})` : undefined }}
                  >
                    {!coverImage && <span className="text-zinc-500 text-sm flex items-center gap-2"><ImageIcon size={18}/> Ozdob tenhle projekt fotkou</span>}
                    {coverImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium flex items-center gap-2"><ImageIcon size={16}/>Změnit fotku</span>
                      </div>
                    )}
                  </label>
                  {coverImage && (
                    <button type="button" onClick={() => setCoverImage('')} className="text-xs text-red-500 hover:text-red-400 mt-2 block ml-auto font-medium transition-colors">
                      Odstranit obrázek
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2: Camera Files */}
              <div className="space-y-4 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FolderOpen size={16} />
                  2. Soubory z AOOCCI BX
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-12 space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Složka na počítači</label>
                    <input
                      type="text"
                      value={folderPath}
                      onChange={(e) => setFolderPath(e.target.value)}
                      placeholder="např. D:\AOOCCI\2026\Slapy"
                      className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2 text-zinc-100 font-mono text-sm"
                    />
                  </div>
                  
                  <div className="md:col-span-6 space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Délka jedné smyčky</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((min) => (
                        <button
                          key={min}
                          type="button"
                          onClick={() => setSegmentLengthMinutes(min as 1|2|3)}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                            segmentLengthMinutes === min
                              ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                              : 'bg-zinc-950 border-zinc-700/50 text-zinc-400 hover:border-zinc-500'
                          }`}
                        >
                          {min} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-2">
                    <label className="block text-sm font-medium text-zinc-300">Přibližný počet souborů (odhad)</label>
                    <input
                      type="number"
                      min="0"
                      value={totalSegments}
                      onChange={(e) => setTotalSegments(parseInt(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100"
                    />
                  </div>
                </div>
                {totalSegments > 0 && (
                  <p className="text-xs text-amber-500 font-medium">
                    Celkový hrubý čas: cca {totalSegments * segmentLengthMinutes} minut.
                  </p>
                )}
              </div>

              {/* Section 3: Telemetry */}
              <div className="space-y-4 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">3. Telemetrie & Zdrojová data</h3>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => toggleTelemetry('hasDiablo')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      telemetry.hasDiablo 
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className={telemetry.hasDiablo ? 'text-red-500' : 'text-zinc-600'}>
                      <Map size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Diablo Super Biker</div>
                      <div className="text-xs opacity-70">Mám GPX (Rychlost, GPS)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTelemetry('hasAmazfit')}
                    className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      telemetry.hasAmazfit 
                        ? 'bg-zinc-800 border-zinc-600 text-zinc-100' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <div className={telemetry.hasAmazfit ? 'text-blue-500' : 'text-zinc-600'}>
                      <Activity size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">Amazfit Bip 6</div>
                      <div className="text-xs opacity-70">Mám TCX (Tepová frekvence)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section 4: Organization */}
              <div className="space-y-4 pt-6 border-t border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">4. Organizace</h3>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Stav projektu</label>
                  <div className="flex gap-3">
                    {(['raw', 'editing', 'done'] as ProjectStatus[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          status === s
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                            : 'bg-zinc-950 border-zinc-700/50 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {s === 'raw' ? 'K setřídění' : s === 'editing' ? 'Ve střižně' : 'Hotovo'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-zinc-300">Vlastní štítky (Tagy)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Napiš štítek viz 'Alpy 2026' a stiskni Enter..."
                    className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium text-sm"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-amber-500/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 5: Highlights */}
              <div className="space-y-4 pt-6 border-t border-zinc-800 bg-zinc-950/50 -mx-6 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">5. Značky v čase (Highlights)</h3>
                  <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-1 rounded-md">{highlights.length} značek</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Protože máš videa rozdělená na smyčky, nezapomeň si poznamenat do jakého souboru ses zrovna díval.
                </p>
                
                <div className="flex flex-col gap-3">
                  <div className="flex bg-zinc-900 border border-zinc-700/50 rounded-lg p-1 w-full md:w-max">
                    <button
                      type="button"
                      onClick={() => setHlCamera('front')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        hlCamera === 'front' ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <ArrowUpCircle size={14} /> Přední
                    </button>
                    <button
                      type="button"
                      onClick={() => setHlCamera('rear')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        hlCamera === 'rear' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <ArrowDownCircle size={14} /> Zadní
                    </button>
                    <button
                      type="button"
                      onClick={() => setHlCamera('dual')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        hlCamera === 'dual' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <SplitSquareVertical size={14} /> Obě (PiP)
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 items-start">
                    <div className="w-full md:w-[220px]">
                      <input
                        type="text"
                        value={hlSourceFile}
                        onChange={(e) => setHlSourceFile(e.target.value)}
                        placeholder="Soubor (např. -40)"
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm font-mono"
                      />
                    </div>
                    <div className="w-full md:w-24">
                      <input
                        type="text"
                        value={hlTime}
                        onChange={(e) => setHlTime(e.target.value)}
                        placeholder="Čas 01:45"
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm font-mono"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={hlNote}
                        onChange={(e) => setHlNote(e.target.value)}
                        placeholder="Co se stalo? (např. srnka přes cestu)"
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addHighlight}
                      disabled={!hlTime || !hlNote}
                      className="p-2.5 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end md:self-auto w-full md:w-auto flex justify-center"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {highlights.length > 0 && (
                  <div className="space-y-2 mt-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {highlights.map((hl) => (
                      <div key={hl.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-700/50 rounded-lg p-3 group">
                        <div className="flex items-center gap-3">
                          {getCameraBadge(hl.camera)}
                          <span className="text-zinc-500 font-mono text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800 shrink-0">
                            {hl.sourceFile}
                          </span>
                          <span className="flex items-center gap-1 text-amber-500 font-mono text-sm bg-amber-500/10 px-2 py-1 rounded shrink-0">
                            <Clock size={14} />
                            {hl.time}
                          </span>
                          <span className="text-zinc-300 text-sm truncate">{hl.note}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeHighlight(hl.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2 pt-6 border-t border-zinc-800">
                <label className="block text-sm font-medium text-zinc-300">Obecné poznámky k vyjížďce</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jak se jelo? Kdo jel s tebou?"
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm resize-none"
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              form="project-form"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              Uložit projekt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
