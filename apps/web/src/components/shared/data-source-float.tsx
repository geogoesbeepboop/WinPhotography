"use client";

import { Database, TestTube2 } from "lucide-react";
import { useDataSourceStore } from "@/stores/admin-settings-store";

export function DataSourceFloat() {
  const { dataSource, toggleDataSource } = useDataSourceStore();
  const isApi = dataSource === "api";

  return (
    <button
      onClick={toggleDataSource}
      className={`fixed bottom-4 right-4 z-[90] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border transition-all duration-300 backdrop-blur-sm ${
        isApi
          ? "bg-green-900/90 border-green-700/50 text-green-300 hover:bg-green-800/90"
          : "bg-amber-900/90 border-amber-700/50 text-amber-300 hover:bg-amber-800/90"
      }`}
      style={{ fontSize: "0.7rem" }}
      title={`Data source: ${isApi ? "Live API" : "Mock Data"}. Click to toggle.`}
    >
      {isApi ? (
        <Database className="w-3.5 h-3.5" />
      ) : (
        <TestTube2 className="w-3.5 h-3.5" />
      )}
      <span className="tracking-[0.1em] uppercase font-medium">
        {isApi ? "Live" : "Mock"}
      </span>
    </button>
  );
}
