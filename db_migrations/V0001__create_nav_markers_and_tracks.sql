
CREATE TABLE IF NOT EXISTS nav_markers (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  color TEXT DEFAULT '#00FFB3',
  icon TEXT DEFAULT 'MapPin',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nav_tracks (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  points JSONB NOT NULL DEFAULT '[]',
  distance_m DOUBLE PRECISION DEFAULT 0,
  duration_s INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nav_markers_session ON nav_markers(session_id);
CREATE INDEX IF NOT EXISTS idx_nav_tracks_session ON nav_tracks(session_id);
