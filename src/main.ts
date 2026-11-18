import './styles.css';
import { SoundEngine } from './audio/soundEngine.ts';
import { InputManager } from './input/inputManager.ts';
import { getLevel, LEVELS } from './levels/index.ts';
import { PALETTE } from './render/palette.ts';
import { GameRenderer } from './render/gameRenderer.ts';
import { FIXED_DT, SLOW_MO_DURATION, SLOW_MO_SCALE } from './sim/constants.ts';
import { createSimState, stepSim } from './sim/simulation.ts';
import type { LevelDef, SimState } from './sim/types.ts';
import { loadSave, persistSave, type SaveData } from './state/storage.ts';
import { GameUI, type ScreenMode } from './ui/gameUI.ts';

const stageEl = document.getElementById('stage')!;
const canvasEl = document.getElementById('game-canvas') as HTMLCanvasElement;
const uiRootEl = document.getElementById('ui-root')!;

let save: SaveData = loadSave();
let currentLevel: LevelDef = getLevel(save.unlockedLevel);
let sim: SimState = createSimState(currentLevel);
let screenMode: ScreenMode = 'title';
let levelElapsedTotal = 0;
let runTotalTime = 0;
let slowMoTimer = 0;
let winShowTimer = 0;
let winShown = false;

const sound = new SoundEngine();
sound.setMuted(save.muted);

const renderer = new GameRenderer(canvasEl);
renderer.loadLevel(currentLevel);

const ui = new GameUI(uiRootEl, {
  onStartGame: (lvlId) => {
    sound.unlock();
    sound.playUiClick();
    sound.startAmbient();
    if (lvlId === 1) runTotalTime = 0;
    startLevel(lvlId);
  },
  onNextLevel: () => {
    sound.playUiClick();
    const nextId = currentLevel.id + 1;
    if (nextId <= LEVELS.length) {
      startLevel(nextId);
    }
  },
  onRestart: () => {
    sound.playUiClick();
    resetCurrentLevel();
  },
  onPauseToggle: () => {
    sound.playUiClick();
    if (screenMode === 'playing') {
      screenMode = 'paused';
      ui.showScreen('paused', save, currentLevel);
    } else if (screenMode === 'paused') {
      screenMode = 'playing';
      ui.showScreen('playing', save, currentLevel);
    }
  },
  onMuteToggle: () => {
    save.muted = !save.muted;
    sound.setMuted(save.muted);
    persistSave(save);
    if (screenMode !== 'playing') {
      ui.showScreen(screenMode, save, currentLevel);
    }
  },
  onBackToTitle: () => {
    sound.playUiClick();
    screenMode = 'title';
    ui.showScreen('title', save, currentLevel);
  },
});

const input = new InputManager({
  onFirstInput: () => {
    sound.unlock();
  },
  onRestart: () => {
    if (screenMode === 'playing' || screenMode === 'paused') {
      resetCurrentLevel();
    }
  },
  onPauseToggle: () => {
    if (screenMode === 'playing') {
      screenMode = 'paused';
      ui.showScreen('paused', save, currentLevel);
    } else if (screenMode === 'paused') {
      screenMode = 'playing';
      ui.showScreen('playing', save, currentLevel);
    }
  },
  onMuteToggle: () => {
    save.muted = !save.muted;
    sound.setMuted(save.muted);
    persistSave(save);
    if (screenMode !== 'playing') {
      ui.showScreen(screenMode, save, currentLevel);
    }
  },
});

input.bindTouchButton(ui.touchLeftBtn, 'left');
input.bindTouchButton(ui.touchRightBtn, 'right');
input.bindTouchButton(ui.touchJumpBtn, 'jump');

function startLevel(levelId: number): void {
  currentLevel = getLevel(levelId);
  renderer.loadLevel(currentLevel);
  resetCurrentLevel();
  screenMode = 'playing';
  ui.showScreen('playing', save, currentLevel);
}

function resetCurrentLevel(): void {
  sim = createSimState(currentLevel);
  slowMoTimer = 0;
  winShowTimer = 0;
  winShown = false;
  levelElapsedTotal = 0;
  if (screenMode === 'paused') {
    screenMode = 'playing';
    ui.showScreen('playing', save, currentLevel);
  }
}

function handleResize(): void {
  const rect = stageEl.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    renderer.resize(rect.width, rect.height);
  }
}

window.addEventListener('resize', handleResize);
window.addEventListener('blur', () => {
  if (screenMode === 'playing') {
    screenMode = 'paused';
    ui.showScreen('paused', save, currentLevel);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && screenMode === 'playing') {
    screenMode = 'paused';
    ui.showScreen('paused', save, currentLevel);
  }
});

handleResize();
ui.showScreen('title', save, currentLevel);

// Fixed-timestep accumulator loop
let lastTime = performance.now();
let accumulator = 0;

function tick(now: number): void {
  requestAnimationFrame(tick);
  const rawDt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
  lastTime = now;

  if (screenMode === 'playing') {
    let simScale = 1.0;
    if (slowMoTimer > 0) {
      slowMoTimer = Math.max(0, slowMoTimer - rawDt);
      simScale = SLOW_MO_SCALE;
    }

    if (sim.phase === 'playing') {
      levelElapsedTotal += rawDt;
    }

    accumulator += rawDt * simScale;
    const inputState = input.getInput();

    while (accumulator >= FIXED_DT) {
      stepSim(sim, inputState, FIXED_DT);
      accumulator -= FIXED_DT;

      for (const ev of sim.events) {
        switch (ev.type) {
          case 'jump':
            sound.playJump();
            break;
          case 'land':
            sound.playLand();
            renderer.spawnParticles(ev.x, ev.y, 4, PALETTE.creamRim, 2.2);
            break;
          case 'pickup':
            sound.playPickup();
            renderer.spawnParticles(ev.x, ev.y, 8, PALETTE.orangeBright, 3.8);
            break;
          case 'stack_danger':
            sound.playDangerWobble();
            break;
          case 'trap_trigger':
            sound.playTrapTrigger();
            renderer.addShake(0.18);
            break;
          case 'trap_telegraph':
            sound.playTrapTelegraph();
            renderer.spawnParticles(ev.x, ev.y - 0.5, 4, PALETTE.creamWarm, 1.5);
            break;
          case 'controls_swap':
            sound.playControlsSwap();
            break;
          case 'fakeout':
            sound.playWinChime();
            renderer.spawnParticles(ev.x, ev.y + 1.5, 22, PALETTE.bubblegumPink, 6.5);
            renderer.spawnParticles(ev.x, ev.y + 1.5, 22, PALETTE.skyBlue, 6.5);
            renderer.spawnParticles(ev.x, ev.y + 1.5, 22, PALETTE.orangeBright, 6.5);
            break;
          case 'fail': {
            const isExplosive =
              (ev.reason ?? '').includes('spike') ||
              (ev.reason ?? '').includes('ceiling') ||
              (ev.reason ?? '').includes('Fake') ||
              (ev.reason ?? '').includes('moving');
            if (isExplosive) {
              sound.playExplosion();
            } else {
              sound.playFailScatter();
            }
            slowMoTimer = SLOW_MO_DURATION;
            save.deathsByLevel[currentLevel.id] = (save.deathsByLevel[currentLevel.id] ?? 0) + 1;
            save.totalDeaths += 1;
            persistSave(save);
            ui.triggerDeathFeedback(save.deathsByLevel[currentLevel.id]);
            break;
          }
          case 'win':
            sound.playWinChime();
            runTotalTime += levelElapsedTotal;
            if (currentLevel.id < LEVELS.length) {
              save.unlockedLevel = Math.max(save.unlockedLevel, currentLevel.id + 1);
            }
            const prevBest = save.bestTimeByLevel[currentLevel.id];
            if (prevBest === undefined || levelElapsedTotal < prevBest) {
              save.bestTimeByLevel[currentLevel.id] = levelElapsedTotal;
            }
            persistSave(save);
            renderer.spawnParticles(ev.x, ev.y + 1.5, 18, PALETTE.tomatoRed, 5.5);
            renderer.spawnParticles(ev.x, ev.y + 1.5, 18, PALETTE.goldVip, 5.5);
            break;
        }
      }
    }

    if (sim.phase === 'won' && !winShown) {
      winShowTimer += rawDt;
      if (winShowTimer >= 0.85) {
        winShown = true;
        const mode: ScreenMode = currentLevel.id >= LEVELS.length ? 'finale' : 'level_complete';
        screenMode = mode;
        ui.showScreen(mode, save, currentLevel, {
          levelTime: levelElapsedTotal,
          levelDeaths: save.deathsByLevel[currentLevel.id] ?? 0,
          delivered: sim.stack.length,
          totalTime: runTotalTime,
        });
      }
    }

    ui.updateHud(
      currentLevel,
      save.deathsByLevel[currentLevel.id] ?? 0,
      sim.stack.length,
      sim.leanRatio,
      sim.inDanger,
      sim.player.controlsSwapTimer > 0,
      save.muted,
      rawDt
    );
  }

  renderer.render(sim, rawDt);
}

requestAnimationFrame(tick);
