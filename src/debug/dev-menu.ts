/**
 * Dev menu. Gated by the URL flag `?dev=1`. Hidden in production.
 *
 * Lets a developer jump into any phase, give themselves gold, kill an army,
 * reveal the map, etc. Used during playtests and to reproduce bug reports.
 */

export const DEV_FLAG = 'dev';

export function isDevMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(DEV_FLAG) === '1';
}

export interface DevCommand {
  id: string;
  label: string;
  description: string;
  /** Run when the user clicks the button. */
  run: () => void;
}

/** Returns the list of dev commands available in the current session. */
export function getDevCommands(): DevCommand[] {
  return [
    {
      id: 'reveal',
      label: 'Reveal map',
      description: 'Mark all tiles as explored.',
      run: () => console.log('[dev] reveal map: not yet wired in Phase 0'),
    },
    {
      id: 'gold',
      label: '+1000 gold',
      description: 'Add 1000 gold to the player.',
      run: () => console.log('[dev] +1000 gold: not yet wired in Phase 0'),
    },
    {
      id: 'end-turn',
      label: 'End turn',
      description: 'Force end the current turn.',
      run: () => console.log('[dev] end turn: not yet wired in Phase 0'),
    },
  ];
}
