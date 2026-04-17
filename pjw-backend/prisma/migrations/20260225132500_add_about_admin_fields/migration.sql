ALTER TABLE public.org_info
ADD COLUMN IF NOT EXISTS date_started DATE;

CREATE TABLE IF NOT EXISTS public.executive_team_entries (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    photo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0
);
