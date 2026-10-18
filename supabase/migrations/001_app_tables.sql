-- LeadLens app tables (additive and idempotent). RLS is on with no public policies:
-- the app reads and writes only through server routes using the service role key.
create table if not exists ll_leads (
  id              uuid primary key default gen_random_uuid(),
  business_type   text not null,
  brand_name      text not null,
  email_content   text not null,
  score           integer not null check (score between 0 and 100),
  tier            text not null check (tier in ('Hot','Warm','Cold')),
  reason          text,
  intent          text,
  urgency         text,
  budget_signal   text,
  drafted_reply   text,
  next_steps      text[],
  session_id      text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_ll_leads_tier       on ll_leads (tier);
create index if not exists idx_ll_leads_created_at on ll_leads (created_at desc);
create index if not exists idx_ll_leads_session    on ll_leads (session_id);

create table if not exists ll_settings (
  id                    uuid primary key default '00000000-0000-0000-0000-000000000001',
  default_business_type text default 'Marketing Agency',
  default_brand_name    text default '',
  updated_at            timestamptz default now()
);
insert into ll_settings (id) values ('00000000-0000-0000-0000-000000000001') on conflict (id) do nothing;

alter table ll_leads enable row level security;
alter table ll_settings enable row level security;
