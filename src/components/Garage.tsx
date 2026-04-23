import React from 'react';
import { Motorcycle } from '../types';
import { motion } from 'motion/react';
import { Wrench, Trash2, Edit3, Bike } from 'lucide-react';

interface GarageProps {
  motorcycles: Motorcycle[];
  onEdit: (mc: Motorcycle) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function Garage({ motorcycles, onEdit, onDelete, onAdd }: GarageProps) {
  if (motorcycles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Garáž</h2>
            <p className="text-zinc-400 mt-1">Seznam tvých strojů.</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Bike size={20} />
            Zaparkovat motorku
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <Wrench size={48} className="mb-4 opacity-20" />
          <p>Tvoje garáž je zatím prázdná.</p>
          <p className="text-sm">Přidej si sem motorky, na kterých jezdíš.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Garáž</h2>
          <p className="text-zinc-400 mt-1">Správa tvých motorek pro záznamy vyjížděk.</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Bike size={20} />
          Přidat stroj
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {motorcycles.map((mc, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={mc.id}
            className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col relative"
          >
            {/* Actions overlay */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(mc); }}
                className="p-2 bg-zinc-900/80 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 rounded-lg backdrop-blur-sm transition-colors"
              >
                <Edit3 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(mc.id); }}
                className="p-2 bg-zinc-900/80 hover:bg-red-500 text-zinc-300 hover:text-white rounded-lg backdrop-blur-sm transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div 
              className="h-48 bg-zinc-950 relative border-b border-zinc-800/50 bg-cover bg-center flex items-center justify-center p-6"
              style={{ backgroundImage: mc.image ? `url(${mc.image})` : undefined }}
            >
              {mc.image && <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />}
              
              {!mc.image && (
                <Bike size={48} className="text-zinc-800" />
              )}
            </div>

            <div className="p-5 flex-1 relative z-10 -mt-8">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 shadow-xl inline-block mb-3 min-w-[80%]">
                <h3 className="text-xl font-bold text-zinc-100">{mc.name}</h3>
                {(mc.make || mc.year) && (
                  <p className="text-xs text-amber-500 font-medium mt-1">
                    {mc.make} {mc.year ? `(${mc.year})` : ''}
                  </p>
                )}
              </div>
              
              {mc.notes && (
                <p className="text-sm text-zinc-400 mt-2 line-clamp-3">
                  {mc.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
