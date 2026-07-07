/**
 * Food — 食物实体
 * 管理食物位置、生成、脉冲动画状态
 */
export class Food {
  constructor(grid) {
    this.grid = grid;
    this.position = null;
    this.pulsePhase = 0; // 脉冲动画相位
  }

  /**
   * 在不与蛇身重叠的位置生成食物
   * @param {Array<{x,y}>} snakeBody - 蛇身格子列表
   * @returns {boolean} 是否成功生成
   */
  respawn(snakeBody = []) {
    const cell = this.grid.randomCell(snakeBody);
    if (!cell) return false;
    this.position = cell;
    this.pulsePhase = 0;
    return true;
  }

  /** 更新脉冲动画相位（每帧调用） */
  update(dt) {
    this.pulsePhase += dt * 0.005;
  }

  /** 获取脉冲缩放因子 0.85~1.0 */
  get pulseScale() {
    return 0.85 + Math.sin(this.pulsePhase) * 0.15;
  }
}
