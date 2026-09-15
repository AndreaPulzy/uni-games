import { io, type Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import type { RoomState } from '@shared/types.ts';

export const socket: Socket = io({ autoConnect: true, transports: ['websocket', 'polling'] });

export function emit<T = unknown>(event: string, payload?: unknown): Promise<T> {
  return new Promise((resolve) => {
    if (payload === undefined) socket.emit(event, resolve);
    else socket.emit(event, payload, resolve);
  });
}

/** "Avanti" di regia, dalla TV o dal telefono del regista. L'etichetta vista
 *  viene rimandata al server: se qualcuno ha gia' fatto avanzare la partita,
 *  il secondo tocco viene ignorato invece di saltare una fase. */
export function advance(room: RoomState) {
  return emit<{ ok: boolean; error?: string }>('host:next', { expect: room.directorAction ?? undefined });
}

/** Snapshot pubblico della stanza, aggiornato dal server. */
export function useRoom(): RoomState | null {
  const [room, setRoom] = useState<RoomState | null>(null);
  useEffect(() => {
    const on = (s: RoomState) => setRoom(s);
    socket.on('room', on);
    return () => { socket.off('room', on); };
  }, []);
  return room;
}

/** Vista privata del giocatore corrente. */
export function usePrivate<T>(): T | null {
  const [view, setView] = useState<T | null>(null);
  useEffect(() => {
    const on = (v: { game: T }) => setView(v.game);
    socket.on('private', on);
    return () => { socket.off('private', on); };
  }, []);
  return view;
}

/** Eventi rapidi del minigioco (per esempio i tratti del disegno in diretta).
 *  Il gestore piu' recente viene sempre usato, senza riabbonarsi a ogni render. */
export function useGameEvent(handler: (e: { name: string; data: any }) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const on = (e: { name: string; data: any }) => ref.current(e);
    socket.on('game:event', on);
    return () => { socket.off('game:event', on); };
  }, []);
}

export interface ToastMsg { id: number; kind: 'info' | 'good' | 'bad'; text: string }

export function useToasts(): ToastMsg[] {
  const [list, setList] = useState<ToastMsg[]>([]);
  useEffect(() => {
    let n = 0;
    const on = (t: { kind: ToastMsg['kind']; text: string }) => {
      const msg = { ...t, id: ++n };
      setList((l) => [...l, msg]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== msg.id)), 2600);
    };
    socket.on('toast', on);
    return () => { socket.off('toast', on); };
  }, []);
  return list;
}

/** Countdown allineato all'orologio del server (compensa il drift del device). */
export function useCountdown(deadline: number | null, serverNow: number): number {
  const [, force] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => { setOffset(serverNow - Date.now()); }, [serverNow]);
  useEffect(() => {
    if (!deadline) return;
    const t = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [deadline]);

  if (!deadline) return 0;
  return Math.max(0, deadline - (Date.now() + offset));
}

export function fmtTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : String(s);
}
