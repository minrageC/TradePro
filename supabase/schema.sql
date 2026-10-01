-- ==============================================================================
-- TRADERPRO - SCHEMA SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do seu projeto Supabase (supabase.com)
-- ==============================================================================

-- 1. Criação da tabela de planos de trading
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

-- 2. Habilitação de Segurança em Nível de Linha (Row Level Security - RLS)
alter table public.trading_plans enable row level security;

-- 3. Políticas de acesso flexíveis para chave anônima (anon public key)
-- Permite leitura de planos
drop policy if exists "Permitir leitura de planos" on public.trading_plans;
create policy "Permitir leitura de planos"
  on public.trading_plans
  for select
  using (true);

-- Permite inserção de novos planos
drop policy if exists "Permitir inserção de planos" on public.trading_plans;
create policy "Permitir inserção de planos"
  on public.trading_plans
  for insert
  with check (true);

-- Permite atualização de planos
drop policy if exists "Permitir atualização de planos" on public.trading_plans;
create policy "Permitir atualização de planos"
  on public.trading_plans
  for update
  using (true)
  with check (true);

-- Permite exclusão se necessário
drop policy if exists "Permitir exclusão de planos" on public.trading_plans;
create policy "Permitir exclusão de planos"
  on public.trading_plans
  for delete
  using (true);

-- 4. Função para atualizar automaticamente o campo updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 5. Trigger de atualização automática de updated_at
drop trigger if exists on_trading_plans_updated on public.trading_plans;
create trigger on_trading_plans_updated
  before update on public.trading_plans
  for each row
  execute function public.handle_updated_at();

-- Conceder permissões para usuários anônimos e autenticados
grant usage on schema public to anon, authenticated;
grant all on public.trading_plans to anon, authenticated;
