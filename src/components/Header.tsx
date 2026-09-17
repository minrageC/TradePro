import React from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { formatBRL } from '../utils/planCalculator';

interface HeaderProps {
  balance: number;
  showBalance: boolean;
  onToggleBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  showBalance,
  onToggleBalance,
}) => {
  return (
    <header className="w-full border-b border-neutral-800/60 bg-[#0a0d11]/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Indicador / Marca Esquerda */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-neutral-300">
            TraderPro{' '}
            <span className="text-amber-500 text-xs font-normal px-1.5 py-0.5 rounded bg-amber-500/10 ml-1">
              BETA
            </span>
          </span>
        </div>

        {/* Badge de Saldo Atualizado */}
        <div
          id="user-balance-badge"
          className="flex items-center space-x-2.5 bg-[#12171d] border border-neutral-700/60 rounded-full px-3.5 py-1.5 text-xs shadow-inner"
        >
          {/* Botão Olho */}
          <button
            id="toggle-balance-btn"
            type="button"
            aria-label={showBalance ? 'Ocultar Saldo' : 'Mostrar Saldo'}
            onClick={onToggleBalance}
            className="text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            {showBalance ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* Ícone Moeda Dourada */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-[10px] font-black text-amber-950 shadow-sm select-none">
            $
          </div>

          {/* Valor do Saldo */}
          <span className="font-bold tracking-tight text-white text-[13px] font-mono">
            {showBalance ? formatBRL(balance) : 'MT ••••••'}
          </span>
        </div>
      </div>
    </header>
  );
};
