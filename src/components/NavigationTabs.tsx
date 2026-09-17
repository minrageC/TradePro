import React from 'react';
import { Table, Sliders } from 'lucide-react';
import { ViewTab } from '../types';

interface NavigationTabsProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  brokerConnected: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentTab,
  onSelectTab,
  brokerConnected,
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-neutral-800/80">
      <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#0e1318] p-1 rounded-xl border border-neutral-800">
        <button
          id="tab-btn-table"
          type="button"
          onClick={() => onSelectTab('table')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'table'
              ? 'tab-active'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Visão Geral &amp; Tabela</span>
        </button>

        <button
          id="tab-btn-config"
          type="button"
          onClick={() => onSelectTab('config')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'config'
              ? 'tab-active'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurar Plano</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 text-xs text-neutral-500">
        <span>Status:</span>
        <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {brokerConnected ? 'Conectado à Corretora' : 'Modo Simulação'}
        </span>
      </div>
    </div>
  );
};
