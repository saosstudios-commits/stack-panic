export type LevelTheme = 'street' | 'kitchen' | 'rooftop' | 'alley' | 'plaza';
export type ContainerTheme = 'orange_tub' | 'pizza_box' | 'striped_bucket' | 'vip_gold';
export type PlatformStyle = 'tile' | 'curb' | 'metal' | 'brick' | 'wood' | 'stripe';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlatformDef extends Rect {
  id: string;
  style?: PlatformStyle;
  /** If true, looks identical to a real platform (or subtle tell) but has no collision */
  fake?: boolean;
}

export type TrapType =
  | 'vanish'
  | 'popup_spikes'
  | 'ceiling_drop'
  | 'low_bridge'
  | 'gust'
  | 'wobble_plank'
  | 'conveyor'
  | 'steam_vent'
  | 'trampoline'
  | 'closing_door'
  | 'fake_door'
  | 'runaway_exit'
  | 'controls_swap'
  | 'moving_hazard'
  | 'confetti_fakeout';

export interface TrapDef {
  id: string;
  type: TrapType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Optional trigger zone; if omitted, uses trap's own bounds or triggerDist */
  trigger?: Rect;
  triggerX?: number;
  triggerDist?: number;
  /** Type-specific parameters */
  delay?: number;
  speed?: number;
  forceX?: number;
  impulseY?: number;
  period?: number;
  duration?: number;
  phase?: number;
  targetX?: number;
  targetY?: number;
  minY?: number;
  reverseOnTrigger?: boolean;
  label?: string;
  /** If true on vanish trap, looks cracked & trembles slightly but never actually falls */
  decoy?: boolean;
  /** If true on ceiling_drop, renders as a giant Nuke Block with explosion burst */
  nuke?: boolean;
}

export interface PickupDef {
  id: string;
  x: number;
  y: number;
  addCount: number;
  isBait?: boolean;
}

export interface LevelDef {
  id: number;
  name: string;
  subtitle: string;
  theme: LevelTheme;
  containerTheme: ContainerTheme;
  startX: number;
  startY: number;
  goalX: number;
  goalY: number;
  initialStack: number;
  platforms: PlatformDef[];
  traps: TrapDef[];
  pickups: PickupDef[];
}

export interface ContainerNode {
  offsetX: number;
  velX: number;
  squash: number;
  squashVel: number;
  worldX: number;
  worldY: number;
  tilt: number;
}

export interface TrapRuntime {
  def: TrapDef;
  triggered: boolean;
  active: boolean;
  timer: number;
  /** Current dynamic rect / position / angle for rendering & collision */
  curX: number;
  curY: number;
  curW: number;
  curH: number;
  angle: number;
  angVel: number;
  /** Visual telegraph 0..1 */
  telegraph: number;
  /** Reversed flag for conveyors */
  reversed: boolean;
  /** Vanished flag */
  gone: boolean;
}

export type SimEventType =
  | 'jump'
  | 'land'
  | 'pickup'
  | 'trap_trigger'
  | 'trap_telegraph'
  | 'stack_danger'
  | 'fail'
  | 'win'
  | 'controls_swap'
  | 'fakeout';

export interface SimEvent {
  type: SimEventType;
  x: number;
  y: number;
  trapId?: string;
  reason?: string;
}

export type PlayPhase = 'playing' | 'failing' | 'won';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  facing: 1 | -1;
  grounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
  prevJumpHeld: boolean;
  squashX: number;
  squashY: number;
  runCycle: number;
  controlsSwapTimer: number;
}

export interface SimState {
  level: LevelDef;
  phase: PlayPhase;
  elapsed: number;
  failTimer: number;
  failReason: string;
  player: PlayerState;
  stack: ContainerNode[];
  leanRatio: number;
  inDanger: boolean;
  traps: TrapRuntime[];
  collectedPickups: Set<string>;
  goalX: number;
  goalY: number;
  events: SimEvent[];
  triggeredTrapIds: Set<string>;
}
