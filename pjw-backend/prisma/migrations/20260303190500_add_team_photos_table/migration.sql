CREATE TABLE IF NOT EXISTS public.team_photos (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    photo_url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT
);
