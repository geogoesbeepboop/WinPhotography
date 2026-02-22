import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataSourceState {
  dataSource: 'api' | 'mock';
  setDataSource: (source: 'api' | 'mock') => void;
  toggleDataSource: () => void;
}

export const useDataSourceStore = create<DataSourceState>()(
  persist(
    (set) => ({
      dataSource: 'mock',
      setDataSource: (dataSource) => set({ dataSource }),
      toggleDataSource: () =>
        set((state) => ({
          dataSource: state.dataSource === 'api' ? 'mock' : 'api',
        })),
    }),
    {
      name: 'win-data-source',
    },
  ),
);

/** @deprecated Use useDataSourceStore instead */
export const useAdminSettingsStore = useDataSourceStore;
