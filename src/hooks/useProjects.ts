import { useState, useEffect } from 'react';
import { RideProject } from '../types';

const STORAGE_KEY = 'motovideo_hub_projects_v2';

export function useProjects() {
  const [projects, setProjects] = useState<RideProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse projects from local storage');
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Omit<RideProject, 'id' | 'createdAt'>) => {
    const newProject: RideProject = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<RideProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.map(p => p).filter((p) => p.id !== id));
  };

  return { projects, addProject, updateProject, deleteProject };
}
