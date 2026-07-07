/**
 * Game — 游戏主控制器
 * 管理状态机、固定时间步长逻辑、得分系统、难度递增
 * 协调 Snake / Food / Grid 各模块
 *
 * 渲染由外部循环驱动（main.js），Game 仅暴露 update(dt) 与 getRenderData()
 */
import { Grid } from './Grid.js';
import { Snake, Direction } from './Snake.js';
import { Food } from './Food.js';

export const GameState = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
};

const SPEED = {
  BASE: 150,
  MIN: 70,
  DECREASE_PER_FOOD: 4,
};

const SCORE_PER_FOOD = 10;

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} callbacks - 事件回调
   * @param {Function} [callbacks.onStateChange]
   * @param {Function} [callbacks.onScoreChange]
   * @param {Function} [callbacks.onEat]
   * @param {Function} [callbacks.onGameOver]
   */
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.grid = new Grid();
    this.snake = new Snake(this.grid);
    this.food = new Food(this.grid);

    this.state = GameState.IDLE;
    this.score = 0;
    this.foodCount = 0;
    this.wrapMode = false;

    this._accumulator = 0;
    this._stepInterval = SPEED.BASE;
    this._renderProgress = 0;

    this._setupCanvas();
  }

  /** 适配高清屏，避免锯齿 */
  _setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const size = this.grid.canvasSize;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this._applyScale();
    this.ctx.imageSmoothingEnabled = true;
  }

  /** 重新应用画布缩放（用于 resize 场景） */
  resize() {
    this._setupCanvas();
  }

  _applyScale() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** 当前步进间隔（ms，随进度递减） */
  get stepInterval() {
    return Math.max(SPEED.MIN, SPEED.BASE - this.foodCount * SPEED.DECREASE_PER_FOOD);
  }

  /** 速度倍率（用于 UI 显示） */
  get speedMultiplier() {
    return (SPEED.BASE / this.stepInterval).toFixed(1);
  }

  // ========== 状态控制 ==========

  start() {
    if (this.state === GameState.RUNNING) return;
    if (this.state === GameState.PAUSED) {
      this.resume();
      return;
    }
    // IDLE / GAME_OVER → 全新开始
    this._resetState();
    this.food.respawn(this.snake.body);
    this._setState(GameState.RUNNING);
  }

  pause() {
    if (this.state !== GameState.RUNNING) return;
    this._setState(GameState.PAUSED);
    this._accumulator = 0;
  }

  resume() {
    if (this.state !== GameState.PAUSED) return;
    this._setState(GameState.RUNNING);
  }

  togglePause() {
    if (this.state === GameState.RUNNING) this.pause();
    else if (this.state === GameState.PAUSED) this.resume();
  }

  reset() {
    this._resetState();
    this._setState(GameState.IDLE);
  }

  get canStart() {
    return this.state === GameState.IDLE || this.state === GameState.GAME_OVER;
  }
  get canPause() { return this.state === GameState.RUNNING; }
  get canResume() { return this.state === GameState.PAUSED; }

  _resetState() {
    this.snake.reset();
    this.food.position = null;
    this.score = 0;
    this.foodCount = 0;
    this._accumulator = 0;
    this._stepInterval = SPEED.BASE;
    this._renderProgress = 0;
    this._notifyScore();
  }

  _setState(newState) {
    const old = this.state;
    if (old === newState) return;
    this.state = newState;
    this.callbacks.onStateChange?.(newState, old);
  }

  // ========== 逻辑更新 ==========

  /**
   * 由 外部持久渲染循环调用，每帧传入 delta time
   * 内部使用固定时间步长累积器驱动蛇的移动逻辑
   */
  update(dt) {
    // 食物始终脉冲（视觉动画）
    this.food.update(dt);

    if (this.state === GameState.RUNNING) {
      this._stepInterval = this.stepInterval;
      this._accumulator += dt;

      while (this._accumulator >= this._stepInterval) {
        this._logicStep();
        if (this.state !== GameState.RUNNING) {
          // 死亡：清空累积器，后续不再步进直到重新开始
          this._accumulator = 0;
          break;
        }
        this._accumulator -= this._stepInterval;
      }

      this._renderProgress = this._accumulator / this._stepInterval;
    }
  }

  _logicStep() {
    const result = this.snake.step(this.wrapMode);

    if (result.dead) {
      this._handleGameOver();
      return;
    }

    // 检测吃食物
    if (this.food.position &&
        this.snake.head.x === this.food.position.x &&
        this.snake.head.y === this.food.position.y) {
      this._handleEat();
    }
  }

  _handleEat() {
    this.snake.grow();
    this.score += SCORE_PER_FOOD;
    this.foodCount++;
    this.food.respawn(this.snake.body);
    this._notifyScore();

    this.callbacks.onEat?.({
      position: this.snake.head,
      score: this.score,
    });
  }

  _handleGameOver() {
    const result = {
      score: this.score,
      length: this.snake.length,
      foodCount: this.foodCount,
      body: [...this.snake.body],
    };
    this._setState(GameState.GAME_OVER);
    this.callbacks.onGameOver?.(result);
  }

  _notifyScore() {
    this.callbacks.onScoreChange?.({
      score: this.score,
      foodCount: this.foodCount,
      length: this.snake.length,
      speed: this.speedMultiplier,
    });
  }

  /** 获取渲染所需数据 */
  getRenderData() {
    return {
      state: this.state,
      snake: this.snake,
      food: this.food,
      grid: this.grid,
      score: this.score,
      renderProgress: this._renderProgress,
    };
  }

  // ========== 输入 ==========

  handleDirection(direction) {
    if (this.state !== GameState.RUNNING) return;
    const dirMap = {
      up: Direction.UP,
      down: Direction.DOWN,
      left: Direction.LEFT,
      right: Direction.RIGHT,
    };
    const dir = dirMap[direction];
    if (dir) this.snake.setDirection(dir);
  }
}
