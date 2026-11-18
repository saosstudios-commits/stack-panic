import { LEVELS } from '../levels/index.ts';
import type { LevelDef } from '../sim/types.ts';
import type { SaveData } from '../state/storage.ts';

export type ScreenMode = 'title' | 'playing' | 'paused' | 'level_complete' | 'finale';

export interface UICallbacks {
  onStartGame: (levelId: number) => void;
  onNextLevel: () => void;
  onRestart: () => void;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onBackToTitle: () => void;
}

const TAUNTS: Record<number, string> = {
  5: 'Customer is getting hangry...',
  10: 'Maybe hold the boxes tighter?',
  20: 'At this point, it is personal.',
};

export class GameUI {
  private root: HTMLElement;
  private callbacks: UICallbacks;

  private hudEl!: HTMLElement;
  private levelLabelEl!: HTMLElement;
  private deathCountEl!: HTMLElement;
  private stackCountEl!: HTMLElement;
  private leanFillEl!: HTMLElement;
  private toastEl!: HTMLElement;
  private swapPillEl!: HTMLElement;
  private muteHudBtn!: HTMLButtonElement;
  private overlayEl!: HTMLElement;
  private touchEl!: HTMLElement;

  public touchLeftBtn!: HTMLElement;
  public touchRightBtn!: HTMLElement;
  public touchJumpBtn!: HTMLElement;

  private toastTimer = 0;

  constructor(root: HTMLElement, callbacks: UICallbacks) {
    this.root = root;
    this.callbacks = callbacks;
    this.renderScaffold();
  }

  private renderScaffold(): void {
    this.root.innerHTML = `
      <div class="hud hidden" id="hud">
        <div class="hud-group">
          <div class="hud-pill" id="hud-level">L1 · Street Corner</div>
          <div class="hud-pill">
            <span>Deaths:</span>
            <span id="hud-deaths">0</span>
          </div>
          <div class="hud-pill">
            <span id="hud-stack">3</span>
            <div class="lean-bar-wrap"><div class="lean-bar-fill" id="hud-lean"></div></div>
          </div>
        </div>
        <div class="hud-group">
          <button class="icon-btn" id="btn-restart" title="Restart (R)" aria-label="Restart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button class="icon-btn" id="btn-mute" title="Mute (M)" aria-label="Mute"></button>
          <button class="icon-btn" id="btn-pause" title="Pause (Esc)" aria-label="Pause">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="8" y1="5" x2="8" y2="19"/><line x1="16" y1="5" x2="16" y2="19"/></svg>
          </button>
        </div>
      </div>

      <div class="toast-banner" id="toast-banner"></div>
      <div class="swap-pill hidden" id="swap-pill">CONTROLS SWAPPED!</div>

      <div class="touch-controls enabled hidden" id="touch-controls">
        <button class="touch-btn" id="touch-left" aria-label="Move Left">◀</button>
        <button class="touch-btn" id="touch-right" aria-label="Move Right">▶</button>
        <button class="touch-btn" id="touch-jump" aria-label="Jump">▲</button>
      </div>

      <div class="overlay" id="modal-overlay"></div>
    `;

    this.hudEl = this.root.querySelector('#hud')!;
    this.levelLabelEl = this.root.querySelector('#hud-level')!;
    this.deathCountEl = this.root.querySelector('#hud-deaths')!;
    this.stackCountEl = this.root.querySelector('#hud-stack')!;
    this.leanFillEl = this.root.querySelector('#hud-lean')!;
    this.toastEl = this.root.querySelector('#toast-banner')!;
    this.swapPillEl = this.root.querySelector('#swap-pill')!;
    this.muteHudBtn = this.root.querySelector('#btn-mute')!;
    this.overlayEl = this.root.querySelector('#modal-overlay')!;
    this.touchEl = this.root.querySelector('#touch-controls')!;

    this.touchLeftBtn = this.root.querySelector('#touch-left')!;
    this.touchRightBtn = this.root.querySelector('#touch-right')!;
    this.touchJumpBtn = this.root.querySelector('#touch-jump')!;

    this.root.querySelector('#btn-restart')!.addEventListener('click', () => this.callbacks.onRestart());
    this.root.querySelector('#btn-pause')!.addEventListener('click', () => this.callbacks.onPauseToggle());
    this.muteHudBtn.addEventListener('click', () => this.callbacks.onMuteToggle());
  }

  private speakerSvg(muted: boolean): string {
    return muted
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/></svg>`;
  }

  updateHud(
    level: LevelDef,
    deathsThisLevel: number,
    stackCount: number,
    leanRatio: number,
    inDanger: boolean,
    controlsSwapped: boolean,
    muted: boolean,
    dt: number
  ): void {
    this.levelLabelEl.textContent = `L${level.id} · ${level.name}`;
    this.deathCountEl.textContent = String(deathsThisLevel);
    this.stackCountEl.textContent = `${stackCount}📦`;

    const pct = Math.min(100, Math.round(leanRatio * 100));
    this.leanFillEl.style.width = `${pct}%`;
    this.leanFillEl.classList.toggle('danger', inDanger);
    this.swapPillEl.classList.toggle('hidden', !controlsSwapped);
    this.muteHudBtn.innerHTML = this.speakerSvg(muted);

    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) {
        this.toastEl.classList.remove('visible');
      }
    }
  }

  triggerDeathFeedback(deathsThisLevel: number): void {
    this.deathCountEl.classList.remove('death-pop');
    void this.deathCountEl.offsetWidth;
    this.deathCountEl.classList.add('death-pop');

    const taunt = TAUNTS[deathsThisLevel];
    if (taunt) {
      this.showToast(taunt);
    }
  }

  showToast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('visible');
    this.toastTimer = 2.4;
  }

  showScreen(
    mode: ScreenMode,
    save: SaveData,
    currentLevel: LevelDef,
    stats?: { levelTime: number; levelDeaths: number; delivered: number; totalTime: number }
  ): void {
    this.muteHudBtn.innerHTML = this.speakerSvg(save.muted);

    if (mode === 'playing') {
      this.hudEl.classList.remove('hidden');
      this.touchEl.classList.remove('hidden');
      this.overlayEl.classList.add('hidden');
      return;
    }

    this.hudEl.classList.toggle('hidden', mode === 'title');
    this.touchEl.classList.add('hidden');
    this.overlayEl.classList.remove('hidden');

    if (mode === 'title') {
      const levelButtons = LEVELS.map((lvl) => {
        const id = lvl.id;
        const locked = id > save.unlockedLevel;
        return `<button class="lvl-btn ${locked ? 'locked' : ''}" data-lvl="${id}" ${locked ? 'disabled' : ''}>${id}</button>`;
      }).join('');

      this.overlayEl.innerHTML = `
        <div class="card">
          <h1 class="game-title">STACK PANIC</h1>
          <p class="subtitle">Hot &amp; Fresh! (Mostly) · ${LEVELS.length} Troll Delivery Levels</p>
          <div class="btn-row">
            <button class="btn btn-primary" id="ui-play">Play Level ${save.unlockedLevel}</button>
            <button class="btn" id="ui-mute">${save.muted ? 'Sound: OFF' : 'Sound: ON'}</button>
          </div>
          ${save.unlockedLevel > 1 ? `<div class="level-grid">${levelButtons}</div>` : ''}
          <p class="controls-hint">Move: A/D or Arrows · Jump: Space/W/Up (tap for short hop!) · R: Restart</p>
        </div>
      `;

      this.overlayEl.querySelector('#ui-play')!.addEventListener('click', () => {
        this.callbacks.onStartGame(save.unlockedLevel);
      });
      this.overlayEl.querySelector('#ui-mute')!.addEventListener('click', () => {
        this.callbacks.onMuteToggle();
      });
      this.overlayEl.querySelectorAll<HTMLButtonElement>('.lvl-btn:not(.locked)').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.callbacks.onStartGame(Number(btn.dataset.lvl));
        });
      });
    } else if (mode === 'paused') {
      const levelButtons = LEVELS.map((lvl) => {
        const id = lvl.id;
        const locked = id > save.unlockedLevel;
        const cur = id === currentLevel.id ? 'current' : '';
        return `<button class="lvl-btn ${locked ? 'locked' : ''} ${cur}" data-lvl="${id}" ${locked ? 'disabled' : ''}>${id}</button>`;
      }).join('');

      this.overlayEl.innerHTML = `
        <div class="card">
          <h2 class="game-title" style="font-size:30px">PAUSED</h2>
          <p class="subtitle">L${currentLevel.id} · ${currentLevel.name}</p>
          <div class="btn-row">
            <button class="btn btn-primary" id="ui-resume">Resume</button>
            <button class="btn btn-secondary" id="ui-restart">Restart</button>
            <button class="btn" id="ui-mute">${save.muted ? 'Unmute' : 'Mute'}</button>
            <button class="btn" id="ui-title">Title</button>
          </div>
          <div class="level-grid">${levelButtons}</div>
        </div>
      `;

      this.overlayEl.querySelector('#ui-resume')!.addEventListener('click', () => this.callbacks.onPauseToggle());
      this.overlayEl.querySelector('#ui-restart')!.addEventListener('click', () => this.callbacks.onRestart());
      this.overlayEl.querySelector('#ui-mute')!.addEventListener('click', () => this.callbacks.onMuteToggle());
      this.overlayEl.querySelector('#ui-title')!.addEventListener('click', () => this.callbacks.onBackToTitle());
      this.overlayEl.querySelectorAll<HTMLButtonElement>('.lvl-btn:not(.locked)').forEach((btn) => {
        btn.addEventListener('click', () => this.callbacks.onStartGame(Number(btn.dataset.lvl)));
      });
    } else if (mode === 'level_complete' && stats) {
      this.overlayEl.innerHTML = `
        <div class="card">
          <h2 class="game-title" style="font-size:32px">DELIVERED!</h2>
          <p class="subtitle">L${currentLevel.id} · ${currentLevel.name}</p>
          <div class="stats-grid">
            <div class="stat-box"><div class="stat-label">Time</div><div class="stat-val">${stats.levelTime.toFixed(1)}s</div></div>
            <div class="stat-box"><div class="stat-label">Deaths</div><div class="stat-val">${stats.levelDeaths}</div></div>
            <div class="stat-box"><div class="stat-label">Boxes</div><div class="stat-val">${stats.delivered}</div></div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="ui-next">Next Shift ▶</button>
            <button class="btn" id="ui-replay">Replay</button>
          </div>
        </div>
      `;
      this.overlayEl.querySelector('#ui-next')!.addEventListener('click', () => this.callbacks.onNextLevel());
      this.overlayEl.querySelector('#ui-replay')!.addEventListener('click', () => this.callbacks.onRestart());
    } else if (mode === 'finale' && stats) {
      this.overlayEl.innerHTML = `
        <div class="card">
          <h2 class="game-title" style="font-size:32px">SHIFT COMPLETE!</h2>
          <p class="subtitle">You survived all ${LEVELS.length} troll deliveries!</p>
          <div class="stats-grid">
            <div class="stat-box"><div class="stat-label">Total Time</div><div class="stat-val">${stats.totalTime.toFixed(1)}s</div></div>
            <div class="stat-box"><div class="stat-label">Total Deaths</div><div class="stat-val">${save.totalDeaths}</div></div>
            <div class="stat-box"><div class="stat-label">VIP Boxes</div><div class="stat-val">${stats.delivered}</div></div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="ui-replay-all">Play Again</button>
            <button class="btn" id="ui-title">Title</button>
          </div>
        </div>
      `;
      this.overlayEl.querySelector('#ui-replay-all')!.addEventListener('click', () => this.callbacks.onStartGame(1));
      this.overlayEl.querySelector('#ui-title')!.addEventListener('click', () => this.callbacks.onBackToTitle());
    }
  }
}
