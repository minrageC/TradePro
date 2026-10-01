import React from 'react';
import { Table, Sliders, Database } from 'lucide-react';
import { ViewTab } from '../types';

interface NavigationTabsProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  brokerConnected: boolean;
  supabaseConnected?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentTab,
  onSelectTab,
  brokerConnected,
  supabaseConnected = false,
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-neutral-800/80">
      <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#0e1318] p-1 rounded-xl border border-neutral-800 flex-wrap">
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

        <button
          id="tab-btn-supabase"
          type="button"
          onClick={() => onSelectTab('supabase')}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'supabase'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="flex items-center gap-1.5">
            Vercel &amp; Supabase
            {supabaseConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            )}
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-3 text-xs text-neutral-500">
        <button
          type="button"
          onClick={() => onSelectTab('supabase')}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-neutral-800"
          title="Status do Banco Supabase"
        >
          <Database className={`w-3 h-3 ${supabaseConnected ? 'text-emerald-400' : 'text-neutral-500'}`} />
          <span>{supabaseConnected ? 'Supabase Conectado' : 'Supabase Offline'}</span>
        </button>

        <div className="flex items-center space-x-1.5 text-neutral-500">
          <span>Corretora:</span>
          <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {brokerConnected ? 'Conectado' : 'Simulação'}
          </span>
        </div>
      </div>
    </div>
  );
};
