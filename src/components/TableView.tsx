import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  SlidersHorizontal,
  X,
  TrendingUp,
  Target,
} from 'lucide-react';
import { DailyPlanItem, PlanConfig, ResultStatus } from '../types';
import { formatBRL, calculatePlanMetrics } from '../utils/planCalculator';

interface TableViewProps {
  config: PlanConfig;
  items: DailyPlanItem[];
  onUpdateItemStatus: (
    dayNumber: number,
    status: ResultStatus
  ) => void;
  onSyncBalance: () => void;
  onUpdateCurrentBalance: (newBalance: number) => void;
  onResetPlanClick: () => void;
  isSyncing: boolean;
}

export const TableView: React.FC<TableViewProps> = ({
  config,
  items,
  onUpdateItemStatus,
  onSyncBalance,
  onUpdateCurrentBalance,
  onResetPlanClick,
  isSyncing,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeDropdownDay, setActiveDropdownDay] = useState<number | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [modalBalanceInput, setModalBalanceInput] = useState<string>('');

  const displayedItems = expanded ? items : items.slice(0, 5);
  const metrics = calculatePlanMetrics(config, items);

  const handleStatusSelect = (dayNumber: number, status: ResultStatus) => {
    onUpdateItemStatus(dayNumber, status);
    setActiveDropdownDay(null);
  };

  const handleOpenSyncModal = () => {
    setModalBalanceInput(
      config.currentBalance > 0
        ? String(config.currentBalance)
        : metrics.calculatedBalance > 0
        ? String(metrics.calculatedBalance)
        : String(config.initialBalance || '')
    );
    setIsSyncModalOpen(true);
  };

  const handleSaveModalBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(modalBalanceInput);
    if (!isNaN(parsed)) {
      onUpdateCurrentBalance(parsed);
      setIsSyncModalOpen(false);
    }
  };

  return (
    <section id="view-table-section" className="space-y-6">
      {/* Barra de Métricas e Saldo Real Atual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Saldo Real Atual */}
        <div className="bg-[#0b0e12] border border-amber-500/30 rounded-2xl p-4 glow-border shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500/90 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-500" />
              Saldo Real Atual
            </span>
            <button
              type="button"
              onClick={handleOpenSyncModal}
              className="text-[11px] text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer bg-[#141920] px-2 py-0.5 rounded border border-neutral-700/60"
              title="Ajustar saldo real manualmente"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Ajustar</span>
            </button>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white block">
              {formatBRL(config.currentBalance)}
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{config.brokerName || 'Corretora'} • Sincronizado</span>
            </div>
          </div>
        </div>

        {/* Card Banca Inicial */}
        <div className="bg-[#0b0e12] border border-neutral-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Banca Inicial
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              Início: {config.startDate}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-200 block">
              {formatBRL(config.initialBalance)}
            </span>
            <span className="text-[11px] text-neutral-500 block mt-1.5">
              Capital base de partida
            </span>
          </div>
        </div>

        {/* Card Resultado Líquido */}
        <div className="bg-[#0b0e12] border border-neutral-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" />
              Resultado Líquido
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                metrics.netProfit >= 0
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                  : 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
              }`}
            >
              {metrics.netProfit >= 0 ? 'LUCRO' : 'PREJUÍZO'}
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`text-xl sm:text-2xl font-bold font-mono tracking-tight block ${
                metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.netProfit >= 0 ? '+' : ''}
              {formatBRL(metrics.netProfit)}
            </span>
            <span className="text-[11px] text-neutral-500 block mt-1.5">
              {metrics.winCount} Wins • {metrics.lossCount} Losses ({metrics.completedDaysCount} dias)
            </span>
          </div>
        </div>

        {/* Card Meta Final do Plano */}
        <div className="bg-[#0b0e12] border border-neutral-800/80 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-neutral-400" />
              Meta Final
            </span>
            <span className="text-[10px] text-amber-500/80 font-mono font-bold">
              {config.durationDays} DIAS
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white block">
              {formatBRL(config.finalTarget)}
            </span>
            <span className="text-[11px] text-neutral-500 block mt-1.5">
              Projeção composta total
            </span>
          </div>
        </div>
      </div>

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
              title="Sincronizar saldo da corretora com base nas operações"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-500 ${
                  isSyncing ? 'animate-spin' : ''
                }`}
              />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar saldo'}</span>
            </button>

            <button
              id="adjust-balance-btn"
              type="button"
              onClick={handleOpenSyncModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#12161b] hover:bg-[#191f26] text-neutral-300 hover:text-white text-xs font-medium rounded-lg border border-neutral-700/60 transition-colors cursor-pointer"
              title="Informar saldo real da corretora manualmente"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ajustar Saldo</span>
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

      {/* Modal de Sincronização / Ajuste Manual do Saldo da Corretora */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e1319] border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative glow-border">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Sincronizar Saldo da Corretora
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Atualize o saldo real da sua conta de trading
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Informações Calculadas */}
            <div className="my-5 space-y-3">
              <div className="bg-[#141920] border border-neutral-800 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Saldo Atual Registrado:</span>
                  <span className="font-mono text-white font-semibold">
                    {formatBRL(config.currentBalance)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-400">
                  <span>Saldo Calculado pelo Plano:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {formatBRL(metrics.calculatedBalance)}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/80">
                  Banca Inicial ({formatBRL(config.initialBalance)}) {metrics.netProfit >= 0 ? '+' : ''}
                  {formatBRL(metrics.netProfit)} de operações
                </div>
              </div>

              {/* Formulário de Saldo Real */}
              <form onSubmit={handleSaveModalBalance} className="space-y-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="modal-saldo-corretora"
                      className="text-xs font-semibold text-neutral-300"
                    >
                      Saldo Real na Corretora (MT)
                    </label>
                    <button
                      type="button"
                      onClick={() => setModalBalanceInput(String(metrics.calculatedBalance))}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 cursor-pointer"
                    >
                      Usar saldo do plano
                    </button>
                  </div>
                  <input
                    id="modal-saldo-corretora"
                    type="number"
                    step="0.01"
                    value={modalBalanceInput}
                    onChange={(e) => setModalBalanceInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#12161b] border border-neutral-700/80 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono shadow-inner"
                    autoFocus
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center justify-end space-x-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSyncModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl transition-colors shadow-md cursor-pointer"
                  >
                    Confirmar e Sincronizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

