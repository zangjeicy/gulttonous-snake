/**
 * InputManager — 输入管理
 * 键盘事件、触屏滑动手势、虚拟方向键
 */
export class InputManager {
  /**
   * @param {Object} handlers
   * @param {Function} [handlers.onDirection] - (direction: string) => void
   * @param {Function} [handlers.onStart] - () => void
   * @param {Function} [handlers.onPause] - () => void
   * @param {Function} [handlers.onResume] - () => void
   * @param {Function} [handlers.onReset] - () => void
   */
  constructor(handlers = {}) {
    this.handlers = handlers;
    this._keyHandler = null;
    this._touchStart = null;
    this._touchHandler = null;
  }

  /** 绑定键盘事件 */
  attach() {
    this._keyHandler = (e) => this._onKey(e);
    window.addEventListener('keydown', this._keyHandler, { passive: false });

    // 绑定虚拟方向键
    this._bindDpad();

    // 绑定触屏滑动
    this._bindTouchSwipe();
  }

  /** 解绑 */
  detach() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
    }
  }

  _onKey(e) {
    const key = e.key;

    // 方向键
    const dirMap = {
      'ArrowUp': 'up', 'ArrowDown': 'down',
      'ArrowLeft': 'left', 'ArrowRight': 'right',
      'w': 'up', 's': 'down', 'a': 'left', 'd': 'right',
      'W': 'up', 'S': 'down', 'A': 'left', 'D': 'right',
    };

    if (dirMap[key]) {
      e.preventDefault();
      this.handlers.onDirection?.(dirMap[key]);
      return;
    }

    // 空格：开始/继续
    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      this.handlers.onStart?.();
      return;
    }

    // P：暂停/继续
    if (key === 'p' || key === 'P') {
      e.preventDefault();
      this.handlers.onPause?.();
      return;
    }

    // R：重新开始
    if (key === 'r' || key === 'R') {
      e.preventDefault();
      this.handlers.onReset?.();
      return;
    }
  }

  _bindDpad() {
    const buttons = document.querySelectorAll('.dpad-btn');
    buttons.forEach((btn) => {
      const handler = (e) => {
        e.preventDefault();
        const dir = btn.getAttribute('data-direction');
        if (dir) this.handlers.onDirection?.(dir);
      };
      btn.addEventListener('touchstart', handler, { passive: false });
      btn.addEventListener('click', handler);
    });
  }

  _bindTouchSwipe() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this._touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (!this._touchStart || !e.changedTouches[0]) return;

      const dx = e.changedTouches[0].clientX - this._touchStart.x;
      const dy = e.changedTouches[0].clientY - this._touchStart.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 20;

      if (Math.max(absDx, absDy) < threshold) {
        this._touchStart = null;
        return;
      }

      if (absDx > absDy) {
        this.handlers.onDirection?.(dx > 0 ? 'right' : 'left');
      } else {
        this.handlers.onDirection?.(dy > 0 ? 'down' : 'up');
      }

      this._touchStart = null;
    }, { passive: true });
  }
}
