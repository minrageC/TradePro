import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Sparkles } from 'lucide-react';
import { PlanConfig } from '../types';

interface ConfigViewProps {
  config: PlanConfig;
  onSaveConfig: (newConfig: PlanConfig) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [initialBalance, setInitialBalance] = useState<number>(
    config.initialBalance
  );
  const [finalTarget, setFinalTarget] = useState<number>(config.finalTarget);
  const [durationDays, setDurationDays] = useState<number>(config.durationDays);
  const [startDate, setStartDate] = useState<string>(config.startDate);
  const [dailyProfitPercent, setDailyProfitPercent] = useState<number>(
    config.dailyProfitPercent
  );
  const [stopLossPercent, setStopLossPercent] = useState<number>(
    config.stopLossPercent
  );
  const [currentBalance, setCurrentBalance] = useState<number>(
    config.currentBalance
  );

  useEffect(() => {
    setInitialBalance(config.initialBalance);
    setFinalTarget(config.finalTarget);
    setDurationDays(config.durationDays);
    setStartDate(config.startDate);
    setDailyProfitPercent(config.dailyProfitPercent);
    setStopLossPercent(config.stopLossPercent);
    setCurrentBalance(config.currentBalance);
  }, [config]);

  const handleInitialBalanceChange = (val: number) => {
    setInitialBalance(val);
    if (currentBalance === 0 || currentBalance === initialBalance) {
      setCurrentBalance(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalInitBalance = Number.isFinite(Number(initialBalance)) ? Number(initialBalance) : 0;
    let finalCurrentBalance = Number.isFinite(Number(currentBalance)) ? Number(currentBalance) : 0;
    if (finalCurrentBalance === 0 && finalInitBalance > 0) {
      finalCurrentBalance = finalInitBalance;
    }

    onSaveConfig({
      ...config,
      initialBalance: finalInitBalance,
      finalTarget: Number.isFinite(Number(finalTarget)) ? Number(finalTarget) : 0,
      durationDays: Number(durationDays) || 30,
      startDate: startDate || '2026-09-16',
      dailyProfitPercent: Number.isFinite(Number(dailyProfitPercent)) ? Number(dailyProfitPercent) : 0,
      stopLossPercent: Number.isFinite(Number(stopLossPercent)) ? Number(stopLossPercent) : 0,
      currentBalance: finalCurrentBalance,
    });
  };

  return (
    <section id="view-config-section" className="space-y-6">
      <div className="bg-[#0b0e12] border border-neutral-800 rounded-2xl p-6 sm:p-8 glow-border shadow-2xl">
        {/* Top Header da Caixa */}
        <div className="flex items-center space-x-3.5 pb-6 border-b border-neutral-800/80">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Gerenciamento de Banca
            </h2>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500">
              CONFIGURE SEU PLANO
            </p>
          </div>
        </div>

        {/* Form Heading */}
        <div className="mt-6 mb-6">
          <h3 className="text-base font-semibold text-white">
            Configure seu Plano
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Defina suas metas financeiras e parâmetros de gerenciamento.
          </p>
        </div>

        {/* Formulário Grid (2 Colunas conforme o print) */}
        <form
          data-purpose="form-banca-config"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Banca Inicial */}
            <div>
              <label
                htmlFor="banca-inicial"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Banca Inicial (MT)
              </label>
              <input
                id="banca-inicial"
                type="number"
                step="any"
                value={initialBalance}
                onChange={(e) => handleInitialBalanceChange(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#12161b] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors shadow-inner"
              />
            </div>

            {/* Meta Final */}
            <div className="relative">
              <label
                htmlFor="meta-final"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Meta Final (MT)
              </label>
              <input
                id="meta-final"
                type="number"
                step="any"
                value={finalTarget}
                onChange={(e) => setFinalTarget(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[#12161b] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors shadow-inner"
              />
            </div>

            {/* Duração (Dias) */}
            <div>
              <label
                htmlFor="duracao-dias"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Duração (Dias)
              </label>
              <div className="relative">
                <select
                  id="duracao-dias"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                  className="w-full bg-[#12161b] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 appearance-none transition-colors cursor-pointer"
                >
                  <option value={7}>7 Dias (1 Semana)</option>
                  <option value={15}>15 Dias</option>
                  <option value={30}>30 Dias</option>
                  <option value={60}>60 Dias</option>
                  <option value={90}>90 Dias</option>
                  <option value={120}>120 Dias</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19 9l-7 7-7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Data de Início */}
            <div>
              <label
                htmlFor="data-inicio"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Data de Início
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="data-inicio"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#12161b] border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Lucro Diário % (Ideal) */}
            <div>
              <label
                htmlFor="lucro-diario"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Lucro Diário % (Ideal)
              </label>
              <input
                id="lucro-diario"
                type="number"
                step="0.01"
                value={dailyProfitPercent}
                onChange={(e) =>
                  setDailyProfitPercent(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="w-full bg-[#12161b] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors shadow-inner"
              />
            </div>

            {/* Stop Loss Diário % */}
            <div>
              <label
                htmlFor="stop-loss"
                className="block text-xs font-medium text-neutral-300 mb-2"
              >
                Stop Loss Diário %
              </label>
              <input
                id="stop-loss"
                type="number"
                step="0.01"
                value={stopLossPercent}
                onChange={(e) =>
                  setStopLossPercent(parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className="w-full bg-[#12161b] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Saldo Atual Sincronizado */}
          <div className="bg-[#0e1318] p-4 rounded-xl border border-neutral-800/80 mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-neutral-300 block">
                  Saldo Real Atual da Corretora
                </span>
                <span className="text-[11px] text-neutral-500">
                  Utilizado para calcular a diferença e meta do dia atual.
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-44">
                  <input
                    type="number"
                    step="0.01"
                    value={currentBalance}
                    onChange={(e) =>
                      setCurrentBalance(parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-[#141920] border border-neutral-700/60 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                {initialBalance > 0 && currentBalance !== initialBalance && (
                  <button
                    type="button"
                    onClick={() => setCurrentBalance(initialBalance)}
                    className="px-2.5 py-2 text-[11px] font-medium bg-[#1a222c] hover:bg-[#222d3a] text-amber-400 rounded-lg border border-amber-500/30 whitespace-nowrap transition-colors cursor-pointer"
                    title="Definir igual à Banca Inicial"
                  >
                    Usar Banca
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botão Dourado/Âmbar Gerar Plano */}
          <div className="pt-4">
            <button
              id="generate-plan-submit-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 uppercase tracking-wide flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Gerar Plano</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
