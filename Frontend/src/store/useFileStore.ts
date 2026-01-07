import { create } from 'zustand';
import api from '../api/axios';

interface FileState {
    files: any[]; 
    activeFile: any;
    fetchFiles: (pid: string) => Promise<void>;
    createFile: (name: string, pid: string) => Promise<void>;
    deleteFile: (fid: string) => Promise<void>;
    setActiveFile: (file: any) => void;
    updateFileContent: (fid: string, content: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
    files: [], 
    activeFile: null,

    fetchFiles: async (pid) => {
        const res = await api.get(`/projects/${pid}`);
        set({ files: res.data.files, activeFile: res.data.files[0] || null });
    },

    createFile: async (name, pid) => {
        const res = await api.post('/files', { name, projectId: pid });
        set(s => ({ files: [...s.files, res.data] }));
    },

    deleteFile: async (fid) => {
        await api.delete(`/files/${fid}`);
        set(s => ({ files: s.files.filter(f => f._id !== fid), activeFile: null }));
    },

    setActiveFile: (file) => set({ activeFile: file }),

    updateFileContent: (fid, content) => set(s => ({
        files: s.files.map(f => f._id === fid ? { ...f, content } : f),
        activeFile: s.activeFile?._id === fid ? { ...s.activeFile, content } : s.activeFile
    }))
}));