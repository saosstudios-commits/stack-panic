import type { InputState } from '../sim/types.ts';

export interface ActionCallbacks {
  onRestart: () => void;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onFirstInput: () => void;
}

export class InputManager {
  private keys = new Set<string>();
  private touchLeftPointers = new Set<number>();
  private touchRightPointers = new Set<number>();
  private touchJumpPointers = new Set<number>();
  private callbacks: ActionCallbacks;
  private cleanups: Array<() => void> = [];

  constructor(callbacks: ActionCallbacks) {
    this.callbacks = callbacks;
    this.bindKeyboard();
  }

  private bindKeyboard(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      this.callbacks.onFirstInput();
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      if (!e.repeat) {
        if (e.code === 'KeyR') this.callbacks.onRestart();
        if (e.code === 'Escape') this.callbacks.onPauseToggle();
        if (e.code === 'KeyM') this.callbacks.onMuteToggle();
      }
      this.keys.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };

    const onBlur = () => {
      this.keys.clear();
      this.touchLeftPointers.clear();
      this.touchRightPointers.clear();
      this.touchJumpPointers.clear();
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    this.cleanups.push(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    });
  }

  bindTouchButton(el: HTMLElement, role: 'left' | 'right' | 'jump'): void {
    const setRef =
      role === 'left'
        ? this.touchLeftPointers
        : role === 'right'
          ? this.touchRightPointers
          : this.touchJumpPointers;

    const down = (e: PointerEvent) => {
      e.preventDefault();
      this.callbacks.onFirstInput();
      setRef.add(e.pointerId);
      el.classList.add('active');
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if pointer capture unavailable
      }
    };

    const up = (e: PointerEvent) => {
      e.preventDefault();
      setRef.delete(e.pointerId);
      if (setRef.size === 0) el.classList.remove('active');
    };

    el.addEventListener('pointerdown', down, { passive: false });
    el.addEventListener('pointerup', up, { passive: false });
    el.addEventListener('pointercancel', up, { passive: false });
    el.addEventListener('lostpointercapture', up);

    this.cleanups.push(() => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('lostpointercapture', up);
    });
  }

  getInput(): InputState {
    const left =
      this.keys.has('ArrowLeft') ||
      this.keys.has('KeyA') ||
      this.touchLeftPointers.size > 0;
    const right =
      this.keys.has('ArrowRight') ||
      this.keys.has('KeyD') ||
      this.touchRightPointers.size > 0;
    const jump =
      this.keys.has('Space') ||
      this.keys.has('ArrowUp') ||
      this.keys.has('KeyW') ||
      this.touchJumpPointers.size > 0;
    return { left, right, jump };
  }

  dispose(): void {
    for (const fn of this.cleanups) fn();
    this.cleanups.length = 0;
  }
}
