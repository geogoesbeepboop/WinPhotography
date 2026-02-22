import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  lightboxPhotoIndex: number | null;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  lightboxPhotoIndex: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openLightbox: (index) => set({ lightboxPhotoIndex: index }),
  closeLightbox: () => set({ lightboxPhotoIndex: null }),
}));
