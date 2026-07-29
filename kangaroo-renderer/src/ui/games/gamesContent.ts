/** Hand-maintained list of HTML mini-games under public/games/.
 * Drop a self-contained game folder into public/games/<id>/ and register
 * it here — no build-time scan. See public/games/README.txt. */

export type GameEntry = {
  id: string;
  title: string;
  description?: string;
  /** Path under public/, e.g. '/games/number-puzzle/index.html'. */
  fileSrc: string;
};

/** Games shown in the 小游戏 tab, in display order. */
export const GAMES: GameEntry[] = [
  // Example — uncomment after placing files under public/games/number-puzzle/:
  {
    id: 'red-green-light',
    title: 'Red Light Green Light',
    description: '4 step method to build a game',
    fileSrc: '/games/MK_G5_6_26_Summer_red-light-green-light.html',
  },
];
