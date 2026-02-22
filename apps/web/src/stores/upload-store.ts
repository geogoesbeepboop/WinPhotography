import { create } from 'zustand';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface UploadState {
  files: UploadFile[];
  addFiles: (files: UploadFile[]) => void;
  updateProgress: (id: string, progress: number) => void;
  updateStatus: (id: string, status: UploadFile['status'], error?: string) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  files: [],
  addFiles: (newFiles) => set((state) => ({ files: [...state.files, ...newFiles] })),
  updateProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    })),
  updateStatus: (id, status, error) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, status, error } : f)),
    })),
  removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  clearCompleted: () =>
    set((state) => ({ files: state.files.filter((f) => f.status !== 'complete') })),
  reset: () => set({ files: [] }),
}));
