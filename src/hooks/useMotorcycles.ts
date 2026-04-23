import { useState, useEffect } from 'react';
import { Motorcycle } from '../types';

const STORAGE_KEY = 'motovideo_hub_motorcycles_v1';

export function useMotorcycles() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse motorcycles from local storage', e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(motorcycles));
  }, [motorcycles]);

  const addMotorcycle = (mc: Omit<Motorcycle, 'id' | 'createdAt'>) => {
    const newMc: Motorcycle = {
      ...mc,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setMotorcycles((prev) => [...prev, newMc]);
  };

  const updateMotorcycle = (id: string, updates: Partial<Omit<Motorcycle, 'id' | 'createdAt'>>) => {
    setMotorcycles((prev) =>
      prev.map((mc) => (mc.id === id ? { ...mc, ...updates } : mc))
    );
  };

  const deleteMotorcycle = (id: string) => {
    setMotorcycles((prev) => prev.filter((mc) => mc.id !== id));
  };

  return { motorcycles, addMotorcycle, updateMotorcycle, deleteMotorcycle, setMotorcycles };
}
