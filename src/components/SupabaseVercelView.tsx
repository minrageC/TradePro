import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Settings2,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  getSupabaseSettings,
  saveCustomSupabaseSettings,
  clearCustomSupabaseSettings,
  StoredSupabaseConfig,
} from '../lib/supabase';
import {
  testSupabaseConnection,
  savePlanToSupabase,
  loadPlanFromSupabase,
  SUPABASE_SCHEMA_SQL,
  TestResult,
} from '../services/supabaseService';
import { PlanConfig, DailyPlanItem } from '../types';

interface SupabaseVercelViewProps {
  config: PlanConfig;
  items: DailyPlanItem[];
  onApplyRemotePlan: (config: PlanConfig, items: DailyPlanItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const SupabaseVercelView: React.FC<SupabaseVercelViewProps> = ({
  config,
  items,
  onApplyRemotePlan,
  onShowToast,
}) => {
  const [settings, setSettings] = useState<StoredSupabaseConfig>(() => getSupabaseSettings());
  const [urlInput, setUrlInput] = useState<string>(settings.url);
  const [keyInput, setKeyInput] = useState<string>(settings.anonKey);
  const [autoSyncInput, setAutoSyncInput] = useState<boolean>(settings.autoSync);

  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [syncingUpload, setSyncingUpload] = useState<boolean>(false);
  const [syncingDownload, setSyncingDownload] = useState<boolean>(false);

  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<'supabase' | 'sql' | 'vercel'>('supabase');

  useEffect(() => {
    const curr = getSupabaseSettings();
    setSettings(curr);
    setUrlInput(curr.url);
    setKeyInput(curr.anonKey);
    setAutoSyncInput(curr.autoSync);
  }, []);

  const handleSaveSettings = () => {
    saveCustomSupabaseSettings(urlInput, keyInput, autoSyncInput);
    const updated = getSupabaseSettings();
    setSettings(updated);
    onShowToast('Configurações do Supabase salvas com sucesso!');
    handleTest(urlInput, keyInput);
  };

  const handleClearSettings = () => {
    clearCustomSupabaseSettings();
    const updated = getSupabaseSettings();
    setSettings(updated);
    setUrlInput('');
    setKeyInput('');
    setTestResult(null);
    onShowToast('Credenciais locais removidas.');
  };

  const handleTest = async (testUrl?: string, testKey?: string) => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(testUrl || urlInput, testKey || keyInput);
    setTestResult(res);
    setTesting(false);
  };

  const handleUploadData = async () => {
    setSyncingUpload(true);
    const res = await savePlanToSupabase(config, items);
    setSyncingUpload(false);
    onShowToast(res.message);
  };

  const handleDownloadData = async () => {
    setSyncingDownload(true);
    const res = await loadPlanFromSupabase();
    setSyncingDownload(false);
    if (res.success && res.config && res.items) {
      onApplyRemotePlan(res.config, res.items);
      onShowToast('Plano e operações importados do Supabase com sucesso!');
    } else {
      onShowToast(res.message);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    onShowToast('Script SQL copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Status Header */}
      <div className="bg-[#0b0f14] border border-neutral-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Integração: Vercel (Front) + Supabase (Back/Banco)
                </h1>
                <p className="text-xs text-neutral-400">
                  Gerencie o armazenamento em nuvem PostgreSQL do Supabase e o deploy na Vercel.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {settings.isConfigured ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Supabase Conectado</span>
                {settings.isEnvConfigured && (
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded ml-1 font-mono">
                    .env / Vercel
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/60 text-neutral-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
                <span>Supabase Não Conectado</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation within Integration */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={() => setActiveStepTab('supabase')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStepTab === 'supabase'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-transparent'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>1. Conexão Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStepTab('sql')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStepTab === 'sql'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Script SQL da Tabela</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStepTab('vercel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeStepTab === 'vercel'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 border border-transparent'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>3. Deploy na Vercel</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONEXÃO SUPABASE */}
      {activeStepTab === 'supabase' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form de Credenciais */}
          <div className="lg:col-span-2 bg-[#0d1117] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Credenciais do Supabase</h2>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                Abrir Supabase Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="text"
                  placeholder="https://seu-projeto-id.supabase.co"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full bg-[#131922] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Encontrado em: <strong>Project Settings → API → Project URL</strong>
                </p>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1.5">
                  Project API Anon Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full bg-[#131922] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Encontrado em: <strong>Project Settings → API → Project API Keys → anon public</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoSyncCheck"
                  checked={autoSyncInput}
                  onChange={(e) => setAutoSyncInput(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="autoSyncCheck" className="text-neutral-300 text-xs cursor-pointer select-none">
                  Habilitar sincronização contínua na nuvem ao registrar operações
                </label>
              </div>
            </div>

            {/* Test Feedback Area */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? testResult.tableExists
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  testResult.tableExists ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  )
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {testResult.success
                      ? testResult.tableExists
                        ? 'Supabase Conectado e Pronto!'
                        : 'Atenção: Tabela Ausente'
                      : 'Falha na Conexão'}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">{testResult.message}</div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Salvar &amp; Conectar</span>
                </button>

                <button
                  type="button"
                  disabled={testing || !urlInput || !keyInput}
                  onClick={() => handleTest()}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
              </div>

              {settings.isConfigured && !settings.isEnvConfigured && (
                <button
                  type="button"
                  onClick={handleClearSettings}
                  className="px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Credenciais</span>
                </button>
              )}
            </div>
          </div>

          {/* Sincronização e Operações na Nuvem */}
          <div className="space-y-4">
            <div className="bg-[#0d1117] border border-neutral-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Cloud className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sincronização Manual
                </h3>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Envie seus dados atuais para o banco do Supabase ou restaure o plano salvo na nuvem
                para este dispositivo.
              </p>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={!settings.isConfigured || syncingUpload}
                  onClick={handleUploadData}
                  className="w-full py-2.5 px-3.5 bg-[#141b24] hover:bg-neutral-800 border border-neutral-700/80 disabled:opacity-40 text-neutral-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <UploadCloud className={`w-4 h-4 text-emerald-400 ${syncingUpload ? 'animate-bounce' : ''}`} />
                  <span>{syncingUpload ? 'Enviando...' : 'Enviar Dados Atuais para Supabase'}</span>
                </button>

                <button
                  type="button"
                  disabled={!settings.isConfigured || syncingDownload}
                  onClick={handleDownloadData}
                  className="w-full py-2.5 px-3.5 bg-[#141b24] hover:bg-neutral-800 border border-neutral-700/80 disabled:opacity-40 text-neutral-200 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <DownloadCloud className={`w-4 h-4 text-amber-400 ${syncingDownload ? 'animate-bounce' : ''}`} />
                  <span>{syncingDownload ? 'Baixando...' : 'Restaurar Dados do Supabase'}</span>
                </button>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Sincronização Híbrida
                </div>
                <p>
                  O TraderPro salva no <strong>armazenamento local (instantâneo)</strong> e também no{' '}
                  <strong>Supabase (nuvem multi-dispositivo)</strong> assim que você conectar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCRIPT SQL SUPABASE */}
      {activeStepTab === 'sql' && (
        <div className="bg-[#0d1117] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Script SQL de Criação da Tabela (Supabase PostgreSQL)
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Copia e executa no <strong>SQL Editor</strong> do seu painel Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-md"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copiado com Sucesso!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          <div className="bg-[#080b0f] border border-neutral-800 rounded-xl p-4 overflow-x-auto text-[11px] font-mono text-emerald-300/90 leading-relaxed max-h-96 select-all">
            <pre>{SUPABASE_SCHEMA_SQL}</pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="font-bold text-neutral-300">1. Abra o Supabase</span>
              <p className="text-neutral-400 text-[11px]">
                Acesse seu projeto no supabase.com e clique em <strong>SQL Editor</strong> na barra lateral.
              </p>
            </div>
            <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="font-bold text-neutral-300">2. Cole o Script</span>
              <p className="text-neutral-400 text-[11px]">
                Clique no botão <strong>New Query</strong> e cole o código SQL acima.
              </p>
            </div>
            <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="font-bold text-neutral-300">3. Execute (Run)</span>
              <p className="text-neutral-400 text-[11px]">
                Clique em <strong>Run</strong>. A tabela <code className="text-emerald-400 font-mono">trading_plans</code> e políticas RLS serão criadas!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPLOY NA VERCEL */}
      {activeStepTab === 'vercel' && (
        <div className="bg-[#0d1117] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" />
                Como Conectar o Frontend na Vercel
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Passo a passo para publicar seu TraderPro com zero complicações na Vercel.
              </p>
            </div>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noreferrer"
              className="text-xs bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              Criar Projeto Vercel
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            {/* Passo 1 */}
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                  1
                </span>
                <span>Configuração Automática (Já pronta no projeto!)</span>
              </div>
              <p className="text-neutral-400">
                O arquivo <code className="text-amber-400 bg-neutral-800 px-1.5 py-0.5 rounded font-mono">vercel.json</code> já foi adicionado na raiz do projeto com as regras de SPA rewrite:
              </p>
              <div className="bg-[#080b0f] p-2.5 rounded-lg font-mono text-[11px] text-neutral-300">
                {`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`}
              </div>
            </div>

            {/* Passo 2 */}
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Variáveis de Ambiente na Vercel</span>
              </div>
              <p className="text-neutral-400">
                Na página de importação do projeto na Vercel (ou em <strong>Project Settings → Environment Variables</strong>), adicione as duas variáveis:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div className="bg-[#080b0f] p-3 rounded-lg border border-neutral-800 font-mono text-[11px] space-y-1">
                  <div className="text-amber-400 font-semibold">VITE_SUPABASE_URL</div>
                  <div className="text-neutral-400 truncate">Sua URL do Supabase (ex: https://xxx.supabase.co)</div>
                </div>
                <div className="bg-[#080b0f] p-3 rounded-lg border border-neutral-800 font-mono text-[11px] space-y-1">
                  <div className="text-amber-400 font-semibold">VITE_SUPABASE_ANON_KEY</div>
                  <div className="text-neutral-400 truncate">Sua chave pública anônima do Supabase</div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Build &amp; Output Settings</span>
              </div>
              <p className="text-neutral-400">
                A Vercel detecta Vite automaticamente. Confirme que as opções estão:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-300 font-mono text-[11px]">
                <li><strong>Framework Preset:</strong> Vite</li>
                <li><strong>Build Command:</strong> <code className="text-emerald-400">npm run build</code></li>
                <li><strong>Output Directory:</strong> <code className="text-emerald-400">dist</code></li>
                <li><strong>Install Command:</strong> <code className="text-emerald-400">npm install</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
