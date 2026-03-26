// ============================
// useBuzzer: Supabase Realtime Broadcast for ultra-low latency buzzer
// Implements the 6-state buzzer state machine
// ============================
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type BuzzerState = 'idle' | 'open' | 'locked' | 'rebound' | 'cooldown';

interface BuzzerPayload {
  type: 'buzz' | 'state_change' | 'rebound_start' | 'cooldown_start';
  team: 'team1' | 'team2';
  buzzerState: BuzzerState;
  timestamp: number;
}

export function useBuzzer(roomId: string | null, isHost: boolean) {
  const [buzzerState, setBuzzerState] = useState<BuzzerState>('idle');
  const [buzzedTeam, setBuzzedTeam] = useState<'team1' | 'team2' | null>(null);
  const [lockedOutTeam, setLockedOutTeam] = useState<'team1' | 'team2' | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const reboundTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`buzzer-${roomId}`, {
      config: { broadcast: { self: true } },
    });

    channel.on('broadcast', { event: 'buzzer' }, ({ payload }: { payload: BuzzerPayload }) => {
      switch (payload.type) {
        case 'buzz':
          setBuzzerState('locked');
          setBuzzedTeam(payload.team);
          break;
        case 'state_change':
          setBuzzerState(payload.buzzerState);
          if (payload.buzzerState === 'open') {
            setBuzzedTeam(null);
            setLockedOutTeam(null);
          }
          break;
        case 'rebound_start':
          setBuzzerState('rebound');
          setLockedOutTeam(payload.team); // The team that got it wrong
          break;
        case 'cooldown_start':
          setBuzzerState('cooldown');
          setLockedOutTeam(payload.team);
          break;
      }
    }).subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (reboundTimerRef.current) clearTimeout(reboundTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [roomId]);

  // Player buzzes in
  const buzz = useCallback((team: 'team1' | 'team2') => {
    if (buzzerState !== 'open' && buzzerState !== 'rebound' && buzzerState !== 'cooldown') return;
    if (buzzerState === 'rebound' && team === lockedOutTeam) return;
    if (buzzerState === 'cooldown' && team === lockedOutTeam) return;

    channelRef.current?.send({
      type: 'broadcast',
      event: 'buzzer',
      payload: { type: 'buzz', team, buzzerState: 'locked', timestamp: Date.now() },
    });
  }, [buzzerState, lockedOutTeam]);

  // Host: open the floor
  const openFloor = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'buzzer',
      payload: { type: 'state_change', team: 'team1', buzzerState: 'open', timestamp: Date.now() },
    });
  }, []);

  // Host: start 10s rebound for the opposing team
  const startRebound = useCallback((wrongTeam: 'team1' | 'team2') => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'buzzer',
      payload: { type: 'rebound_start', team: wrongTeam, buzzerState: 'rebound', timestamp: Date.now() },
    });

    // After 10s, open floor with 3s cooldown on wrong team
    reboundTimerRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: 'broadcast',
        event: 'buzzer',
        payload: { type: 'cooldown_start', team: wrongTeam, buzzerState: 'cooldown', timestamp: Date.now() },
      });

      // After 3s cooldown, fully open
      cooldownTimerRef.current = setTimeout(() => {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'buzzer',
          payload: { type: 'state_change', team: 'team1', buzzerState: 'open', timestamp: Date.now() },
        });
      }, 3000);
    }, 10000);
  }, []);

  // Host: reset to idle
  const resetBuzzer = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'buzzer',
      payload: { type: 'state_change', team: 'team1', buzzerState: 'idle', timestamp: Date.now() },
    });
    setBuzzedTeam(null);
    setLockedOutTeam(null);
  }, []);

  return { buzzerState, buzzedTeam, lockedOutTeam, buzz, openFloor, startRebound, resetBuzzer };
}
