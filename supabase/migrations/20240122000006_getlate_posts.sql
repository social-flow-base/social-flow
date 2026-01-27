-- New version of getlate_posts
create table public.getlate_posts (
  id uuid primary key default gen_random_uuid(),

  -- Internal user
  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  -- GetLate IDs
  external_id text unique, -- result.post._id
  external_user_id text,   -- result.post.userId

  title text default '',
  content text not null,

  media_items jsonb default '[]'::jsonb,
  platforms jsonb default '[]'::jsonb,

  scheduled_for timestamptz,
  timezone text default 'UTC',

  status text not null default 'draft',

  tags jsonb default '[]'::jsonb,
  hashtags jsonb default '[]'::jsonb,
  mentions jsonb default '[]'::jsonb,

  visibility text default 'public',
  crossposting_enabled boolean default true,

  metadata jsonb default '{}'::jsonb,
  publish_attempts integer default 0,

  content_hash text,

  -- IMPORTANT
  external_raw jsonb not null, -- SIMPAN SEMUA RESPONSE

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
