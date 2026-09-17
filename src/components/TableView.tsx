import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { DailyPlanItem, PlanConfig, ResultStatus } from '../types';
import { formatBRL } from '../utils/planCalculator';

interface TableViewProps {
  config: PlanConfig;
  items: DailyPlanItem[];
  onUpdateItemStatus: (
    dayNumber: number,
    status: ResultStatus
  ) => void;
  onSyncBalance: () => void;
  onResetPlanClick: () => void;
  isSyncing: boolean;
}

export const TableView: React.FC<TableViewProps> = ({
  config,
  items,
  onUpdateItemStatus,
  onSyncBalance,
  onResetPlanClick,
  isSyncing,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeDropdownDay, setActiveDropdownDay] = useState<number | null>(null);

  const displayedItems = expanded ? items : items.slice(0, 5);

  const handleStatusSelect = (dayNumber: number, status: ResultStatus) => {
    onUpdateItemStatus(dayNumber, status);
    setActiveDropdownDay(null);
  };

  return (
    <section id="view-table-section" className="space-y-6">
      {/* Card Container Principal */}
      <div className="bg-[#0b0e12] border border-neutral-800 rounded-2xl p-4 sm:p-6 glow-border shadow-2xl relative overflow-hidden">
        {/* Header da Seção de Gerenciamento */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div className="flex items-center space-x-3.5">
            {/* Ícone Documento / Prancheta Dourado */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Gerenciamento de Banca
              </h1>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
                PLANO DE {config.durationDays} DIAS{' '}
                <span className="text-amber-500/70">•</span>{' '}
                {config.dailyProfitPercent.toFixed(2)}% AO DIA
              </p>
            </div>
          </div>

          {/* Ações Superiores: Sincronizar e Redefinir */}
          <div className="flex items-center space-x-2.5 self-end sm:self-center">
            <button
              id="sync-balance-btn"
              type="button"
              onClick={onSyncBalance}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#14191f] hover:bg-[#1a222a] text-amber-500 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-500 ${
                  isSyncing ? 'animate-spin' : ''
                }`}
              />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar saldo'}</span>
            </button>

            <button
              id="reset-plan-btn"
              type="button"
              onClick={onResetPlanClick}
              className="px-3.5 py-2 bg-[#12161b] hover:bg-[#191f26] text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-neutral-700/60 transition-colors cursor-pointer"
            >
              Redefinir Plano
            </button>
          </div>
        </div>

        {/* Tabela de Metas Diárias */}
        <div className="overflow-x-auto mt-4 -mx-4 sm:mx-0">
          <table
            id="banca-table"
            data-purpose="banca-table"
            className="w-full text-left border-collapse min-w-[700px]"
          >
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800/80">
                <th className="py-3.5 px-4 font-medium">Data</th>
                <th className="py-3.5 px-4 font-medium">Meta</th>
                <th className="py-3.5 px-4 font-medium">Stop Loss</th>
                <th className="py-3.5 px-4 font-medium">Resultado</th>
                <th className="py-3.5 px-4 font-medium">Lucro Acum.</th>
                <th className="py-3.5 px-4 font-medium">Prejuízo Acum.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50 text-xs">
              {displayedItems.map((item) => {
                const isDropdownOpen = activeDropdownDay === item.dayNumber;

                return (
                  <tr
                    key={item.dayNumber}
                    className="hover:bg-neutral-800/20 transition-colors group"
                  >
                    {/* DATA */}
                    <td className="py-4 px-4 text-neutral-400 font-mono flex items-center gap-2">
                      <span>{item.date}</span>
                      <span className="text-[10px] text-neutral-600">
                        #{item.dayNumber}
                      </span>
                    </td>

                    {/* META */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white tracking-tight font-mono">
                        {formatBRL(item.targetBalance)}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium font-mono">
                        ({formatBRL(item.targetProfit)})
                      </div>
                    </td>

                    {/* STOP LOSS */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white tracking-tight font-mono">
                        {formatBRL(item.stopLossBalance)}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium font-mono">
                        ({formatBRL(item.stopLossAmount)})
                      </div>
                    </td>

                    {/* RESULTADO (DROPDOWN) */}
                    <td className="py-4 px-4 relative">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdownDay(
                              isDropdownOpen ? null : item.dayNumber
                            )
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg inline-flex items-center space-x-2 border transition-colors cursor-pointer ${
                            item.status === 'win'
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                              : item.status === 'loss'
                              ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                              : 'bg-[#151a20] hover:bg-[#1a2129] border-neutral-700/60 text-neutral-300'
                          }`}
                        >
                          <span className="capitalize">
                            {item.status === 'win'
                              ? 'Win (Meta)'
                              : item.status === 'loss'
                              ? 'Loss (Stop)'
                              : 'Pendente'}
                          </span>
                          <ChevronDown className="w-3 h-3 text-neutral-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-44 bg-[#11161d] border border-neutral-800 rounded-xl shadow-2xl py-1 z-30 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusSelect(item.dayNumber, 'pendente')
                              }
                              className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:bg-[#1a222c] hover:text-white flex items-center gap-2 cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Pendente</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusSelect(item.dayNumber, 'win')
                              }
                              className="w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-950/30 flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Win (Meta Batida)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusSelect(item.dayNumber, 'loss')
                              }
                              className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Loss (Stop Batido)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* LUCRO ACUM. */}
                    <td className="py-4 px-4 font-medium text-amber-500 font-mono">
                      {formatBRL(item.accumulatedProfit)}
                    </td>

                    {/* PREJUÍZO ACUM. */}
                    <td className="py-4 px-4 font-medium text-rose-500/80 font-mono">
                      {formatBRL(item.accumulatedLoss)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Botão Centralizado Expandir/Recolher Tabela */}
        <div className="mt-6 flex justify-center">
          <button
            id="toggle-expand-table-btn"
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="bg-[#13181f] hover:bg-[#1b222a] border border-neutral-700/60 text-neutral-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase inline-flex items-center space-x-2 shadow-lg transition-colors cursor-pointer"
          >
            <span>
              {expanded
                ? `RECOLHER TABELA (5 de ${items.length})`
                : `EXPANDIR TABELA (${items.length})`}
            </span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
