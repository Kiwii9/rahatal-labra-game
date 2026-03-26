
-- Rooms table for game sessions
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL DEFAULT 'رحّال',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_hex_index INTEGER,
  buzzer_state TEXT NOT NULL DEFAULT 'idle' CHECK (buzzer_state IN ('idle', 'open', 'locked', 'rebound', 'cooldown')),
  buzzer_team TEXT CHECK (buzzer_team IN ('team1', 'team2')),
  rebound_expires_at TIMESTAMPTZ,
  cooldown_expires_at TIMESTAMPTZ,
  current_turn TEXT NOT NULL DEFAULT 'team1' CHECK (current_turn IN ('team1', 'team2')),
  board JSONB,
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  team1_name TEXT NOT NULL DEFAULT 'الفريق الأول',
  team2_name TEXT NOT NULL DEFAULT 'الفريق الثاني',
  team1_color TEXT NOT NULL DEFAULT 'terracotta',
  team2_color TEXT NOT NULL DEFAULT 'blue',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('team1', 'team2')),
  avatar_url TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- RLS policies for rooms (public read for joining, authenticated write)
CREATE POLICY "Anyone can read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update own room" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- RLS policies for players
CREATE POLICY "Anyone can read players in a room" ON public.players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can join rooms" ON public.players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players can update own record" ON public.players FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
