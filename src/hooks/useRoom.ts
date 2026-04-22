// ============================
// useRoom: Hook for Supabase room management & realtime sync
// ============================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateBoard, type HexCell } from '@/lib/gameLogic';

export type BuzzerState = 'idle' | 'open' | 'locked' | 'rebound' | 'cooldown';

export interface RoomData {
  id: string;
  pin: string;
  room_code?: string | null;
  host_id: string | null;
  host_name: string;
  status: string;
  current_hex_index: number | null;
  buzzer_state: string;
  buzzer_team: string | null;
  rebound_expires_at: string | null;
  cooldown_expires_at: string | null;
  current_turn: string;
  board: HexCell[] | null;
  team1_score: number;
  team2_score: number;
  team1_name: string;
  team2_name: string;
  team1_color: string;
  team2_color: string;
  created_at: string;
}

export interface PlayerData {
  id: string;
  room_id: string;
  user_id: string | null;
  name: string;
  team: string;
  avatar_url: string | null;
  is_captain: boolean;
  created_at: string;
}

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Generate readable 8-char code (no ambiguous chars: 0/O, 1/I)
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useRoom() {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new room (host only)
  const createRoom = useCallback(async (hostName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const pin = generatePin();
      const room_code = generateRoomCode();
      const board = generateBoard();

      const { data, error: err } = await supabase
        .from('rooms')
        .insert({
          pin,
          room_code,
          host_id: user?.id ?? null,
          host_name: hostName,
          board: board as any,
        } as any)
        .select()
        .single();

      if (err) throw err;
      // Note: no separate PLAYER activation_code is created.
      // The room_code itself is the join code (unlimited uses, expires when
      // the host closes the room or after 24h — enforced in GuestJoin).
      setRoom(data as unknown as RoomData);
      return data as unknown as RoomData;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join an existing room by PIN
  const joinRoom = useCallback(async (pin: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('pin', pin)
        .single();

      if (err || !data) throw new Error('الغرفة غير موجودة');
      setRoom(data as unknown as RoomData);
      return data as unknown as RoomData;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${room.id}`,
      }, (payload) => {
        setRoom(payload.new as unknown as RoomData);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${room.id}`,
      }, () => {
        // Refetch players on any change
        supabase.from('players').select('*').eq('room_id', room.id).then(({ data }) => {
          if (data) setPlayers(data as unknown as PlayerData[]);
        });
      })
      .subscribe();

    // Initial fetch of players
    supabase.from('players').select('*').eq('room_id', room.id).then(({ data }) => {
      if (data) setPlayers(data as unknown as PlayerData[]);
    });

    return () => { supabase.removeChannel(channel); };
  }, [room?.id]);

  // Update room data (host only)
  const updateRoom = useCallback(async (updates: Partial<RoomData>) => {
    if (!room?.id) return;
    const { error: err } = await supabase
      .from('rooms')
      .update(updates as any)
      .eq('id', room.id);
    if (err) console.error('Room update error:', err);
  }, [room?.id]);

  return { room, players, loading, error, createRoom, joinRoom, updateRoom, setRoom };
}
