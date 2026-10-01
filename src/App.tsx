import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { TableView } from './components/TableView';
import { ConfigView } from './components/ConfigView';
import { SupabaseVercelView } from './components/SupabaseVercelView';
import { PlanConfig, DailyPlanItem, ViewTab, ResultStatus } from './types';
import { generateDailyPlan, formatBRL, calculatePlanMetrics } from './utils/planCalculator';
import { getSupabaseSettings } from './lib/supabase';
import { savePlanToSupabase, loadPlanFromSupabase, testSupabaseConnection } from './services/supabaseService';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_CONFIG = 'traderpro_plan_config_v3';
const STORAGE_KEY_ITEMS = 'traderpro_plan_items_v3';

const DEFAULT_CONFIG: PlanConfig = {
  initialBalance: 0,
  finalTarget: 0,
  durationDays: 30,
  startDate: '2026-09-16',
  dailyProfitPercent: 0,
  stopLossPercent: 0,
  currentBalance: 0,
  brokerConnected: true,
  brokerName: 'Corretora Parceira',
};

export default function App() {
  const [config, setConfig] = useState<PlanConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentBalance === 0 && parsed.initialBalance > 0) {
          parsed.currentBalance = parsed.initialBalance;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const [items, setItems] = useState<DailyPlanItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return generateDailyPlan(DEFAULT_CONFIG);
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('table');
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  const autoSyncTimeoutRef = useRef<any>(null);

  // Check Supabase connection on startup
  const checkSupabase = useCallback(async () => {
    const settings = getSupabaseSettings();
    if (settings.isConfigured) {
      const res = await testSupabaseConnection();
      setSupabaseConnected(res.success);
    } else {
      setSupabaseConnected(false);
    }
  }, []);

  useEffect(() => {
    checkSupabase();
  }, [checkSupabase]);

  // Save to localStorage and auto-sync to Supabase if enabled
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }

    const settings = getSupabaseSettings();
    if (settings.isConfigured && settings.autoSync && supabaseConnected) {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
      autoSyncTimeoutRef.current = setTimeout(() => {
        savePlanToSupabase(config, items).catch(() => {});
      }, 1200);
    }
  }, [config, items, supabaseConnected]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Handle plan reconfiguration
  const handleSaveConfig = (newConfig: PlanConfig) => {
    if (newConfig.currentBalance === 0 && newConfig.initialBalance > 0) {
      newConfig.currentBalance = newConfig.initialBalance;
    }
    setConfig(newConfig);
    const newItems = generateDailyPlan(newConfig, items);
    setItems(newItems);
    setCurrentTab('table');
    showNotification('Plano reconfigurado com sucesso!');
  };

  // Handle applying remote plan loaded from Supabase
  const handleApplyRemotePlan = (remoteConfig: PlanConfig, remoteItems: DailyPlanItem[]) => {
    setConfig(remoteConfig);
    setItems(remoteItems);
    showNotification('Plano sincronizado do Supabase com sucesso!');
  };

  // Handle item status update
  const handleUpdateItemStatus = (
    dayNumber: number,
    status: ResultStatus
  ) => {
    const updated = items.map((it) => {
      if (it.dayNumber === dayNumber) {
        let actual = 0;
        if (status === 'win') {
          actual = it.targetProfit;
        } else if (status === 'loss') {
          actual = -it.stopLossAmount;
        }
        return {
          ...it,
          status,
          actualProfit: actual,
        };
      }
      return it;
    });

    // Re-calculate accumulated values
    const regenerated = generateDailyPlan(config, updated);
    setItems(regenerated);

    // Automatically update currentBalance to match updated operations
    const metrics = calculatePlanMetrics(config, regenerated);
    setConfig((prev) => ({
      ...prev,
      currentBalance: metrics.calculatedBalance,
    }));
  };

  // Synchronize broker balance with plan operations
  const handleSyncBalance = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const metrics = calculatePlanMetrics(config, items);
      const newBalance = metrics.calculatedBalance;

      setConfig((prev) => ({
        ...prev,
        currentBalance: newBalance,
      }));
      setIsSyncing(false);

      if (metrics.completedDaysCount > 0) {
        const sign = metrics.netProfit >= 0 ? '+' : '';
        showNotification(
          `Saldo sincronizado com sucesso: ${formatBRL(newBalance)} (Operações: ${sign}${formatBRL(metrics.netProfit)})`
        );
      } else {
        showNotification(`Saldo sincronizado com sucesso: ${formatBRL(newBalance)}`);
      }
    }, 600);
  };

  // Handle manual update of broker balance
  const handleUpdateCurrentBalance = (newBalance: number) => {
    const valid = Number.isFinite(newBalance) ? Math.max(0, newBalance) : 0;
    setConfig((prev) => ({
      ...prev,
      currentBalance: valid,
    }));
    showNotification(`Saldo real da corretora atualizado com sucesso: ${formatBRL(valid)}`);
  };

  const showNotification = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => {
      setSyncToast(null);
    }, 3500);
  };

  return (
    <div className="bg-[#07090c] text-neutral-200 min-h-screen font-sans antialiased selection:bg-amber-500/20 selection:text-amber-400">
      {/* Top Navigation Bar */}
      <Header
        balance={config.currentBalance}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <NavigationTabs
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'supabase') {
              checkSupabase();
            }
          }}
          brokerConnected={config.brokerConnected}
          supabaseConnected={supabaseConnected}
        />

        {/* Dynamic Views */}
        {currentTab === 'table' && (
          <TableView
            config={config}
            items={items}
            onUpdateItemStatus={handleUpdateItemStatus}
            onSyncBalance={handleSyncBalance}
            onUpdateCurrentBalance={handleUpdateCurrentBalance}
            onResetPlanClick={() => setCurrentTab('config')}
            isSyncing={isSyncing}
          />
        )}

        {currentTab === 'config' && (
          <ConfigView
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {currentTab === 'supabase' && (
          <SupabaseVercelView
            config={config}
            items={items}
            onApplyRemotePlan={handleApplyRemotePlan}
            onShowToast={showNotification}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-[#10161d] border border-amber-500/30 text-neutral-200 px-4 py-3 rounded-xl shadow-2xl animate-slideUp text-xs">
          <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}
    </div>
  );
}
