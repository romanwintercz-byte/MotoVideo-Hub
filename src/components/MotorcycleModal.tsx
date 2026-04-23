import React, { useState } from 'react';
import { Motorcycle } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resizeImageFile } from '../utils/imageTools';

interface MotorcycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mc: Omit<Motorcycle, 'id' | 'createdAt'>) => void;
  initialData?: Motorcycle | null;
}

export function MotorcycleModal({ isOpen, onClose, onSave, initialData }: MotorcycleModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [make, setMake] = useState(initialData?.make || '');
  const [year, setYear] = useState(initialData?.year || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setMake(initialData?.make || '');
      setYear(initialData?.year || '');
      setImage(initialData?.image || '');
      setNotes(initialData?.notes || '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, make, year, image, notes });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-100">
              {initialData ? 'Upravit stroj' : 'Přidat motorku'}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="motorcycle-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Fotka z garáže</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const base64 = await resizeImageFile(e.target.files[0], 800);
                      setImage(base64);
                    }
                  }} 
                  className="hidden" 
                  id="mc-image-upload" 
                />
                <label 
                  htmlFor="mc-image-upload" 
                  className="flex items-center justify-center border-2 border-dashed border-zinc-700/50 rounded-xl h-48 cursor-pointer hover:bg-zinc-800/50 transition-all bg-cover bg-center overflow-hidden relative group" 
                  style={{ backgroundImage: image ? `url(${image})` : undefined }}
                >
                  {!image && <span className="text-zinc-500 text-sm flex items-center gap-2"><ImageIcon size={18}/> Vybrat fotku</span>}
                  {image && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">Změnit fotku</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Přezdívka / Název *</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="např. Moje krasavice, R6, Bavorák..."
                  className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Značka (Kód)</label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="např. Yamaha"
                    className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Rok výroby</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="např. 2018"
                    className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Poznámky (SPZ, pneu...)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Volitelné doplňující info k motorce."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 transition-all text-sm resize-none"
                />
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              form="motorcycle-form"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              Uložit stroj
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
