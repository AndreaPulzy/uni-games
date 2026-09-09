import type { RoomState } from '@shared/types.ts';
import { TeamCardTV, type TeamPub } from './TeamCardTV.tsx';

export function TabooTV({ room }: { room: RoomState }) {
  return (
    <TeamCardTV
      room={room}
      presenterLabel="Suggerisce"
      solverLabel="Indovinano"
      extra={(pub: TeamPub) =>
        pub.buzzed ? <div className="dim">Buzzer premuti: {pub.buzzed}</div> : null
      }
    />
  );
}

export function IntesaVincenteTV({ room }: { room: RoomState }) {
  return <TeamCardTV room={room} presenterLabel="Suggeritori" solverLabel="Risolutore" />;
}

export function MimoTV({ room }: { room: RoomState }) {
  return <TeamCardTV room={room} presenterLabel="Mima" solverLabel="Indovinano" />;
}
