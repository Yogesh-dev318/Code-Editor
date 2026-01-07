import { create } from 'zustand';
import api from '../api/axios';

interface ProjectState {
    projects: any[];
    fetchProjects: () => Promise<void>;
    addProject: (name: string) => Promise<void>;
    joinProject: (projectId: string) => Promise<void>; // Add this definition
    deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    
    fetchProjects: async () => {
        try {
            const res = await api.get('/projects');
            set({ projects: res.data });
        } catch (err) { console.error("Fetch failed", err); }
    },

    addProject: async (name) => {
        try {
            await api.post('/projects', { name });
            get().fetchProjects();
        } catch (err) { console.error("Create failed", err); }
    },

    // --- ADD THIS ACTION ---
    joinProject: async (projectId) => {
        try {
            await api.post('/projects/join', { projectId });
            get().fetchProjects(); // Refresh list to show the new project
        } catch (err: any) {
            console.error("Join failed", err);
            throw err; // Throw so UI can handle alerts
        }
    },

    deleteProject: async (id) => {
        try {
            await api.delete(`/projects/${id}`);
            set(s => ({ projects: s.projects.filter(p => p._id !== id) }));
        } catch (err) { console.error("Delete failed", err); }
    }
}));