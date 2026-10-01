import { getSupabaseClient, getSupabaseSettings } from '../lib/supabase';
import { PlanConfig, DailyPlanItem } from '../types';

export const SUPABASE_SCHEMA_SQL = `-- TRADERPRO - SCHEMA SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com)

create table if not exists public.trading_plans (
  id text primary key default 'primary_plan',
  user_id text default 'default_trader',
  initial_balance numeric not null default 0,
  final_target numeric not null default 0,
  current_balance numeric not null default 0,
  duration_days integer not null default 30,
  start_date text not null default '2026-09-16',
  daily_profit_percent numeric not null default 0,
  stop_loss_percent numeric not null default 0,
  broker_connected boolean default true,
  broker_name text default 'Corretora Parceira',
  config jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trading_plans enable row level security;

drop policy if exists "Permitir leitura de planos" on public.trading_plans;
create policy "Permitir leitura de planos"
  on public.trading_plans for select using (true);

drop policy if exists "Permitir inserção de planos" on public.trading_plans;
create policy "Permitir inserção de planos"
  on public.trading_plans for insert with check (true);

drop policy if exists "Permitir atualização de planos" on public.trading_plans;
create policy "Permitir atualização de planos"
  on public.trading_plans for update using (true) with check (true);

drop policy if exists "Permitir exclusão de planos" on public.trading_plans;
create policy "Permitir exclusão de planos"
  on public.trading_plans for delete using (true);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_trading_plans_updated on public.trading_plans;
create trigger on_trading_plans_updated
  before update on public.trading_plans
  for each row execute function public.handle_updated_at();

grant usage on schema public to anon, authenticated;
grant all on public.trading_plans to anon, authenticated;`;

export interface TestResult {
  success: boolean;
  message: string;
  tableExists: boolean;
}

/**
 * Testa a conexão com o Supabase utilizando credenciais atuais ou customizadas
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<TestResult> {
  const client = getSupabaseClient(customUrl, customKey);
  if (!client) {
    return {
      success: false,
      message: 'URL e Anon Key do Supabase são obrigatórias para conectar.',
      tableExists: false,
    };
  }

  try {
    // Tenta consultar a tabela de planos
    const { data, error } = await client
      .from('trading_plans')
      .select('id, updated_at')
      .limit(1);

    if (error) {
      // Se o erro for de tabela inexistente (42P01)
      if (
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('not found')
      ) {
        return {
          success: true,
          message:
            'Conexão com o Supabase bem-sucedida! Porém, a tabela "trading_plans" ainda não foi criada. Execute o script SQL no Supabase para criá-la.',
          tableExists: false,
        };
      }

      // Se for erro de autenticação ou RLS
      return {
        success: false,
        message: `Falha ao acessar tabela: ${error.message} (Código: ${error.code || 'desconhecido'})`,
        tableExists: false,
      };
    }

    const countRecords = data ? data.length : 0;
    return {
      success: true,
      message: `Conexão bem-sucedida! Tabela "trading_plans" encontrada e pronta para sincronizar (${countRecords} registro(s) no banco).`,
      tableExists: true,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Erro de rede ou URL inválida ao conectar ao Supabase.',
      tableExists: false,
    };
  }
}

/**
 * Salva ou atualiza o plano atual e seus itens no Supabase
 */
export async function savePlanToSupabase(
  config: PlanConfig,
  items: DailyPlanItem[]
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não está configurado. Conecte com URL e Chave Anon.',
    };
  }

  try {
    const payload = {
      id: 'primary_plan',
      user_id: 'default_trader',
      initial_balance: config.initialBalance,
      final_target: config.finalTarget,
      current_balance: config.currentBalance,
      duration_days: config.durationDays,
      start_date: config.startDate,
      daily_profit_percent: config.dailyProfitPercent,
      stop_loss_percent: config.stopLossPercent,
      broker_connected: config.brokerConnected,
      broker_name: config.brokerName,
      config: config,
      items: items,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from('trading_plans')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Plano e operações sincronizados com sucesso no Supabase!',
    };
  } catch (error: any) {
    console.error('Erro ao salvar no Supabase:', error);
    return {
      success: false,
      message: error.message || 'Erro desconhecido ao salvar no Supabase.',
    };
  }
}

/**
 * Carrega o plano e seus itens do Supabase
 */
export async function loadPlanFromSupabase(): Promise<{
  success: boolean;
  message: string;
  config?: PlanConfig;
  items?: DailyPlanItem[];
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não está configurado.',
    };
  }

  try {
    const { data, error } = await client
      .from('trading_plans')
      .select('*')
      .eq('id', 'primary_plan')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: 'Nenhum plano salvo encontrado no Supabase ainda.',
        };
      }
      throw error;
    }

    if (!data || !data.config || !Array.isArray(data.items)) {
      return {
        success: false,
        message: 'Os dados retornados do Supabase não possuem o formato esperado.',
      };
    }

    return {
      success: true,
      message: 'Dados recuperados com sucesso do Supabase!',
      config: data.config as PlanConfig,
      items: data.items as DailyPlanItem[],
    };
  } catch (error: any) {
    console.error('Erro ao carregar do Supabase:', error);
    return {
      success: false,
      message: error.message || 'Falha ao buscar dados no Supabase.',
    };
  }
}
