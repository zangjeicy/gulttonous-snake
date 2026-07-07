/**
 * Renderer — Canvas 渲染主类
 * 清屏、绘制背景网格、协调各子渲染器、绘制粒子特效
 */
import { SnakeRenderer } from './SnakeRenderer.js';
import { FoodRenderer } from './FoodRenderer.js';
import { Effects } from './Effects.js';

export class Renderer {
  constructor(ctx, grid = null) {
    this.ctx = ctx;
    this.grid = grid;
    this.size = grid ? grid.canvasSize : 600;

    this.snakeRenderer = new SnakeRenderer();
    this.foodRenderer = new FoodRenderer();
    this.effects = new Effects();
  }

  /** 主渲染入口 */
  render(data) {
    const { state, snake, food, grid } = data;

    // 清屏
    this._clear();

    // 绘制背景
    this._drawBackground();

    // 绘制食物（IDLE 状态下不绘制）
    if (food.position && state !== 'idle') {
      this.foodRenderer.render(this.ctx, food, grid);
    }

    // 绘制蛇（IDLE 状态也绘制，作为开始界面背景）
    if (snake && snake.body.length > 0) {
      this.snakeRenderer.render(this.ctx, snake, grid);
    }

    // 更新并绘制粒子特效
    this.effects.update();
    this.effects.render(this.ctx);

    // 暂停状态半透明遮罩（CSS overlay 处理，这里不做）
  }

  _clear() {
    this.ctx.clearRect(0, 0, this.size, this.size);
  }

  _drawBackground() {
    const ctx = this.ctx;
    const { cols, rows, cellSize } = this.grid;

    // 深色基底渐变
    const bgGradient = ctx.createRadialGradient(
      this.size / 2, this.size / 2, 0,
      this.size / 2, this.size / 2, this.size * 0.7
    );
    bgGradient.addColorStop(0, '#0f1525');
    bgGradient.addColorStop(1, '#080c16');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.size, this.size);

    // 网格线
    ctx.strokeStyle = 'rgba(0, 255, 163, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= cols; x++) {
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, rows * cellSize);
    }
    for (let y = 0; y <= rows; y++) {
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(cols * cellSize, y * cellSize);
    }
    ctx.stroke();

    // 边框辉光
    ctx.strokeStyle = 'rgba(0, 255, 163, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, this.size - 2, this.size - 2);
  }

  /** 触发吃食物特效 */
  triggerEat(position) {
    const { cx, cy } = this.grid.cellToPixelCenter(position.x, position.y);
    this.effects.burst(cx, cy, '#00ffa3');
    this.effects.burst(cx, cy, '#ff2e88');
  }

  /** 触发死亡爆炸 */
  triggerDeath(snakeBody) {
    this.effects.explosion(snakeBody, this.grid.cellSize);
  }

  /** 清除特效 */
  clearEffects() {
    this.effects.clear();
  }
}
