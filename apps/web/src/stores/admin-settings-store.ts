import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataSourceState {
  dataSource: 'api' | 'mock';
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setDataSource: (source: 'api' | 'mock') => void;
  toggleDataSource: () => void;
}

export const useDataSourceStore = create<DataSourceState>()(
  persist(
    (set) => ({
      dataSource: 'mock',
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setDataSource: (dataSource) => set({ dataSource }),
      toggleDataSource: () =>
        set((state) => ({
          dataSource: state.dataSource === 'api' ? 'mock' : 'api',
        })),
    }),
    {
      name: 'win-data-source',
      partialize: (state) => ({ dataSource: state.dataSource }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** @deprecated Use useDataSourceStore instead */
export const useAdminSettingsStore = useDataSourceStore;
