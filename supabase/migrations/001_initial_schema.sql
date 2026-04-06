-- Users are managed by Supabase Auth

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  plan text not null default 'free', -- 'free' | 'pro' | 'multi'
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table public.properties (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  address text,
  ical_url text,
  last_synced_at timestamptz,
  checkout_time time default '11:00',
  notes text,
  created_at timestamptz default now()
);

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  external_uid text not null,
  guest_name text,
  guest_email text,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  platform text, -- 'airbnb' | 'vrbo' | 'booking' | 'direct'
  status text default 'confirmed',
  alert_sent_at timestamptz,
  created_at timestamptz default now(),
  unique(property_id, external_uid)
);

create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  phone text,
  messenger_id text,
  role text default 'cleaning', -- 'cleaning' | 'maintenance' | 'checkin'
  preferred_channel text default 'sms', -- 'sms' | 'messenger' | 'whatsapp'
  active boolean default true,
  created_at timestamptz default now()
);

create table public.cleaning_alerts (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  team_member_id uuid references public.team_members(id) on delete cascade not null,
  channel text not null, -- 'sms' | 'messenger' | 'email'
  message text not null,
  status text default 'pending', -- 'pending' | 'sent' | 'failed'
  sent_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  plan text not null, -- 'free' | 'pro' | 'multi'
  status text not null, -- 'active' | 'canceled' | 'past_due'
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.bookings enable row level security;
alter table public.team_members enable row level security;
alter table public.cleaning_alerts enable row level security;
alter table public.subscriptions enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Owners can manage own properties" on public.properties for all using (auth.uid() = owner_id);

create policy "Owners can manage own bookings" on public.bookings for all using (
  property_id in (select id from public.properties where owner_id = auth.uid())
);

create policy "Owners can manage own team members" on public.team_members for all using (
  property_id in (select id from public.properties where owner_id = auth.uid())
);

create policy "Owners can view own cleaning alerts" on public.cleaning_alerts for all using (
  booking_id in (
    select b.id from public.bookings b
    join public.properties p on p.id = b.property_id
    where p.owner_id = auth.uid()
  )
);

create policy "Owners can view own subscriptions" on public.subscriptions for all using (auth.uid() = owner_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
