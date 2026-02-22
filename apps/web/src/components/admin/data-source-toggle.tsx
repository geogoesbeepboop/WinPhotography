"use client";

import { Database, TestTube2 } from "lucide-react";
import { useDataSourceStore } from "@/stores/admin-settings-store";

export function DataSourceToggle() {
  const { dataSource, toggleDataSource } = useDataSourceStore();
  const isApi = dataSource === "api";

  return (
    <button
      onClick={toggleDataSource}
      className={`flex items-center gap-2 px-3 py-2 w-full rounded transition-colors ${
        isApi
          ? "text-green-400 hover:bg-brand-main-light/50"
          : "text-amber-400 hover:bg-brand-main-light/50"
      }`}
      style={{ fontSize: "0.75rem" }}
      title={`Data source: ${isApi ? "Live API" : "Mock Data"}`}
    >
      {isApi ? (
        <Database className="w-4 h-4" />
      ) : (
        <TestTube2 className="w-4 h-4" />
      )}
      <span className="tracking-[0.05em]">
        {isApi ? "Live Data" : "Mock Data"}
      </span>
    </button>
  );
}
